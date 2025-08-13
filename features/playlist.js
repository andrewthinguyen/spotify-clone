import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { playlists } = await httpRequest.get(endpoints.playlists);
    const { artists } = await httpRequest.get(endpoints.popularArtirst);

    renderPlaylists(playlists);
    renderPopularArtists(artists);
  } catch (error) {
    console.log(error);
  }
});
// xử lý xss
function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

//xử lý để nếu đường dẫn ảnh không phải tới f8team thì coi như false, tránh bị xấu giao diện.
function pickImage(url) {
  try {
    // new URL sẽ throw nếu url không hợp lệ/không phải absolute
    const u = new URL(url);
    return u.origin === "https://spotify.f8team.dev"
      ? url
      : "./placeholder.svg";
  } catch {
    return "./placeholder.svg";
  }
}
// hàm renderPlaylists
function renderPlaylists(playlists) {
  const hitsGrid = document.querySelector(".hits-grid");
  const html = playlists
    .map((playlist) => {
      return `
        <div class="hit-card">
          <div class="hit-card-cover">
            <img
              src="${pickImage(playlist.image_url)}"
              alt="Cover"
            />
            <button class="hit-play-btn"><i class="fas fa-play"></i></button>
          </div>
          <div class="hit-card-info">
            <h3 class="hit-card-title">${escapeHTML(
              playlist.name ?? "Untitled"
            )}</h3>
            <p class="hit-card-artist">${escapeHTML(
              playlist.user_username ?? "Unnamed"
            )}</p>
          </div>
        </div>
      `;
    })
    .join("");

  hitsGrid.innerHTML = html;
}
//hàm renderPopularArtists
function renderPopularArtists(artists) {
  const artistsGrid = document.querySelector(".artists-grid");
  const html = artists
    .map((artist) => {
      return `
      <div class="artist-card">
        <div class="artist-card-cover">
          <img src="${pickImage(artist.image_url)}" alt="Đen" />
          <button class="artist-play-btn">
            <i class="fas fa-play"></i>
          </button>
        </div>
        <div class="artist-card-info">
          <h3 class="artist-card-name">${escapeHTML(
            artist.name ?? "Unnamed"
          )}</h3>
          <p class="artist-card-type">Artist</p>
        </div>
      </div>
    `;
    })
    .join("");
  artistsGrid.innerHTML = html;
}
