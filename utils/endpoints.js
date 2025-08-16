const endpoints = {
  playlists: "playlists?limit=7",
  tracks: "tracks/trending?limit=7",
  authLogin: "auth/login",
  authRegister: "auth/register",
  authLogout: "auth/logout",
  popularArtirst: "artists/trending",

  //lấy dữ liệu artist

  artistById: (id) => `artists/${encodeURIComponent(id)}`,
  popularTracks: (id) => `artists/${encodeURIComponent(id)}/tracks/popular`,

  //lấy dữ liệu playlist

  playlistById: (id) => `playlists/${encodeURIComponent(id)}`,
  playlistTracks: (id) => `playlists/${encodeURIComponent(id)}/tracks`,

  //lấy dữ liệu nhạc để

  trackById: (id) => `tracks/${encodeURIComponent(id)}`,
  trendingTracks: (limit = 5, offset = 0) =>
    `tracks/trending?limit=${limit}&offset=${offset}`,

  //phần folllow và unfollow

  followPlaylist: (id) => `playlists/${encodeURIComponent(id)}/follow`,
  unfollowPlaylist: (id) => `playlists/${encodeURIComponent(id)}/follow`,

  followedPlaylists: (limit = 20, offset = 0) =>
    `me/playlists/followed?limit=${limit}&offset=${offset}`,

  //Phần tạo playlist
  createPlaylist: () => "playlists",
  updatePlaylist: (id) => `playlists/${id}`,
  getMyPlaylists: (limit = 50, offset = 0) =>
    `me/playlists?limit=${limit}&offset=${offset}`,
  uploadPlaylistCover: (id) => `upload/playlist/${id}/cover`,
  serveUploaded: (type, file) => `upload/serve/${type}/${file}`,
};

export { endpoints };
