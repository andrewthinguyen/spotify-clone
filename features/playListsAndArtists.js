import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import { formatNumber, formatDuration } from "../utils/formatNumber.js";
import { escapeHTML, pickImage } from "../utils/helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { tracks } = await httpRequest.get(endpoints.tracks);
    const { artists } = await httpRequest.get(endpoints.popularArtirst);
    const { playlists } = await httpRequest.get(endpoints.playlists);

    renderTracks(tracks);
    renderPlaylists(playlists);
    renderPopularArtists(artists);
  } catch (error) {
    console.log(error);
  }
});

// hàm rendertracks
function renderTracks(tracks) {
  const hitsGrid = document.querySelector(".hits-grid");
  const html = tracks
    .map((track) => {
      return `
        <div class="hit-card" data-id="${escapeHTML(track.id)}">
          <div class="hit-card-cover" ">
            <img
              src="${pickImage(track.image_url)}"
              alt="Cover"
            />
            <button class="hit-play-btn"><i class="fas fa-play"></i></button>
          </div>
          <div class="hit-card-info ">
            <h3 class="hit-card-title">${escapeHTML(
              track.title ?? "Untitled"
            )}</h3>
            <p class="hit-card-artist">${escapeHTML(
              track.artist_name ?? "Unnamed"
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

// hàm Render Playlist
function renderPlaylists(playlists) {
  const playListsGrid = document.querySelector(".playlists-grid");
  const html = playlists
    .map((playlist) => {
      return `
        <div class="playlist-card" data-id="${escapeHTML(playlist.id)}">
          <div class="playlist-card-cover">
            <img
              src="${pickImage(playlist.image_url)}"
              alt="Cover"
            />
            <button class="playlist-play-btn"><i class="fas fa-play"></i></button>
          </div>
          <div class="playlist-card-info">
            <h3 class="playlist-card-title">${escapeHTML(
              playlist.name ?? "Untitled"
            )}</h3>
            <p class="playlist-card-artist">${escapeHTML(
              playlist.user_display_name ?? playlist.user_username ?? "Unnamed"
            )}</p>
          </div>
        </div>
      `;
    })
    .join("");

  playListsGrid.innerHTML = html;
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
  // Ẩn section Playlist
  const playlistsSection = document.querySelector(".playlists-section");
  if (playlistsSection) playlistsSection.style.display = "none";
}

function showArtistDetail(artist) {
  const contentWrapper = document.querySelector(".content-wrapper");

  // Format số người nghe hàng tháng
  const listeners = artist.monthly_listeners || artist.followers_count || 0;
  const formattedListeners = formatNumber(listeners) + " monthly listeners";

  // Lấy hình ảnh nghệ sĩ
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
             <button
          class="artist-follow-btn ${
            artist?.is_following ? "is-following" : ""
          }"
          data-id="${escapeHTML(artist?.id)}"
          data-following="${artist?.is_following ? "1" : "0"}"
          data-busy="0"
          aria-pressed="${artist?.is_following ? "true" : "false"}"
          aria-label="${
            artist?.is_following ? "Unfollow artist" : "Follow artist"
          }"
          title="${artist?.is_following ? "Unfollow" : "Follow"}"
        >
          ${artist?.is_following ? "Unfollow" : "Follow"}
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
//hàm handleTracks - xử lý khi người dùng click vào một tracks----------------------------------------
// Click vào bản nhạc đề xuất (".hit-card") -> mở chi tiết track
export function handleTracks() {
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".hit-card");
    if (!card) return;
    const trackId = card.dataset.id || card.getAttribute("data-id");
    if (trackId) loadTrackDetail(trackId);
  });
}

function loadTrackDetail(trackId) {
  const contentWrapper = document.querySelector(".content-wrapper");
  contentWrapper.innerHTML = `
    <div class="content-loading"><div class="spinner"></div></div>
  `;

  httpRequest
    .get(endpoints.trackById(trackId))
    .then((track) => {
      hideHomeSections(); // tái dùng
      showTrackDetail(track); // render UI chi tiết

      // Thêm class .show sau khi DOM đã có
      const hero = contentWrapper.querySelector(".artist-hero");
      const controls = contentWrapper.querySelector(".artist-controls");
      const rec = contentWrapper.querySelector(".popular-section");
      hero?.classList.add("show");
      controls?.classList.add("show");
      rec?.classList.add("show");

      // tải gợi ý theo track hiện tại
      loadRecommendedTracks();
    })
    .catch((error) => {
      console.error("Lỗi khi tải track:", error);
      showToast("Không thể tải bài hát", "error");
      contentWrapper.innerHTML = `
        <div class="error-state">
          <p>Không thể tải bài hát</p>
          <button onclick="window.location.reload()">Thử lại</button>
        </div>
      `;
    });
}

function showTrackDetail(track) {
  const contentWrapper = document.querySelector(".content-wrapper");

  const title = track?.title ?? track?.name ?? "Untitled";
  const img = pickImage(track.artist_image_url);

  const durationMs =
    Number(
      track?.duration_ms ??
        (track?.duration != null ? track.duration * 1000 : 0)
    ) || 0;

  const plays = Number(track?.play_count) || 0;

  const artistNames = Array.isArray(track?.artists)
    ? track.artists
        .map((a) => a?.name)
        .filter(Boolean)
        .join(", ")
    : track?.artist_name ?? "Unknown Artist";

  contentWrapper.innerHTML = `
    <!-- Tái dùng class để ăn chung CSS -->
    <section class="artist-hero">
      <div class="hero-background">
        <img src="${img}" alt="${escapeHTML(
    title
  )} background" class="hero-image" />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="artist-name">${escapeHTML(title)}</h1>
        <p class="monthly-listeners">${escapeHTML(artistNames)}</p>
        <p class="monthly-listeners">
          ${formatNumber(plays)} Lượt nghe · ${formatDuration(durationMs)}
        </p>
      </div>
    </section>

    <section class="artist-controls">
      <button class="play-btn-large" aria-label="Play">
        <i class="fas fa-play"></i>
      </button>
      <!--nút Save -->
      <button class="track-save-btn" data-id="${escapeHTML(track.id)}">
        Save
      </button>
    </section>

    <section class="popular-section" id="recommended-tracks">
      <h2 class="section-title">Recommended</h2>
      <div class="loading">Loading tracks...</div>
    </section>
  `;
}
function loadRecommendedTracks() {
  httpRequest
    .get(endpoints.trendingTracks())
    .then((data) => {
      const container = document.querySelector("#recommended-tracks");

      const tracks = data?.tracks;

      if (!tracks || tracks.length === 0) {
        container.innerHTML = `
          <h2 class="section-title">Recommended</h2>
          <p>Chưa có gợi ý cho bài hát này.</p>
        `;
        return;
      }

      container.innerHTML = `
        <h2 class="section-title">Có thể bạn sẽ thích</h2>
        <div class="track-list"></div>
      `;
      const list = container.querySelector(".track-list");

      const ui = tracks
        .map((t, i) => {
          const tTitle = t?.title;
          const tImg = pickImage(t?.album_cover_image_url);
          const tPlays = Number(t?.play_count) || 0;
          const tDurMs = Number(t.duration * 1000) || 0;

          return `
            <div class="track-item hit-card" data-id="${escapeHTML(t.id)}">
              <div class="track-number">${i + 1}</div>
              <div class="track-image">
                <img src="${tImg}" alt="${escapeHTML(tTitle)}" />
              </div>
              <div class="track-info">
                <div class="track-name">${escapeHTML(tTitle)}</div>
              </div>
              <div class="track-plays">${formatNumber(tPlays)}</div>
              <div class="track-duration">${formatDuration(tDurMs)}</div>
              <button class="track-menu-btn" aria-label="More options">
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
          `;
        })
        .join("");

      list.innerHTML = ui;
    })
    .catch((error) => {
      console.error("Lỗi khi tải recommended:", error);
      const el = document.querySelector("#recommended-tracks");
      if (el) {
        el.innerHTML = `
          <h2 class="section-title">Recommended</h2>
          <p>Failed to load recommendations</p>
        `;
      }
    });
}
//hàm handlePlaylist - xử lý khi người dùng click vào một playlist----------------------------------------
export function handlePlaylist() {
  // Lắng nghe click vào card playlist
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".playlist-card");
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
      <button
      class="playlist-follow-btn ${
        playlist?.is_following ? "is-following" : ""
      }"
      data-id="${escapeHTML(playlist.id)}"
      data-following="${playlist?.is_following ? "1" : "0"}"
      aria-pressed="${playlist?.is_following ? "true" : "false"}"
    >
      ${playlist?.is_following ? "Unfollow" : "Follow"}
    </button>
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
