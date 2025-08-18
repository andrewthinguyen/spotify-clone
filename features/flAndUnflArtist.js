import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import { getAuthToken, openAuthModal } from "../utils/helpers.js";
import { refreshLibraryContent } from "./flAndUnflPlaylist.js";
//Tính năng Follow/unfollow ---------------------------------------------
let isArtistFollowHandle = false;

export function handleArtistFollowToggle() {
  if (isArtistFollowHandle) return;
  isArtistFollowHandle = true;
  document.addEventListener("click", onArtistFollowToggleClick);
}

async function onArtistFollowToggleClick(e) {
  const btn = e.target.closest(".artist-follow-btn");

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

    btn.dataset.busy = "1";

    const opts = { headers: { Authorization: `Bearer ${token}` } };

    if (!isFollowing) {
      //follow
      await httpRequest.post(endpoints.followArtist(id), undefined, opts);

      // Cập nhật nút
      btn.dataset.following = "1";
      btn.classList.add("is-following");
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "Unfollow";
      showToast("Đã follow nghệ sĩ", "success");
    } else {
      //unfollow
      await httpRequest.del(endpoints.unfollowArtist(id), undefined, opts);

      // Cập nhật nút
      btn.dataset.following = "0";
      btn.classList.remove("is-following");
      btn.setAttribute("aria-pressed", "false");
      btn.textContent = "Follow";
      showToast("Đã unfollow nghệ sĩ", "info");
    }

    // Làm mới sidebar/library

    refreshLibraryContent();
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
    console.error("Artist Follow/Unfollow error:", err);
  } finally {
    btn.disabled = false;
    btn.dataset.busy = "0";
  }
}
