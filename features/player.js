// features/player.js
import httpRequest from "../utils/httpRequest.js";
import { endpoints } from "../utils/endpoints.js";
import { getAuthToken } from "../utils/helpers.js";

class SimplePlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto"; // để buffer sẵn
    this.queue = []; // mảng id
    this.index = -1;
    this.shuffle = false;
    this.current = null;

    // thời gian
    this.audio.addEventListener("timeupdate", () => {
      //   console.log(this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener("ended", () => this.next());
  }

  setQueue(ids = [], startIndex = 0) {
    this.queue = ids.slice();
    this.index = Math.max(0, Math.min(startIndex, this.queue.length - 1));
  }

  hasSrc() {
    return !!this.audio.src;
  }

  // async _fetchStreamUrl(id) {
  //   // const token = getAuthToken?.();
  //   const res = await httpRequest.get(endpoints.trackById(id));

  //   const url = res.audio_url;

  //   if (!url) throw new Error("Không nhận được stream URL từ API /play");
  //   return url;
  // }
  async _fetchTrack(id) {
    const res = await httpRequest.get(endpoints.trackById(id));
    const track = res;
    if (!track.title || !track.image_url || !track.artist_name) {
      throw new Error("Không nhận được thông tin từ API /tracks/:id");
    }
    return track;
  }

  async preloadById(id) {
    const track = await this._fetchTrack(id);
    this.audio.src = track.audio_url;
    this.audio.currentTime = 0;
    this.current = track;
    window.dispatchEvent(
      new CustomEvent("player:trackchange", { detail: { track } })
    );
  }

  async playById(id) {
    // cập nhật index nếu id có trong queue
    const idx = this.queue.indexOf(String(id));
    if (idx !== -1) this.index = idx;

    await this.preloadById(id);
    await this.audio.play();
  }

  play() {
    return this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
  toggle() {
    this.audio.paused ? this.play() : this.pause();
  }

  async next() {
    if (!this.queue.length) return;

    if (this.shuffle && this.queue.length > 1) {
      let i = this.index;
      while (i === this.index) {
        i = Math.floor(Math.random() * this.queue.length);
      }
      this.index = i;
    } else {
      this.index = (this.index + 1) % this.queue.length; // vòng lại đầu
    }

    const id = this.queue[this.index];
    await this.preloadById(id);
    this.play();
  }

  async prev() {
    if (!this.queue.length) return;
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    if (this.shuffle && this.queue.length > 1) {
      let i = this.index;
      while (i === this.index) {
        i = Math.floor(Math.random() * this.queue.length);
      }
      this.index = i;
    } else {
      this.index = (this.index - 1 + this.queue.length) % this.queue.length; // vòng về cuối
    }

    const id = this.queue[this.index];
    await this.preloadById(id);
    this.play();
  }

  seekTo(sec) {
    const d = this.audio.duration || 0;
    this.audio.currentTime = Math.max(0, Math.min(sec, d || sec));
  }
}

const player = new SimplePlayer();
export default player;
