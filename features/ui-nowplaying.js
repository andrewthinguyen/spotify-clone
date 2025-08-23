// features/ui-nowplaying.js
import player from "./player.js";

// Tìm đúng vùng ở góc trái thanh player
const left = document.querySelector(".player-left");

if (left) {
  const $img = left.querySelector(".player-image");
  const $title = left.querySelector(".player-title");
  const $artist = left.querySelector(".player-artist");

  // helper
  const text = (v, fb = "") => (v == null ? fb : String(v));
  const pickImage = (track) => track?.image_url || "placeholder.svg";

  function renderNowPlaying(track) {
    if (!$img || !$title || !$artist || !track) return;

    // Cập nhật ảnh
    $img.src = pickImage(track);
    $img.alt = `Current track: ${text(track.title, "Unknown")}`;

    // Cập nhật text
    $title.textContent = text(track.title, "Unknown title");
    $artist.textContent = text(track.artist_name, "Unknown artist");
  }

  // 1) Lắng nghe khi player phát bài mới
  window.addEventListener("player:trackchange", (e) => {
    renderNowPlaying(e.detail.track);
  });

  // 2) Nếu reload trang lúc đã có bài (VD chuyển route), render ngay
  if (player.current) renderNowPlaying(player.current);
}
