import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import {
  escapeHTML,
  pickImage,
  getAuthToken,
  openAuthModal,
} from "../utils/helpers.js";

//Tính năng Follow/unfollow ---------------------------------------------
let isFollowHandle = false;
export function handlePlaylistFollowToggle() {
  if (isFollowHandle) return;
  isFollowHandle = true;
  document.addEventListener("click", onFollowToggleClick);
}

async function onFollowToggleClick(e) {
  const btn = e.target.closest(".playlist-follow-btn");
  if (!btn) return;

  const token = getAuthToken();
  if (!token) {
    showToast("Bạn cần đăng nhập để sử dụng tính năng này", "warning");
    openAuthModal();
    return;
  }

  const id = btn.dataset.id;
  if (!id) return;

  const isFollowing = btn.dataset.following === "1";

  try {
    btn.disabled = true;

    const opts = { headers: { Authorization: `Bearer ${token}` } };

    if (!isFollowing) {
      // follow (POST /playlists/:id/follow)
      await httpRequest.post(endpoints.followPlaylist(id), undefined, opts);
      // cập nhật nút
      btn.dataset.following = "1";
      btn.classList.add("is-following");
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "Unfollow";
      showToast("Đã follow playlist", "success");
    } else {
      // unfollow (DELETE /playlists/:id/follow)
      await httpRequest.del(endpoints.unfollowPlaylist(id), null, opts);

      // cập nhật nút
      btn.dataset.following = "0";
      btn.classList.remove("is-following");
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "Follow";
      showToast("Đã unfollow playlist", "error");
    }

    // cập nhật sidebar bên trái
    await refreshLibraryContent();
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
    console.error("Follow/Unfollow error:", err);
  } finally {
    btn.disabled = false;
    btn.dataset.busy = "0";
  }
}
// load danh sách playpist ở sidebar bên trái
export async function refreshLibraryContent() {
  const container = document.querySelector(".library-content");
  if (!container) return;

  const token = getAuthToken();

  if (!token) {
    // chưa đăng nhập thì để nguyên giao diện hiện có
    return;
  }

  try {
    const res = await httpRequest.get(endpoints.followedPlaylists(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    const playlists = Array.isArray(res) ? res : res?.playlists ?? [];

    const html = playlists
      .map((pl) => {
        const name = pl?.name ?? "Untitled";
        const img = pickImage(pl?.image_url);
        return `
          <div class="library-item" data-id="${escapeHTML(pl.id)}">
            <img
              src="${img}"
              alt="${escapeHTML(name)}"
              class="item-image"
            />
            <div class="item-info">
              <div class="item-title">${escapeHTML(name)}</div>
              <div class="item-subtitle">Playlist</div>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = html || `<p class="empty">No playlists</p>`;
  } catch (err) {
    console.error("Load my playlists failed:", err);
  }
}
