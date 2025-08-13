import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { playlists } = await httpRequest.get(endpoints.playlists);
    renderPlaylists(playlists);
  } catch (error) {
    console.log(error);
  }
});
// xử lý xss
function renderPlaylists(playlists) {
  const hitsGrid = document.querySelector(".hits-grid");
  const html = playlists
    .map((playlist, index) => {
      return ` 
        <div class="hit-card">
            <div class="hit-card-cover">
                <img
                src=${
                  playlist.image_url ? playlist.image_url : "./placeholder.svg"
                }
                alt="Flowers"
                />
                <button class="hit-play-btn">
                <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="hit-card-info">
                <h3 class="hit-card-title">${playlist.name}</h3>
                <p class="hit-card-artist">${
                  playlist.user_username ? playlist.user_username : "Unnamed"
                }</p>
            </div>
        </div>
    `;
    })
    .join("");

  hitsGrid.innerHTML = html;
}
