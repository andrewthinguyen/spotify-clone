const endpoints = {
  playlists: "playlists",
  authLogin: "auth/login",
  authRegister: "auth/register",
  authLogout: "auth/logout",
  popularArtirst: "artists/trending",

  artistById: (id) => `artists/${encodeURIComponent(id)}`,
  popularTracks: (id) => `artists/${encodeURIComponent(id)}/tracks/popular`,
};

export { endpoints };
