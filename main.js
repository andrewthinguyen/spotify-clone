import "./features/tooltip.js";
import "./features/playListsAndArtists.js";
import { startLogin } from "./features/login.js";
import { startRegister } from "./features/signUp.js";
import { handleLogout } from "./features/logout.js";
import {
  handleArtist,
  handlePlaylist,
} from "./features/playListsAndArtists.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const signupBtn = document.querySelector(".signup-btn");
  const loginBtn = document.querySelector(".login-btn");
  const authModal = document.getElementById("authModal");
  const modalClose = document.getElementById("modalClose");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");
  const homeBtn = document.querySelector(".home-btn");

  //go to homepage
  homeBtn?.addEventListener("click", () => {
    window.location.href = "/";
  });
  // Function to show signup form
  function showSignupForm() {
    signupForm.style.display = "block";
    loginForm.style.display = "none";
  }

  // Function to show login form
  function showLoginForm() {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }

  // Function to open modal
  function openModal() {
    authModal.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  }

  // Open modal with Sign Up form when clicking Sign Up button
  signupBtn.addEventListener("click", function () {
    showSignupForm();
    openModal();
  });

  // Open modal with Login form when clicking Login button
  loginBtn.addEventListener("click", function () {
    showLoginForm();
    openModal();
  });

  // Close modal function
  function closeModal() {
    // authModal.classList.add("fade-out");
    authModal.classList.remove("show");
    document.body.style.overflow = "auto"; // Restore scrolling
    // setTimeout(() => {
    //   authModal.classList.remove("show");
    //   document.body.style.overflow = "auto"; // Cho phép cuộn lại
    // }, 300); // Thời gian khớp với thời lượng animation (0.3s)
  }

  // Close modal when clicking close button
  modalClose.addEventListener("click", closeModal);

  // Close modal when clicking overlay (outside modal container)
  authModal.addEventListener("click", function (e) {
    if (e.target === authModal) {
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && authModal.classList.contains("show")) {
      closeModal();
    }
  });

  // Switch to Login form
  showLoginBtn.addEventListener("click", function () {
    showLoginForm();
  });

  // Switch to Signup form
  showSignupBtn.addEventListener("click", function () {
    showSignupForm();
  });

  // Thiết lập xử lý đăng ký----------------------------
  startRegister();
  // Thiết lập xử lý đăng nhập----------------------------
  startLogin();
  //Xử lý click vào nghệ sĩ thì hiện ra thông tin
  handleArtist();
  handlePlaylist();
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
  const userAvatar = document.getElementById("userAvatar");
  const userDropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle dropdown when clicking avatar
  userAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Close dropdown when pressing Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && userDropdown.classList.contains("show")) {
      userDropdown.classList.remove("show");
    }
  });

  // Handle logout button click
  logoutBtn.addEventListener("click", function () {
    handleLogout();
    console.log("Logout clicked");
    // TODO: Students will implement logout logic here
  });
});

// Other functionality
document.addEventListener("DOMContentLoaded", function () {
  function checkAuthStatus() {
    const accessToken = localStorage.getItem("accessToken");
    const currentUserJSON = localStorage.getItem("currentUser");
    const authButtons = document.querySelector(".auth-buttons");
    const userEmail = document.querySelector("#user-email");

    // Kiểm tra xem có phần tử DOM cần thiết không
    if (!authButtons || !userEmail) {
      console.error("Không tìm thấy các phần tử UI cần thiết");
      return;
    }

    if (accessToken && currentUserJSON) {
      try {
        // Người dùng đã đăng nhập
        const user = JSON.parse(currentUserJSON);

        // Cập nhật UI - hiện thông tin user, ẩn nút đăng nhập/đăng ký
        showLoggedUser(user);
      } catch (error) {
        console.error("Lỗi xử lý dữ liệu người dùng:", error);
        showAuthButtons();
      }
    } else {
      // Người dùng chưa đăng nhập
      showAuthButtons();
    }
  }
  // Hiện nút đăng nhập/đăng ký
  function showAuthButtons() {
    const authButtons = document.querySelector(".auth-buttons");
    const userEmail = document.querySelector("#user-email");
    const userMenu = document.querySelector(".user-menu");

    if (authButtons) authButtons.classList.add("show");
    if (userEmail) userEmail.classList.remove("show");
    if (userMenu) userMenu.classList.remove("show");
    // Xóa token nếu có
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
  }
  function showLoggedUser(user) {
    const authButtons = document.querySelector(".auth-buttons");
    const userEmail = document.querySelector("#user-email");
    const userMenu = document.querySelector(".user-menu");
    const userAvatar = document.querySelector("#userAvatar");

    // Hiển thị thông tin người dùng
    if (authButtons) authButtons.classList.add("hide");
    if (userEmail) userEmail.classList.add("show");
    if (userMenu) userMenu.classList.add("show");
    // Cập nhật avatar
    userAvatar.src = user.user_url || "images/default-avatar.png";

    // Cập nhật tên hiển thị
    userEmail.textContent = user.email;
  }
  checkAuthStatus();
});
