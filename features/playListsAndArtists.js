import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import { formatNumber, formatDuration } from "../utils/formatNumber.js";

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
  if (!url) return "./placeholder.svg";
  const u = new URL(url);
  return u.origin !== "https://example.com/playlist-cover.jpg"
    ? url
    : "./placeholder.svg";
  // try {
  //   // new URL sẽ throw nếu url không hợp lệ/
  //   const u = new URL(url);
  //   return u.origin !== "https://example.com/playlist-cover.jpg"
  //     ? url
  //     : "./placeholder.svg";
  // } catch {
  //   return "./placeholder.svg";
  // }
}
// hàm renderPlaylists
function renderPlaylists(playlists) {
  const hitsGrid = document.querySelector(".hits-grid");
  const html = playlists
    .map((playlist) => {
      return `
        <div class="hit-card" data-id="${escapeHTML(playlist.id)}">
          <div class="hit-card-cover" ">
            <img
              src="${pickImage(playlist.image_url)}"
              alt="Cover"
            />
            <button class="hit-play-btn"><i class="fas fa-play"></i></button>
          </div>
          <div class="hit-card-info ">
            <h3 class="hit-card-title">${escapeHTML(
              playlist.name ?? "Untitled"
            )}</h3>
            <p class="hit-card-artist">${escapeHTML(
              playlist.user_display_name ?? "Unnamed"
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
        <div class="artist-card-info" data-id=${artist.id}>
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
//hàm handleArtist - xử lý khi người dùng click vào một artist----------------------------------------

export function handleArtist() {
  // Bắt sự kiện click vào các artist card
  document.addEventListener("click", function (e) {
    const artistCard = e.target
      .closest(".artist-card")
      .querySelector(".artist-card-info");
    if (!artistCard) return;

    const artistId = artistCard.dataset.id;

    if (artistId) {
      loadArtistDetail(artistId);
    }
  });
}
function loadArtistDetail(artistId) {
  const contentWrapper = document.querySelector(".content-wrapper");

  // Hiển thị trạng thái loading
  contentWrapper.innerHTML = `
    <div class="content-loading">
      <div class="spinner"></div>
    </div>
  `;

  // Gọi API lấy thông tin nghệ sĩ
  httpRequest
    .get(endpoints.artistById(artistId))
    .then((artist) => {
      // Ẩn sections của trang chủ
      hideHomeSections();
      // Hiển thị chi tiết nghệ sĩ
      showArtistDetail(artist);
      const artirstHero = document.querySelector(".artist-hero");
      const artirstControls = document.querySelector(".artist-controls");
      const popularSection = document.querySelector(".popular-section");
      artirstHero.classList.add("show");
      artirstControls.classList.add("show");
      popularSection.classList.add("show");
    })
    .catch((error) => {
      console.error("Lỗi khi tải thông tin nghệ sĩ:", error);
      showToast("Không thể tải thông tin nghệ sĩ", "error");

      contentWrapper.innerHTML = `
        <div class="error-state">
          <p>Không thể tải thông tin nghệ sĩ</p>
          <button onclick="window.location.reload()">Thử lại</button>
        </div>
      `;
    });
}
function hideHomeSections() {
  // Ẩn section Today's biggest hits
  const hitsSection = document.querySelector(".hits-section");
  if (hitsSection) hitsSection.style.display = "none";

  // Ẩn section Popular artists
  const artistsSection = document.querySelector(".artists-section");
  if (artistsSection) artistsSection.style.display = "none";
}

function showArtistDetail(artist) {
  const contentWrapper = document.querySelector(".content-wrapper");

  // Format số người nghe hàng tháng
  const listeners = artist.monthly_listeners || artist.followers_count || 0;
  const formattedListeners = formatNumber(listeners) + " monthly listeners";

  // Lấy hình ảnh nghệ sĩ
  const heroImage = artist.images?.[0]?.url || "placeholder.svg";
  contentWrapper.innerHTML = `
    <!-- Artist Hero Section -->
      <section class="artist-hero">
        <div class="hero-background">
          <img
            src="${pickImage(artist.background_image_url)}"
            alt="Đen artist background"
            class="hero-image"
          />
          <div class="hero-overlay"></div>
        </div>
        <div class="hero-content">
          <div class="${artist.is_verified ? "verified-badge" : ""}">
            <i class="fas fa-check-circle"></i>
            <span>Verified Artist</span>
          </div>
          <h1 class="artist-name">${escapeHTML(artist.name)}</h1>
          <p class="monthly-listeners">${formattedListeners}</p>
        </div>
    </section>
    <section class="artist-controls">
            <button class="play-btn-large">
              <i class="fas fa-play"></i>
            </button>
    </section>
    <section class="popular-section">
       </section>
  `;
  // Tải danh sách bài hát nổi tiếng của nghệ sĩ
  loadArtistTracks(artist.id);
}
function loadArtistTracks(artistId) {
  httpRequest
    .get(endpoints.popularTracks(artistId))
    .then((data) => {
      const tracksContainer = document.querySelector(".popular-section");
      const songs = data.tracks;
      if (!songs || songs.length === 0) {
        tracksContainer.innerHTML = `
          <h2 class="section-title">Popular</h2>
          <p>Chúng tôi chưa nhận được bài hát nào từ nghệ sĩ này</p>
        `;
        return;
      }
      const trackList = `
            <h2 class="section-title">Popular</h2>
            <div class="track-list">`;
      const uiTrack = songs
        .map((track) => {
          const plays = Number(track.play_count) || 0;
          const durationMs = Number(track.duration) || 0;
          return `
              <div class="track-item">
        <div class="track-number">${escapeHTML(track.track_number)}</div>
        <div class="track-image">
          <img
            src="${pickImage(track.image_url)}"
            alt="${escapeHTML(track.title)}"
          />
        </div>
        <div class="track-info">
          <div class="track-name">${escapeHTML(track.title)}</div>
        </div>
        <div class="track-plays">${formatNumber(plays)}</div>
        <div class="track-duration">${formatDuration(durationMs * 1000)}</div>
        <button class="track-menu-btn">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
        `;
        })
        .join("");
      tracksContainer.innerHTML = trackList;
      tracksContainer.innerHTML = uiTrack;
    })
    .catch((error) => {
      console.error("Lỗi khi tải tracks:", error);
      document.getElementById("artist-tracks-container").innerHTML = `
        <h2 class="section-title">Popular</h2>
        <p>Failed to load tracks</p>
      `;
    });
}
//hàm handlePlaylist - xử lý khi người dùng click vào một artist----------------------------------------
export function handlePlaylist() {
  // Lắng nghe click vào card playlist
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".hit-card");
    if (!card) return;

    const playlistId = card.dataset.id;

    if (playlistId) loadPlaylistDetail(playlistId);
  });
}
//hàm loadPlaylistDetail
function loadPlaylistDetail(playlistId) {
  const contentWrapper = document.querySelector(".content-wrapper");
  contentWrapper.innerHTML = `
    <div class="content-loading"><div class="spinner"></div></div>
  `;

  httpRequest
    .get(endpoints.playlistById(playlistId))
    .then((playlist) => {
      hideHomeSections(); // tái dùng hàm ẩn trang chủ
      showPlaylistDetail(playlist); // render UI

      // Thêm class 'show' sau khi DOM đã có
      const hero = contentWrapper.querySelector(".artist-hero");
      const controls = contentWrapper.querySelector(".artist-controls");
      const tracks = contentWrapper.querySelector(".popular-section");
      hero?.classList.add("show");
      controls?.classList.add("show");
      tracks?.classList.add("show");
    })
    .catch((error) => {
      console.error("Lỗi khi tải playlist:", error);
      showToast("Không thể tải playlist", "error");
      contentWrapper.innerHTML = `
        <div class="error-state">
          <p>Không thể tải playlist</p>
          <button onclick="window.location.reload()">Thử lại</button>
        </div>
      `;
    });
}
function showPlaylistDetail(playlist) {
  const contentWrapper = document.querySelector(".content-wrapper");

  const title = playlist?.name ?? "Untitled";
  const by = playlist?.user_username ?? playlist?.owner?.username ?? "Unknown";
  const cover = pickImage(
    playlist?.image_url ?? playlist?.background_image_url
  );

  contentWrapper.innerHTML = `
    <!-- tái dùng class để ăn chung CSS (artist-hero/controls/popular-section) -->
    <section class="artist-hero">
      <div class="hero-background">
        <img src="${cover}" alt="${escapeHTML(
    title
  )} background" class="hero-image" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="artist-name">${escapeHTML(title)}</h1>
        <p class="monthly-listeners">by ${escapeHTML(by)}</p>
      </div>
    </section>

    <section class="artist-controls">
      <button class="play-btn-large"><i class="fas fa-play"></i></button>
    </section>

    <section class="popular-section" id="playlist-tracks">
      <h2 class="section-title">Tracks</h2>
      <div class="loading">Loading tracks...</div>
    </section>
  `;

  loadPlaylistTracks(playlist.id);
}
function loadPlaylistTracks(playlistId) {
  httpRequest
    .get(endpoints.playlistTracks(playlistId))
    .then((data) => {
      const container = document.querySelector("#playlist-tracks");
      // Hỗ trợ cả hai dạng payload: {tracks: []} hoặc []
      const tracks = Array.isArray(data)
        ? data
        : data?.tracks ?? data?.songs ?? [];

      if (!tracks || tracks.length === 0) {
        container.innerHTML = `
          <h2 class="section-title">Tracks</h2>
          <p>Playlist này chưa có bài hát.</p>
        `;
        return;
      }

      container.innerHTML = `
        <h2 class="section-title">Tracks</h2>
        <div class="track-list"></div>
      `;
      const trackList = container.querySelector(".track-list");

      const ui = tracks
        .map((track, i) => {
          const title = track?.title ?? track?.name ?? `Track ${i + 1}`;
          const img = pickImage(track?.image_url);
          const plays = Number(track?.play_count ?? track?.plays) || 0;

          // Ưu tiên duration_ms; nếu chỉ có duration (giây) thì *1000
          const durationMs =
            Number(
              track?.duration_ms ??
                (track?.duration != null ? track.duration * 1000 : 0)
            ) || 0;

          return `
          <div class="track-item">
            <div class="track-number">${i + 1}</div>
            <div class="track-image">
              <img src="${img}" alt="${escapeHTML(title)}" />
            </div>
            <div class="track-info">
              <div class="track-name">${escapeHTML(title)}</div>
            </div>
            <div class="track-plays">${formatNumber(plays)}</div>
            <div class="track-duration">${formatDuration(durationMs)}</div>
            <button class="track-menu-btn" aria-label="More options">
              <i class="fas fa-ellipsis-h"></i>
            </button>
          </div>
        `;
        })
        .join("");

      trackList.innerHTML = ui;
    })
    .catch((error) => {
      console.error("Lỗi khi tải tracks playlist:", error);
      const el = document.querySelector("#playlist-tracks");
      if (el) {
        el.innerHTML = `
          <h2 class="section-title">Tracks</h2>
          <p>Failed to load tracks</p>
        `;
      }
    });
}
