// features/library-tabs.js
(function initLibraryTabs() {
  // Bắt đúng vùng sidebar + phần tabs + nơi chứa danh sách
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const tabsWrap = sidebar.querySelector(".nav-tabs");
  const content = sidebar.querySelector(".library-content");
  if (!tabsWrap || !content) return;

  const tabs = Array.from(tabsWrap.querySelectorAll(".nav-tab"));
  if (!tabs.length) return;

  // Chuẩn hoá key tab từ data-tab hoặc text nút
  //    -> 'all' | 'playlists' | 'artists'
  function getTabKey(btn) {
    const raw = btn.dataset.tab.trim().toLowerCase();
    if (raw.startsWith("play")) return "playlists";
    if (raw.startsWith("artist")) return "artists";
    return "all";
  }

  // Đánh dấu tab đang hoạt động (class .active)
  function setActiveTabUI(key) {
    tabs.forEach((b) => {
      const bKey = getTabKey(b);
      b.classList.toggle("active", bKey === key);
    });
  }

  // Ẩn/hiện item theo tab
  //    - all: hiện tất cả
  //    - playlists: chỉ hiện item có data-kind="playlist" và data-kind="flPlaylist"
  //    - artists:   chỉ hiện item có data-kind="artist"
  function applyTabFilter(key) {
    const items = content.querySelectorAll(".library-item");
    items.forEach((el) => {
      const kind = el.dataset.kind;
      const show =
        key === "all" ||
        (key === "playlists" && kind === "playlist") ||
        (key === "playlists" && kind === "flPlaylist") ||
        (key === "artists" && kind === "artist");
      el.style.display = show ? "" : "none";
    });
  }

  // Lưu/đọc tab đang chọn (để reload vẫn nhớ)
  const LS_KEY = "lib.activeTab";
  function saveActive(key) {
    try {
      localStorage.setItem(LS_KEY, key);
    } catch {}
  }
  function loadActive() {
    try {
      return localStorage.getItem(LS_KEY) || "all";
    } catch {
      return "all";
    }
  }

  // Gắn click cho từng tab
  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = getTabKey(btn);
      setActiveTabUI(key);
      applyTabFilter(key);
      saveActive(key);
    });
  });

  // Khởi tạo lần đầu
  //    - Lấy tab đã lưu (mặc định 'all')
  //    - Đánh dấu UI và lọc danh sách
  const initialKey = loadActive();
  setActiveTabUI(initialKey);
  applyTabFilter(initialKey);
})();
