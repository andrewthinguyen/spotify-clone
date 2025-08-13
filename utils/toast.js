// Hàm hiển thị toast message
export function showToast(message, type = "success", duration = 3000) {
  // Tìm hoặc tạo toast container
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Tạo toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Chọn icon phù hợp với loại toast
  let icon = "check-circle";
  if (type === "error") icon = "exclamation-circle";
  if (type === "info") icon = "info-circle";

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-content">${message}</div>
  `;

  // Thêm vào container
  toastContainer.appendChild(toast);

  // Hiển thị toast sau 10ms để animation hoạt động
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Tự động đóng toast sau duration
  setTimeout(() => {
    toast.classList.remove("show");

    // Xóa toast sau khi animation kết thúc
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);

  return toast;
}
