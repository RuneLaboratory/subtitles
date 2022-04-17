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