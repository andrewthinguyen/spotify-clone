import { escapeHTML, openAuthModal, getAuthToken } from "../utils/helpers.js";
import { endpoints } from "../utils/endpoints.js";
import { showToast } from "../utils/toast.js";
import httpRequest from "../utils/httpRequest.js";
import { uploadPlaylistCoverAndUpdate } from "../utils/uploadUtil.js";

export function initCreatePlaylist() {
  const createBtn = document.querySelector(".create-btn");
  const contentWrapper = document.querySelector(".content-wrapper");
  let editor = document.querySelector("#playlistEditor");
  let fileInput = document.querySelector("#coverInput");

  //tạo ra phần tử để click vào và chọn ảnh
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.id = "coverInput";
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
  }

  if (!createBtn) return;

  createBtn.addEventListener("click", async () => {
    const token = getAuthToken();
    if (!token) {
      showToast("Bạn cần đăng nhập để tạo playlist.", "error");
      openAuthModal();
      return;
    }
    //  Ẩn homepage + render createPlaylist tạo playlist
    contentWrapper.style.display = "none";
    renderCreatePlaylist(editor);

    try {
      // Tạo playlist mặc định "My Playlist" (backend tự xử lý #2, #3,...)
      const payload = { name: "My Playlist", is_public: true, description: "" };
      const res = await httpRequest.post(endpoints.createPlaylist(), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const playlist = res.playlist;

      // Đổ dữ liệu trả về
      fillPlaylistInfo(editor, playlist);

      // Click ảnh -> chọn file -> upload cover -> PUT update
      const coverEl = editor.querySelector(".cp-cover");
      coverEl?.addEventListener("click", () => fileInput.click());

      fileInput.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          const imageUrl = await uploadPlaylistCoverAndUpdate(
            playlist.id,
            file
          );

          // Cập nhật UI
          const img1 = editor.querySelector(".cp-cover img");
          if (img1) img1.src = imageUrl;
          const img2 = editor.querySelector(".cp-dialog-cover img");
          if (img2) img2.src = imageUrl;
        } catch (err) {
          console.error(err);
        } finally {
          e.target.value = "";
        }
      };

      // Sửa tên/mô tả qua dialog -> PUT update
      const titleEl = editor.querySelector(".cp-title");
      const dialogEl = editor.querySelector("#cpEditDialog");
      const saveBtn = editor.querySelector("#cpSaveEdit");

      if (
        titleEl &&
        dialogEl &&
        typeof dialogEl.showModal === "function" &&
        saveBtn
      ) {
        titleEl.addEventListener("click", () => dialogEl.showModal());
        saveBtn.addEventListener("click", async (ev) => {
          ev.preventDefault();
          try {
            const name = dialogEl.querySelector("#cpEditName").value.trim();
            const description = dialogEl
              .querySelector("#cpEditDesc")
              .value.trim();

            await httpRequest.put(
              endpoints.updatePlaylist(playlist.id),
              { name, description },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const t = editor.querySelector(".cp-title");
            if (t) t.textContent = name || "My Playlist";
            dialogEl.close();
          } catch (err) {
            console.error(err);
          }
        });
      }
    } catch (err) {
      console.error(err);
      // lỗi thì hiện lại trang chủ
      contentWrapper.style.display = "";
      editor.innerHTML = "";
    }
  });
}

/* ========== UI ========== */

// UI skeleton lúc vừa bấm Create
function renderCreatePlaylist(container) {
  container.innerHTML = `
    <div class="cp-header">
      <div class="cp-cover" role="button" title="Choose photo">
        <img src="./placeholder.svg" alt="cover"/>
        <span class="cp-cover-hint">Choose photo</span>
      </div>
      <div class="cp-meta">
        <div class="cp-badge">Public Playlist</div>
        <h1 class="cp-title">My Playlist</h1>
        <div class="cp-owner"></div>
      </div>
    </div>
    <h3 class="cp-title-2">Tìm bài hát mà bạn yêu thích</h3>
    <div class="cp-search">
      <input id="cpSearch" placeholder="Search for songs or episodes"/>
      <button id="cpClear" aria-label="Clear">✕</button>
    </div>

    <dialog id="cpEditDialog" class="cp-dialog">
      <form method="dialog" id="cpEditForm">
        <h3>Edit details</h3>
        <div class="cp-dialog-body">
          <div class="cp-dialog-cover">
            <img src="./placeholder.svg" alt="cover"/>
          </div>
          <div class="cp-dialog-fields">
            <label>Name</label>
            <input id="cpEditName" maxlength="100" value="My Playlist"/>
            <label>Description</label>
            <textarea id="cpEditDesc" maxlength="300"></textarea>
          </div>
        </div>
        <menu>
          <button value="cancel">Cancel</button>
          <button id="cpSaveEdit" value="default">Save</button>
        </menu>
      </form>
    </dialog>
  `;
}

// Đổ dữ liệu thật từ response tạo playlist
function fillPlaylistInfo(container, p) {
  // Badge public/private
  const isPublic = p?.is_public;

  const badge = container.querySelector(".cp-badge");
  if (badge)
    badge.textContent = isPublic ? "Public Playlist" : "Private Playlist";

  //  Title
  const title = container.querySelector(".cp-title");
  if (title) title.textContent = p?.name ? escapeHTML(p.name) : "My Playlist";

  //   // Owner (response hiện tại không có tên)
  //   const owner = container.querySelector(".cp-owner");
  //   if (owner) owner.textContent = "Bạn";

  // Form edit
  const editName = container.querySelector("#cpEditName");
  if (editName) editName.value = p?.name || "My Playlist";

  const editDesc = container.querySelector("#cpEditDesc");
  if (editDesc) editDesc.value = p?.description || "";

  // Cover
  const coverUrl = p?.image_url || "./placeholder.svg";
  const img1 = container.querySelector(".cp-cover img");
  if (img1) img1.src = coverUrl;
  const img2 = container.querySelector(".cp-dialog img");
  if (img2) img2.src = coverUrl;
}

// Tự khởi tạo khi file được import
// document.addEventListener("DOMContentLoaded", () => {
//   initCreatePlaylist();
// });
