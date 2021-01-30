class Sprite {
  constructor(animation, data) {
    this.animation = animation;
    this.data = data;
    this.index = 0;
    this.animate = false;
    this.speed = 1;
    this.x = 0;
    this.y = 0;
    this.w = data.width;
    this.h = data.height;
    this.continousAnimate = true;
  }

  update() {
    push();
    imageMode(CENTER);
    if (this.animate) {
      image(this.animation, this.x, this.y, this.w, this.h, this.data.width * floor(this.index), 0, this.data.width, this.data.height);
      this.index = this.index + this.speed;
      if (this.index >= this.data.frames) {
        this.index = 0;
        if (!this.continousAnimate){
          this.animate = false;
        }
      }
    }
    pop();
  }

  animateOnce() {
    this.animate = true;
    this.continousAnimate = false;
    this.index = 0;
  }

  setSpeed(s) {
    if (s < 0) {
      s = 0;
    }
    this.speed = s;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  setSize(w,h){
    this.w = w;
    this.h = h;
  }

  scale(s){
    this.w = floor(this.w * s);
    this.h = floor(this.h * s);
  }

  copy(){
    let copySprite = new Sprite(this.animation, this.data);
    copySprite.speed = this.speed;
    copySprite.x = this.x;
    copySprite.y = this.y;
    copySprite.w = this.w;
    copySprite.h = this.h;
    return copySprite;
  }

}
