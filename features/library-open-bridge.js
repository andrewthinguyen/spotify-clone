// features/library-open-bridge.js
// Bridge: click library-item -> mở Artist/Playlist bằng hàm bạn đã có.
import { loadArtistDetail, loadPlaylistDetail } from "./playListsAndArtists.js";
export function initLibraryOpenBridge() {
  const container = document.querySelector(".library-content");
  if (!container) return;

  // các nút con không nên điều hướng
  const STOP = ".add-btn, .menu-btn, button, a, [data-stop-open]";

  function openFromItem(item) {
    console.log(item);

    const id = item?.dataset?.id;
    let kind = item?.dataset?.kind; // 'artist' | 'playlist' | 'flPlaylist'
    if (!id || !kind) return;

    if (kind === "flPlaylist") kind = "playlist";
    if (kind === "artist") {
      loadArtistDetail(id);
    } else if (kind === "playlist") {
      loadPlaylistDetail(id);
    }
  }

  container.addEventListener("click", (e) => {
    if (e.target.closest(STOP)) return;
    const item = e.target.closest(".library-item");
    if (item) openFromItem(item);
  });

  // hỗ trợ Enter/Space
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.closest(STOP)) return;
    const item = e.target.closest(".library-item");
    if (item) openFromItem(item);
  });

  // (nhỏ) trỏ tay khi hover
  container.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".library-item");
    if (item) item.style.cursor = "pointer";
  });
}
