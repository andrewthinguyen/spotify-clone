import { endpoints } from "./endpoints.js";
import { getAuthToken } from "./helpers.js";
import httpRequest from "./httpRequest.js";

export async function uploadForm(path, formData) {
  const token = getAuthToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = httpRequest.baseUrl + path;
  const res = await fetch(url, { method: "POST", headers, body: formData });

  // backend hiện tại trả về json
  const json = await res.json();

  if (!res.ok) {
    const msg = json?.message || res.statusText;
    const err = new Error(`HTTP ${res.status} ${msg}`);
    err.status = res.status;
    err.response = json;
    throw err;
  }

  //trả về đường dẫn file
  return json.file?.url;
}

export async function uploadPlaylistCoverAndUpdate(playlistId, file) {
  const fd = new FormData();
  fd.append("cover", file);

  // upload cover -> nhận response { file: { url, filename, size }, ... }
  const up = await uploadForm(endpoints.uploadPlaylistCover(playlistId), fd);
  const imageUrl = "https://spotify.f8team.dev" + up;

  if (!imageUrl) throw new Error("Upload cover: thiếu file.url trong response");

  //  update playlist -> lưu image_url vào DB
  await httpRequest.put(endpoints.updatePlaylist(playlistId), {
    image_url: imageUrl,
  });

  return imageUrl; // cho UI cập nhật ngay
}
