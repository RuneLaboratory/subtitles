export default class Timer {
  constructor() {
    this.elapsed = 0;
    this.isActive = false;
    this.lastFrameTime = Date.now();

    this.onTick = () => {};
    this.onCompleted = () => {};

    this.tick();
  }

  currentTime() {
    const t = this.elapsed;
    return Math.max(0, t);
  }

  pause() {
    this.isActive = false;

    return this;
  }

  reset() {
    this.elapsed = 0;
  }

  start() {
    this.isActive = true;

    return this;
  }

  forward(sec) {
    this.elapsed = this.elapsed + sec;
    this.onTick(this.currentTime());
  }

  backword(sec) {
    this.elapsed = this.elapsed - sec;
    this.onTick(this.currentTime());
  }

  setCurrentTime(inputTime) {
    this.elapsed = inputTime;
  }

  tick() {
    const currentFrameTime = Date.now();
    const deltaTime = currentFrameTime - this.lastFrameTime;
    this.lastFrameTime = currentFrameTime;

    if (this.isActive) {
      this.elapsed += deltaTime / 1000;
      this.onTick(this.currentTime());
    }

    //TODO cancel animation
    window.requestAnimationFrame(this.tick.bind(this));
  }
}

export function secondsToHms(d) {
  d = Number(d);

  if (d < 0) {
    return "-";
  }

  let h = Math.floor(d / 3600);
  let m = Math.floor((d % 3600) / 60);
  let s = Math.floor((d % 3600) % 60);

  let hDisplay = h < 10 ? "0" + h : h;
  let mDisplay = m < 10 ? "0" + m : m;
  let sDisplay = s < 10 ? "0" + s : s;
  if (h === 0) {
    return `${mDisplay}:${sDisplay}`;
  }
  return `${hDisplay}:${mDisplay}:${sDisplay}`;
}

export function hmsTosec(d) {
  let s = Number(d.slice(-2));
  d = d.slice(0, -2);
  let m = Number(d.slice(-2));
  d = d.slice(0, -2);
  let h = Number(d.slice(-2));

  return h * 3600 + m * 60 + s;
}
