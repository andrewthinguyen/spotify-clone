import { showToast } from "../utils/toast.js";
import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";

/**
 * Xử lý đăng xuất người dùng
 */
export function handleLogout() {
  // Đóng dropdown nếu đang mở
  const userDropdown = document.getElementById("userDropdown");
  if (userDropdown) {
    userDropdown.classList.remove("show");
  }

  // Hiển thị toast đang đăng xuất
  showToast("Đang đăng xuất...", "info", 2000);

  // Gọi API đăng xuất
  httpRequest
    .post(endpoints.authLogout, {})
    .then(() => {
      // Thành công
      showToast("Đăng xuất thành công!", "success");
    })
    .catch((error) => {
      // Xử lý lỗi
      console.error("Đăng xuất lỗi:", error);
      showToast("Đã đăng xuất khỏi thiết bị này", "info");
    })
    .finally(() => {
      // Luôn thực hiện các bước này

      // Xóa token và thông tin người dùng
      localStorage.removeItem("accessToken");
      localStorage.removeItem("currentUser");

      // Cập nhật UI
      const authButtons = document.querySelector(".auth-buttons");
      const userEmail = document.querySelector("#user-email");
      const userMenu = document.querySelector(".user-menu");

      if (authButtons) authButtons.classList.add("show");
      if (userEmail) userEmail.classList.remove("show");
      if (userMenu) userMenu.classList.remove("show");

      // Chuyển về trang chủ
      window.location.href = "./";
    });
}
