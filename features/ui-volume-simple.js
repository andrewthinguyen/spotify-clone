import player from "./player.js";

//Khởi tạo UI volume cho thanh player (click/kéo thanh + kéo núm handle + mute)
export function initVolume() {
  const wrap = document.querySelector(".player-right .volume-container");
  if (!wrap) return;

  const btn = wrap.querySelector(".control-btn");
  const bar = wrap.querySelector(".volume-bar");
  if (!btn || !bar) return;

  let fill = bar.querySelector(".volume-fill");
  let handle = bar.querySelector(".volume-handle");
  if (!fill) {
    fill = document.createElement("div");
    fill.className = "volume-fill";
    bar.appendChild(fill);
  }
  if (!handle) {
    handle = document.createElement("div");
    handle.className = "volume-handle";
    bar.appendChild(handle);
  }

  let lastVol = 1; // ghi nhớ mức âm trước khi mute (để unmute trả lại mức cũ)
  let rafId = 0; // tránh render quá nhiều lần trong 1 frame

  const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
  // Tính volume theo vị trí con trỏ X trên thanh bar
  function setFromClientX(clientX) {
    const r = bar.getBoundingClientRect(); // toạ độ & kích thước thanh
    const v = clamp01((clientX - r.left) / r.width); // đổi toạ độ X -> tỉ lệ 0..1
    player.audio.muted = false; // có thao tác kéo => bỏ mute
    player.audio.volume = v; // gán -> sẽ phát 'volumechange'
  }
  //  Render UI (fill & handle & icon) — gom bằng rAF cho mượt
  function render() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      const v = player.audio.muted ? 0 : player.audio.volume;
      fill.style.width = `${v * 100}%`;
      handle.style.left = `${v * 100}%`;

      const i =
        btn.querySelector("i") || btn.appendChild(document.createElement("i"));
      i.className =
        "fas " +
        (v === 0
          ? "fa-volume-mute"
          : v < 0.5
          ? "fa-volume-down"
          : "fa-volume-up");
    });
  }

  // Click trên thanh
  bar.addEventListener("click", (e) => setFromClientX(e.clientX));

  // Kéo mượt bằng Pointer Events (cho cả thanh & handle)
  function startDrag(e) {
    e.preventDefault();
    const id = e.pointerId;
    (e.target.closest(".volume-bar") || bar).setPointerCapture?.(id);
    setFromClientX(e.clientX);

    const onMove = (ev) => {
      ev.preventDefault();
      setFromClientX(ev.clientX);
    };
    const onUp = () => {
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
      bar.removeEventListener("pointercancel", onUp);
    };
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp, { once: true });
    bar.addEventListener("pointercancel", onUp, { once: true });
  }
  bar.addEventListener("pointerdown", startDrag);
  handle.addEventListener("pointerdown", startDrag);

  // Nút mute/unmute
  btn.addEventListener("click", () => {
    if (player.audio.muted || player.audio.volume === 0) {
      player.audio.muted = false;
      player.audio.volume = lastVol || 0.6;
    } else {
      lastVol = player.audio.volume || lastVol;
      player.audio.muted = true;
    }
  });

  // Sync khi volume đổi từ chỗ khác
  player.audio.addEventListener("volumechange", render);

  // Khởi tạo
  if (!btn.querySelector("i"))
    btn.innerHTML = `<i class="fas fa-volume-up"></i>`;
  render();
}
