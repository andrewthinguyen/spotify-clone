// features/ui-bottom-bar.js
import player from "./player.js";

(function initBottomBar() {
  const $center = document.querySelector(".player-center");
  if (!$center) {
    // Trang không có thanh điều khiển -> thoát
    return;
  }
  ///

  // ===== lấy 5 nút theo THỨ TỰ trong .player-controls =====
  const btns = $center.querySelectorAll(".player-controls .control-btn");
  const [$btnShuffle, $btnPrev, $btnPlay, $btnNext, $btnRepeat] = btns;

  // ===== progress + time =====
  const $container = $center.querySelector(".progress-container");
  const $progress = $container?.querySelector(".progress-bar");
  const times = $container?.querySelectorAll(".time") || [];
  const $cur = times[0] || null;
  const $dur = times[1] || null;

  let $fill = $progress?.querySelector(".progress-fill");
  let $handle = $progress?.querySelector(".progress-handle");

  if (!$progress.style.position) $progress.style.position = "relative";
  Object.assign($fill.style, {
    position: "absolute",
    inset: "0 auto 0 0",
    width: "0%",
    background: "currentColor",
    opacity: 0.9,
    borderRadius: "999px",
    height: "100%",
  });
  Object.assign($handle.style, {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "currentColor",
  });
  $progress.append($fill, $handle);

  let dragging = false;

  // ===== helpers =====
  const fmt = (sec = 0) => {
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    const m = Math.floor(sec / 60);
    const h = Math.floor(sec / 3600);
    return h
      ? `${h}:${(m % 60).toString().padStart(2, "0")}:${s}`
      : `${m}:${s}`;
  };
  const setPlayIcon = (playing) => {
    const i = $btnPlay?.querySelector("i");
    if (!i) return;
    i.classList.toggle("fa-play", !playing);
    i.classList.toggle("fa-pause", playing);
  };

  const renderProgress = (ct, d) => {
    if ($cur) $cur.textContent = fmt(ct);
    if ($dur) $dur.textContent = fmt(d);
    const pct = d ? (ct / d) * 100 : 0;
    if ($fill) $fill.style.width = `${pct}%`;
    if ($handle) $handle.style.left = `${pct}%`;
  };

  const seekAt = (clientX) => {
    if (!$progress) return 0;
    const rect = $progress.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const d = player.audio.duration || 0;
    const t = ratio * d;
    renderProgress(t, d);
    return t;
  };

  // ===== Player -> UI =====
  player.audio.addEventListener("timeupdate", () => {
    if (dragging) return;
    renderProgress(player.audio.currentTime || 0, player.audio.duration || 0);
  });
  player.audio.addEventListener("loadedmetadata", () => {
    renderProgress(player.audio.currentTime || 0, player.audio.duration || 0);
  });
  player.audio.addEventListener("play", () => setPlayIcon(true));
  player.audio.addEventListener("pause", () => setPlayIcon(false));

  // ===== UI -> Player =====
  $btnPlay?.addEventListener("click", () => player.toggle());
  $btnNext?.addEventListener("click", () => player.next());
  $btnPrev?.addEventListener("click", () => player.prev());

  // shuffle: bật/tắt cờ và highlight nút đầu
  $btnShuffle?.addEventListener("click", () => {
    player.shuffle = !player.shuffle;
    $btnShuffle.classList.toggle("active", player.shuffle);
  });

  // repeat: hiện tại next/prev của bạn đã vòng; nút này chỉ highlight
  $btnRepeat?.addEventListener("click", () => {
    $btnRepeat.classList.toggle("active");
  });

  // ===== Seeking trên progress =====
  if ($progress) {
    $progress.addEventListener("pointerdown", (e) => {
      dragging = true;
      $progress.setPointerCapture?.(e.pointerId);
      player.seekTo(seekAt(e.clientX));
    });
    $progress.addEventListener("pointermove", (e) => {
      if (dragging) player.seekTo(seekAt(e.clientX));
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      $progress.releasePointerCapture?.(e.pointerId);
    };
    $progress.addEventListener("pointerup", end);
    $progress.addEventListener("pointercancel", end);
  }
  //Hàm đồng bộ nút Play to và Play ở Controls
  // === LINK NÚT PLAY BỰ (BANNER) VỚI NÚT PLAY DƯỚI ===

  // Lấy nút play dưới (ưu tiên .play-btn; fallback là nút thứ 3)
  const $btnPlayBottom = $center.querySelectorAll(
    ".player-controls .control-btn"
  )[2];

  // Tìm nút play bự mỗi lần dùng (banner có thể re-render)
  const getBigPlay = () => document.querySelector(".play-btn-large");

  // Đổi icon <i> play <-> pause cho 1 nút
  function flipIcon($btn, playing) {
    if (!$btn) return;
    const i = $btn.querySelector("i");
    if (!i) return;
    // Nếu bạn dùng fa-circle-play/fa-circle-pause, đổi 2 class dưới cho khớp
    i.classList.toggle("fa-play", !playing);
    i.classList.toggle("fa-pause", playing);
    $btn.classList.toggle("playing", playing); // tuỳ CSS bạn dùng
    $btn.classList.toggle("is-playing", playing); // cho nút banner (nếu muốn style)
  }

  // Đồng bộ cả 2 nút theo trạng thái <audio>
  function syncBoth() {
    const playing = !!player.audio.src && !player.audio.paused;
    flipIcon($btnPlayBottom, playing);
    flipIcon(getBigPlay(), playing);
  }

  // Click nút play bự -> điều khiển cùng 1 player
  // - Nếu chưa có bài và nút có data-id/data-track-id -> phát bài banner
  // - Nếu đã có bài -> toggle (play/pause)
  document.addEventListener("click", async (e) => {
    const big = e.target.closest(".play-btn-large");
    if (!big) return;

    const mainId = big.dataset.id || big.dataset.trackId;
    if (!player.audio.src && mainId) {
      await player.playById(String(mainId)); // xin URL + play
    } else {
      player.toggle(); // play/pause bài hiện tại
    }
    syncBoth();
  });

  // Nghe sự kiện audio để tự đồng bộ icon 2 nút
  player.audio.addEventListener("play", syncBoth);
  player.audio.addEventListener("pause", syncBoth);
  player.audio.addEventListener("ended", syncBoth);
  player.audio.addEventListener("loadstart", syncBoth);

  // Nếu người dùng bấm nút play dưới, sau toggle thì sync lại (đề phòng module khác đã gắn handler)
  $btnPlayBottom?.addEventListener("click", () => setTimeout(syncBoth, 0));

  // Gọi 1 lần khi khởi tạo
  syncBoth();

  // ===== init =====
  renderProgress(player.audio.currentTime || 0, player.audio.duration || 0);
  setPlayIcon(!player.audio.paused);
})();
