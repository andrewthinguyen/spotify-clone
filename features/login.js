import { showToast } from "../utils/toast.js";
import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { refreshLibraryContent } from "../features/flAndUnflPlaylist.js";

// Hàm kiểm tra định dạng email
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Hiển thị lỗi email
function showLoginEmailError(message) {
  const emailInput = document.querySelector("#loginEmail");
  const emailGroup = emailInput.closest(".form-group");
  const emailErrorBox = emailGroup.querySelector(".error-message");
  const emailErrorText = emailGroup.querySelector(".error-message span");

  emailGroup.classList.add("invalid");
  emailErrorBox.classList.add("show");
  emailErrorText.textContent = message;
}

// Hiển thị lỗi password
function showLoginPasswordError(message) {
  const passwordInput = document.querySelector("#loginPassword");
  const passwordGroup = passwordInput.closest(".form-group");
  const passwordErrorBox = passwordGroup.querySelector(".error-message");
  const passwordErrorText = passwordGroup.querySelector(".error-message span");

  passwordGroup.classList.add("invalid");
  passwordErrorBox.classList.add("show");
  passwordErrorText.textContent = message;
  passwordInput.focus();
}

// Cập nhật UI khi đăng nhập thành công
function updateCurrentUser(user) {
  const userEmail = document.querySelector("#user-email");
  const userAvatar = document.querySelector("#userAvatar");
  const userMenu = document.querySelector(".user-menu");
  const authButtons = document.querySelector(".auth-buttons");

  // Ẩn nút đăng nhập/đăng ký, hiển thị thông tin người dùng
  authButtons.classList.add("hide");
  userMenu.classList.add("show");

  // Cập nhật avatar
  if (user.user_url) {
    userAvatar.src = user.user_url;
  } else {
    userAvatar.src = "images/default-avatar.png"; // Ảnh mặc định
  }

  // Cập nhật email
  userEmail.textContent = user.email;
}

// Thiết lập sự kiện cho form đăng nhập
export function startLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  // Thiết lập sự kiện blur cho email để validate định dạng
  const emailInput = document.querySelector("#loginEmail");
  emailInput?.addEventListener("blur", function () {
    const email = this.value.trim();

    if (email && !isValidEmail(email)) {
      showLoginEmailError("Email không hợp lệ, vui lòng nhập lại.");
    }
  });

  // Ẩn lỗi khi focus vào input email
  emailInput?.addEventListener("focus", function () {
    const emailGroup = this.closest(".form-group");
    const emailErrorBox = emailGroup.querySelector(".error-message");

    emailGroup.classList.remove("invalid");
    emailErrorBox.classList.remove("show");
  });

  // Ẩn lỗi khi focus vào input password
  const passwordInput = document.querySelector("#loginPassword");
  passwordInput?.addEventListener("focus", function () {
    const passwordGroup = this.closest(".form-group");
    const passwordErrorBox = passwordGroup.querySelector(".error-message");

    passwordGroup.classList.remove("invalid");
    passwordErrorBox.classList.remove("show");
  });

  // Xử lý sự kiện submit form
  loginForm
    .querySelector(".auth-form-content")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailValue = document.querySelector("#loginEmail").value.trim();
      const password = document.querySelector("#loginPassword").value;

      // Validate email
      if (!emailValue) {
        showLoginEmailError("Vui lòng nhập email.");
        return;
      }

      if (!isValidEmail(emailValue)) {
        showLoginEmailError("Email không hợp lệ, vui lòng nhập lại.");
        return;
      }

      // Validate password
      if (!password) {
        showLoginPasswordError("Vui lòng nhập mật khẩu.");
        return;
      }

      // Dữ liệu đăng nhập
      const credentials = {
        email: emailValue,
        password,
      };

      try {
        // Gọi API đăng nhập
        const { access_token, user } = await httpRequest.post(
          endpoints.authLogin,
          credentials
        );

        // Lưu token và thông tin user
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Đóng modal
        const authModal = document.getElementById("authModal");
        authModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Phục hồi cuộn trang

        // Hiển thị thông báo thành công
        showToast("Đăng nhập thành công! Chào mừng trở lại.", "success");
        refreshLibraryContent();
        // Cập nhật UI - tự động đăng nhập
        setTimeout(() => {
          updateCurrentUser(user);
        }, 500);
      } catch (error) {
        console.error("Login error:", error);

        // Kiểm tra loại lỗi từ API
        if (error?.response?.error?.code === "INVALID_CREDENTIALS") {
          showLoginEmailError("Email hoặc mật khẩu không chính xác.");
        } else if (error?.response?.error?.code === "USER_NOT_FOUND") {
          showLoginEmailError("Tài khoản không tồn tại.");
        } else {
          showLoginEmailError("Đăng nhập thất bại. Vui lòng thử lại sau.");
        }
      }
    });
}
