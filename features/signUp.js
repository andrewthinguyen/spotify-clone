import { showToast } from "../utils/toast.js";
import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";

// Hàm kiểm tra định dạng email
function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Hàm kiểm tra mật khẩu
function validatePassword(pw) {
  if (pw.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
  if (!/[A-Z]/.test(pw)) return "Mật khẩu phải có ít nhất một chữ hoa";
  if (!/[a-z]/.test(pw)) return "Mật khẩu phải có ít nhất một chữ thường";
  if (!/\d/.test(pw)) return "Mật khẩu phải có ít nhất một chữ số";
  if (!/[^A-Za-z0-9]/.test(pw))
    return "Mật khẩu phải có ít nhất một ký tự đặc biệt";
  if (/\s/.test(pw)) return "Mật khẩu không được chứa khoảng trắng";
  return "";
}

// Hiển thị lỗi email
function showEmailError(message) {
  const emailInput = document.querySelector("#signupEmail");
  const emailGroup = emailInput.closest(".form-group");
  const emailErrorBox = emailGroup.querySelector(".error-message");

  const emailErrorText = emailGroup.querySelector(".error-message span");

  emailGroup.classList.add("invalid");
  emailErrorBox.classList.add("show");
  emailErrorText.textContent = message;
  //   emailInput.focus();
}

// Hiển thị lỗi password
function showPasswordError(message) {
  const passwordInput = document.querySelector("#signupPassword");
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

// Thiết lập sự kiện cho form đăng ký
export function startRegister() {
  const signupForm = document.getElementById("signupForm");
  if (!signupForm) return;

  // Thiết lập sự kiện blur cho email để validate định dạng
  const emailInput = document.querySelector("#signupEmail");
  emailInput?.addEventListener("blur", function () {
    const email = this.value.trim();

    if (email && !isValidEmail(email)) {
      showEmailError("Email không hợp lệ, vui lòng nhập lại.");
    }
  });

  // Ẩn lỗi khi focus vào input
  emailInput?.addEventListener("focus", function () {
    const emailGroup = this.closest(".form-group");
    const emailErrorBox = emailGroup.querySelector(".error-message");

    emailGroup.classList.remove("invalid");
    emailErrorBox.classList.remove("show");
  });

  // Xử lý sự kiện submit form
  signupForm
    .querySelector(".auth-form-content")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailValue = document.querySelector("#signupEmail").value.trim();
      const password = document.querySelector("#signupPassword").value;

      // Validate email
      if (!emailValue || !isValidEmail(emailValue)) {
        showEmailError("Email không hợp lệ, vui lòng nhập lại.");
        return;
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        showPasswordError(passwordError);
        return;
      }

      // Dữ liệu đăng ký
      const credentials = {
        email: emailValue,
        password,
      };

      try {
        // Gọi API đăng ký
        const { access_token, user } = await httpRequest.post(
          endpoints.authRegister,
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
        showToast("Đăng ký thành công! Chào mừng đến với Spotify.", "success");

        // Cập nhật UI - tự động đăng nhập
        setTimeout(() => {
          updateCurrentUser(user);
        }, 500);
      } catch (error) {
        console.error("Registration error:", error);
        // Kiểm tra loại lỗi từ API
        if (error?.response?.error?.code === "EMAIL_EXISTS") {
          showEmailError(
            "Email này đã được đăng ký, vui lòng sử dụng email khác."
          );
        } else {
          showEmailError("Đã xảy ra lỗi khi đăng ký, vui lòng thử lại sau.");
        }
      }
    });
}
