export function getAuthToken() {
  return localStorage.getItem("accessToken");
}
const authModal = document.getElementById("authModal");
export function openAuthModal() {
  authModal.classList.add("show");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}
// xử lý xss
export function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

//xử lý để nếu đường dẫn ảnh không phải tới f8team thì coi như false, tránh bị xấu giao diện.
export function pickImage(url) {
  if (!url) return "./placeholder.svg";
  const u = new URL(url);
  return u.origin !== "https://example.com" ? url : "./placeholder.svg";
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
