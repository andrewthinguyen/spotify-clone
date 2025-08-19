// sidebarContextMenu.js
import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import { getAuthToken, openAuthModal } from "../utils/helpers.js";
import { refreshLibraryContent } from "./flAndUnflPlaylist.js"; // đổi path nếu khác

let isBound = false;
let menuEl = null;

// Tạo context-menu
function createContextMenu() {
  if (menuEl) return menuEl;
  menuEl = document.createElement("div");
  menuEl.id = "sidebar-ctx-menu";
  menuEl.className = "context-menu";
  menuEl.innerHTML = `
    <button class="ctx-item" data-action="playlist:delete"   style="display:none">Delete Playlist</button>
    <button class="ctx-item" data-action="playlist:unfollow" style="display:none">Unfollow Playlist</button>
    <button class="ctx-item" data-action="artist:unfollow"   style="display:none">Unfollow Artist</button>
  `;
  document.body.appendChild(menuEl);
  return menuEl;
}

function hideMenu() {
  if (!menuEl) return;
  menuEl.style.display = "none";
  delete menuEl.dataset.id;
  delete menuEl.dataset.kind;
}

// Mở menu tại (x, y). kind = 'playlist' | 'artist'
function openMenu(x, y, { id, kind }) {
  createContextMenu();
  menuEl.dataset.id = id;
  menuEl.dataset.kind = kind;

  // Hiện đúng item theo loại
  menuEl.querySelector('[data-action="playlist:delete"]').style.display =
    kind === "playlist" ? "block" : "none";

  menuEl.querySelector('[data-action="artist:unfollow"]').style.display =
    kind === "artist" ? "block" : "none";
  menuEl.querySelector('[data-action="playlist:unfollow"]').style.display =
    kind === "flPlaylist" ? "block" : "none";

  // Hiển thị + tính vị trí tránh tràn màn hình
  menuEl.style.display = "block";
  const rect = menuEl.getBoundingClientRect();
  const vw = window.innerWidth,
    vh = window.innerHeight;
  const left = Math.min(x, vw - rect.width - 8);
  const top = Math.min(y, vh - rect.height - 8);
  menuEl.style.left = `${left}px`;
  menuEl.style.top = `${top}px`;

  // Đóng khi click ra ngoài / scroll / resize / ESC
  setTimeout(() => {
    const onOutside = (ev) => {
      if (!ev.target.closest("#sidebar-ctx-menu")) {
        cleanup();
        hideMenu();
      }
    };
    const onEsc = (ev) => {
      if (ev.key === "Escape") {
        cleanup();
        hideMenu();
      }
    };
    const cleanup = () => {
      document.removeEventListener("mousedown", onOutside, true);
      document.removeEventListener("scroll", hideMenu, true);
      window.removeEventListener("resize", hideMenu);
      document.removeEventListener("keydown", onEsc, true);
    };

    document.addEventListener("mousedown", onOutside, true);
    document.addEventListener("scroll", hideMenu, true);
    window.addEventListener("resize", hideMenu);
    document.addEventListener("keydown", onEsc, true);
  }, 0);
}

// Handle click trong menu
async function onMenuActionClick(e) {
  const btn = e.target.closest(".ctx-item");
  if (!btn || !menuEl || menuEl.style.display === "none") return;

  const action = btn.dataset.action;
  const id = menuEl.dataset.id;
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
      await httpRequest.del(endpoints.deletePlaylist(id), null, { headers });
      showToast("Đã xóa playlist", "success");
    } else if (action === "playlist:unfollow") {
      await httpRequest.del(endpoints.unfollowPlaylist(id), null, { headers });
      showToast("Đã unfollow playlist", "info");
    } else if (action === "artist:unfollow") {
      await httpRequest.del(endpoints.unfollowArtist(id), null, { headers });
      showToast("Đã unfollow nghệ sĩ", "info");
    } else {
      return;
    }

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

// Bắt right-click trên item ở sidebar
function onSidebarContextMenu(e) {
  const item = e.target.closest(".library-item");
  if (!item) return;

  e.preventDefault();
  const id = item.dataset.id;
  if (!id) return;

  // Lấy kind từ data-kind, fallback theo subtitle nếu thiếu
  let kind = item.dataset.kind;
  if (!kind) {
    const sub =
      item.querySelector(".item-subtitle")?.textContent?.toLowerCase() || "";
    kind = sub.includes("artist") ? "artist" : "playlist";
  }

  // clientX/clientY: theo viewport
  openMenu(e.clientX, e.clientY, { id, kind });
}

// Public API
export function initSidebarContextMenu() {
  if (isBound) return;
  isBound = true;

  createContextMenu();
  document.addEventListener("contextmenu", onSidebarContextMenu);
  document.addEventListener("click", onMenuActionClick);
}
