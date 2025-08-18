// sidebarContextMenu.js
import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import { getAuthToken, openAuthModal } from "../utils/helpers.js";
import { refreshLibraryContent } from "./flAndUnflPlaylist.js";

let bound = false;
let $menu;

/** Tạo DOM menu tối giản (nếu chưa có) */
function ensureMenu() {
  if ($menu) return $menu;
  $menu = document.createElement("div");
  $menu.id = "sidebar-ctx-menu";
  $menu.className = "context-menu";
  $menu.style.cssText = `
    position:fixed; z-index:9999; display:none;
    min-width: 200px; background:#181818; border:1px solid #2a2a2a; border-radius:8px;
    box-shadow:0 8px 24px rgba(0,0,0,.35); overflow:hidden;
  `;
  $menu.innerHTML = `
    <button class="ctx-item" data-action="playlist:delete"   style="display:none">Delete Playlist</button>
    <button class="ctx-item" data-action="playlist:unfollow" style="display:none">Unfollow Playlist</button>
    <button class="ctx-item" data-action="artist:unfollow"   style="display:none">Unfollow Artist</button>
  `;
  // style buttons gọn gàng
  [...$menu.querySelectorAll(".ctx-item")].forEach((btn) => {
    btn.style.cssText =
      "display:block;width:100%;text-align:left;padding:10px 12px;background:none;border:0;color:#fff;font:inherit;cursor:pointer";
    btn.addEventListener("mouseenter", () => (btn.style.background = "#222"));
    btn.addEventListener(
      "mouseleave",
      () => (btn.style.background = "transparent")
    );
  });
  document.body.appendChild($menu);
  return $menu;
}

/** Mở menu tại vị trí (x,y) và bật/tắt các mục theo kind */
function openMenu(x, y, { id, kind }) {
  ensureMenu();
  $menu.dataset.id = id;
  $menu.dataset.kind = kind;

  // bật/tắt item theo loại
  $menu.querySelector('[data-action="playlist:delete"]').style.display =
    kind === "playlist" ? "block" : "none";
  $menu.querySelector('[data-action="playlist:unfollow"]').style.display =
    kind === "playlist" ? "block" : "none";
  $menu.querySelector('[data-action="artist:unfollow"]').style.display =
    kind === "artist" ? "block" : "none";

  // đặt vị trí, tránh tràn màn hình
  $menu.style.display = "block";
  const menuRect = $menu.getBoundingClientRect();
  const vw = window.innerWidth,
    vh = window.innerHeight;
  const left = Math.min(x, vw - menuRect.width - 8);
  const top = Math.min(y, vh - menuRect.height - 8);
  $menu.style.left = `${left}px`;
  $menu.style.top = `${top}px`;

  // click ra ngoài để đóng
  setTimeout(() => {
    const close = (ev) => {
      if (!ev.target.closest("#sidebar-ctx-menu")) hideMenu();
      document.removeEventListener("mousedown", close, true);
      document.removeEventListener("scroll", hideMenu, true);
      window.removeEventListener("resize", hideMenu);
      document.removeEventListener("keydown", onEsc, true);
    };
    const onEsc = (ev) => {
      if (ev.key === "Escape") {
        hideMenu();
        ev.stopPropagation();
      }
    };
    document.addEventListener("mousedown", close, true);
    document.addEventListener("scroll", hideMenu, true);
    window.addEventListener("resize", hideMenu);
    document.addEventListener("keydown", onEsc, true);
  }, 0);
}

function hideMenu() {
  if ($menu) $menu.style.display = "none";
}

/** Handlers action */
async function onActionClick(e) {
  const btn = e.target.closest(".ctx-item");
  if (!btn || !$menu || $menu.style.display === "none") return;

  const action = btn.dataset.action;
  const id = $menu.dataset.id;
  if (!id) return;

  const token = getAuthToken();
  if (!token) {
    showToast("Bạn cần đăng nhập để sử dụng tính năng này", "warning");
    openAuthModal();
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  try {
    btn.disabled = true;

    if (action === "playlist:delete") {
      // DELETE /playlists/:id
      await httpRequest.del(endpoints.deletePlaylist(id), null, { headers });
      showToast("Đã xóa playlist", "success");
    } else if (action === "playlist:unfollow") {
      // DELETE /playlists/:id/follow
      await httpRequest.del(endpoints.unfollowPlaylist(id), null, { headers });
      showToast("Đã unfollow playlist", "info");
    } else if (action === "artist:unfollow") {
      // DELETE /artists/:id/follow
      await httpRequest.del(endpoints.unfollowArtist(id), null, { headers });
      showToast("Đã unfollow nghệ sĩ", "info");
    } else {
      return;
    }

    // cập nhật sidebar
    if (typeof refreshLibraryContent === "function") {
      await refreshLibraryContent();
    }
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 401 || status === 403) {
      showToast(
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        "warning"
      );
      openAuthModal();
    } else {
      showToast("Thao tác thất bại. Thử lại nhé.", "error");
    }
    console.error("Context menu action error:", err);
  } finally {
    btn.disabled = false;
    hideMenu();
  }
}

/** Bắt right-click trên item sidebar */
function onContextMenu(e) {
  const item = e.target.closest(".library-item");
  if (!item) return;

  e.preventDefault();
  const id = item.dataset.id;
  const kind = item.dataset.kind || "playlist"; // mặc định playlist nếu không gắn
  if (!id) return;

  openMenu(e.clientX, e.clientY, { id, kind });
}

/** Public init */
export function initSidebarContextMenu() {
  if (bound) return;
  bound = true;

  ensureMenu();
  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("click", onActionClick);
}
