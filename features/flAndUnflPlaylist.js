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
//Load sidebar bên trái bao gồm cả myplaylist và followed playlist
export async function refreshLibraryContent() {
  const container = document.querySelector(".library-content");
  if (!container) return;

  const token = getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  if (!token) return;

  try {
    //dùng promise.all vì nếu tạo playlist hoặc đi follow playlist mà gặp lỗi thì đều nên báo là tạo không thành công
    //từ đó có thể xử lý cho người dùng, tránh trường hợp 1 cái dùng được và hệ thống hiển thị sai.
    const [createdRes, followedRes, artistFollowed] = await Promise.all([
      httpRequest.get(endpoints.getMyPlaylists(), { headers }),
      httpRequest.get(endpoints.followedPlaylists(), { headers }),
      httpRequest.get(endpoints.followedArtists(), { headers }),
    ]);
    const toArr = (res) =>
      Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.playlists)
        ? res.playlists
        : Array.isArray(res?.artists)
        ? res.artists
        : [];
    const created = toArr(createdRes);
    const followed = toArr(followedRes);
    const artists = toArr(artistFollowed);

    // helper lấy timestamp (ms) từ followed_at/created_at/save_at
    const getTS = (pl) => {
      const ts =
        Date.parse(pl?.followed_at || "") ||
        Date.parse(pl?.saved_at || "") ||
        Date.parse(pl?.updated_at || "");

      return Number.isFinite(ts) ? ts : 0;
    };

    // gộp & khử trùng: giữ bản có thời gian mới hơn
    const map = new Map();
    [...created, ...followed, ...artists].forEach((pl) => {
      if (!pl || !pl.id) return;
      const old = map.get(pl.id);
      if (!old || getTS(pl) >= getTS(old))
        map.set(pl.id, pl, pl.followed_at, pl.saved_at);
    });

    //sort lên đầu cái mới nhất
    const MAX_SIDEBAR_ITEMS = 20;
    const playlistsSorted = Array.from(map.values()).sort(
      (a, b) => getTS(b) - getTS(a)
    );
    const playlists = playlistsSorted.slice(0, MAX_SIDEBAR_ITEMS);

    // render
    const html = playlists
      .map((pl) => {
        const name = pl?.name ?? "Untitled";
        const img = pickImage(pl?.image_url);
        const id = pl?.id ?? "";
        return `
        <div class="library-item" data-id="${escapeHTML(id)}" data-kind="${
          pl.followed_at ? "artist" : pl.saved_at ? "flPlaylist" : "playlist"
        }" data-name="${pl.name}" data-created-at="${
          pl.created_at
        }" data-updated-at="${pl.updated_at}" >
          <img src="${img}" alt="${escapeHTML(name)}" class="item-image" />
          <div class="item-info">
            <div class="item-title">${escapeHTML(name)}</div>
            <div class="item-subtitle">${
              pl.followed_at
                ? "Ca sĩ"
                : pl.saved_at
                ? "Playlist bạn Follow"
                : "Playlist mà bạn tạo"
            }</div>
          </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = html || `<p class="empty">No playlists</p>`;
  } catch (err) {
    console.error("Load playlists failed:", err);
  }
}
