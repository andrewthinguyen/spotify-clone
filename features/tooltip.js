//Xử lý tên Tooltip hiện lên trên nút.
const buttons = document.querySelectorAll(".control-btn");
buttons.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    btn.classList.add("show-tooltip");
  });
  btn.addEventListener("mouseleave", () => {
    btn.classList.remove("show-tooltip");
  });
});
