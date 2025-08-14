const endpoints = {
  playlists: "playlists?limit=7",
  tracks: "tracks/trending?limit=7",
  authLogin: "auth/login",
  authRegister: "auth/register",
  authLogout: "auth/logout",
  popularArtirst: "artists/trending",

  artistById: (id) => `artists/${encodeURIComponent(id)}`,
  popularTracks: (id) => `artists/${encodeURIComponent(id)}/tracks/popular`,

  playlistById: (id) => `playlists/${encodeURIComponent(id)}`,
  playlistTracks: (id) => `playlists/${encodeURIComponent(id)}/tracks`,

  trackById: (id) => `tracks/${encodeURIComponent(id)}`,
  trendingTracks: (limit = 5, offset = 0) =>
    `tracks/trending?limit=${limit}&offset=${offset}`,

  followPlaylist: (id) => `playlists/${encodeURIComponent(id)}/follow`,
  unfollowPlaylist: (id) => `playlists/${encodeURIComponent(id)}/follow`,

  followedPlaylists: (limit = 20, offset = 0) =>
    `me/playlists/followed?limit=${limit}&offset=${offset}`,
};

export { endpoints };
