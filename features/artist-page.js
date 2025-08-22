// features/artist-page.js
import player from "./player.js";

// Đợi tới khi phần tử xuất hiện trong DOM
function waitForSelector(sel, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const found = document.querySelector(sel);
    if (found) return resolve(found);

    const obs = new MutationObserver(() => {
      const el = document.querySelector(sel);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      obs.disconnect();
      reject(new Error(`Timeout: ${sel}`));
    }, timeout);
  });
}

// Lấy queue id từ danh sách hiện tại
function getQueueIds() {
  return Array.from(
    document.querySelectorAll(".track-list .track-item[data-id]")
  ).map((el) => String(el.dataset.id));
}

// Init khi nút play to sẵn sàng
(async () => {
  let bigPlay;
  try {
    bigPlay = await waitForSelector(".play-btn-large[data-id]");
  } catch {
    // Không phải trang ca sĩ, bỏ qua
    return;
  }

  const mainId = String(bigPlay.dataset.id);
  const queueIds = getQueueIds();
  const startIdx = Math.max(0, queueIds.indexOf(mainId));

  // Đặt queue và PRELOAD bài chính (không phát)
  player.setQueue(queueIds.length ? queueIds : [mainId], startIdx);
  try {
    await player.preloadById(mainId);
  } catch (e) {
    console.error(e);
  }
})();

// Click 1 bài trong "Có thể bạn sẽ thích" -> phát bài đó
document.addEventListener("click", async (e) => {
  const card = e.target.closest(".track-list .track-item[data-id]");
  if (!card) return;

  const id = String(card.dataset.id);
  const ids = getQueueIds();
  player.setQueue(ids, ids.indexOf(id));
  await player.playById(id);
});
