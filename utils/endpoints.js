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

  //phần folllow và unfollow playlist

  followPlaylist: (id) => `playlists/${encodeURIComponent(id)}/follow`,
  unfollowPlaylist: (id) => `playlists/${encodeURIComponent(id)}/follow`,

  followedPlaylists: () => `me/playlists/followed`,

  //phần folllow và unfollow artist
  followArtist: (id) => `artists/${encodeURIComponent(id)}/follow`,
  unfollowArtist: (id) => `artists/${encodeURIComponent(id)}/follow`,

  followedArtists: () => `me/following?limit=20&offset=0`,
  //Phần tạo playlist
  createPlaylist: () => "playlists",
  updatePlaylist: (id) => `playlists/${id}`,
  getMyPlaylists: () => `me/playlists`,
  uploadPlaylistCover: (id) => `upload/playlist/${id}/cover`,
  serveUploaded: (type, file) => `upload/serve/${type}/${file}`,
  deletePlaylist: (id) => `playlists/${encodeURIComponent(id)}`,

  //Phần phát nhạc:
  playTrack: (id) => `tracks/${encodeURIComponent(id)}/play`,
  completeTrack: (id) => `tracks/${encodeURIComponent(id)}/complete`,
};

export { endpoints };
