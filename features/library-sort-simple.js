// features/library-sort-init.js

export function initLibrarySort() {
  // ====  Bắt phần tử cần thiết ====
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const sortArea = sidebar.querySelector(".search-library");
  const sortBtn = sortArea?.querySelector(".sort-btn");
  const content = sidebar.querySelector(".library-content");
  if (!sortArea || !sortBtn || !content) return;

  // ==== Tạo menu sort đơn giản (3 lựa chọn) ====
  const menu = document.createElement("div");
  menu.className = "lib-sort-menu";
  menu.style.display = "none"; // ẩn mặc định (tránh phụ thuộc CSS)
  menu.innerHTML = `
    <button class="mi" data-sort="recents">Recents</button>
    <button class="mi" data-sort="recently-added">Recently Added</button>
    <button class="mi" data-sort="alphabetical">Alphabetical</button>
  `;
  // đặt menu ngay sau nút sort
  sortBtn.after(menu);

  // ====  Các hàm nhỏ (tách bạch, dùng thuật toán cơ bản) ====

  // Lấy tất cả item trong library
  function getAllItems() {
    return Array.from(content.querySelectorAll(".library-item"));
  }

  //Lọc ra những item đang hiển thị (sau khi  đã filter tab)
  function getVisibleItems() {
    // đơn giản: nhìn thẳng style.display ( đã set khi filter)
    return getAllItems().filter((el) => el.style.display !== "none");
  }

  //Ép giá trị ngày về mili-giây (nhận timestamp ms hoặc chuỗi ISO)
  function toMs(v) {
    if (v == null || v === "") return 0;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }

  //Đổi nhãn hiển thị trên nút sort (giữ icon phía sau)
  function setSortLabel(kind) {
    const labels = {
      recents: "Recents",
      "recently-added": "Recently Added",
      alphabetical: "Alphabetical",
    };
    const text = (labels[kind] || labels["recents"]) + " ";
    const first = sortBtn.firstChild;
    if (first && first.nodeType === Node.TEXT_NODE) first.nodeValue = text;
    else sortBtn.prepend(document.createTextNode(text));
  }

  // Áp dụng sort cho các item đang hiển thị
  function applySort(kind) {
    const visible = getVisibleItems(); // mảng item hiện đang hiện trên UI

    // comparator cơ bản theo yêu cầu
    let cmp;
    if (kind === "recently-added") {
      cmp = (a, b) => toMs(b.dataset.createdAt) - toMs(a.dataset.createdAt);
    } else if (kind === "alphabetical") {
      cmp = (a, b) =>
        String(a.dataset.name || "").localeCompare(
          String(b.dataset.name || ""),
          "vi",
          { sensitivity: "base" }
        );
    } else {
      // mặc định: recents (updatedAt mới nhất lên trước)
      cmp = (a, b) => toMs(b.dataset.updatedAt) - toMs(a.dataset.updatedAt);
    }

    // sort + re-append để đổi thứ tự DOM
    visible.sort(cmp).forEach((el) => content.appendChild(el));

    // cập nhật label và menu tick
    setSortLabel(kind);
    highlightMenu(kind);
    currentKind = kind;
  }

  // Tick mục đang chọn trong menu
  function highlightMenu(kind) {
    menu.querySelectorAll(".mi").forEach((btn) => {
      btn.classList.toggle("is-selected", btn.dataset.sort === kind);
    });
  }

  //  Mở/đóng menu (không phụ thuộc CSS)
  function openMenu() {
    menu.style.display = "block";
  }
  function closeMenu() {
    menu.style.display = "none";
  }
  function toggleMenu() {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }

  // ===Gắn sự kiện (đơn giản, rõ ràng) ====
  sortBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  menu.addEventListener("click", (e) => {
    const btn = e.target.closest(".mi[data-sort]");
    if (!btn) return;
    applySort(btn.dataset.sort);
    closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".lib-sort-menu") && !e.target.closest(".sort-btn")) {
      closeMenu();
    }
  });

  // Nếu  chuyển tab (ẩn/hiện item), mình sort lại cái đang hiển thị
  const tabs = document.querySelector(".nav-tabs");
  if (tabs) {
    tabs.addEventListener("click", () => {
      // đợi filter tab của  chạy xong 1 tick rồi sort lại
      setTimeout(() => applySort(currentKind), 0);
    });
  }

  // ==== Khởi tạo mặc định ====
  let currentKind = "recents";
  setSortLabel(currentKind);
  applySort(currentKind); // sắp xếp ban đầu
}
