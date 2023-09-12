import { context } from "../canvas.js";

class Platform {
  constructor({ position }) {
    this.position = position;
    this.width = 200,
    this.height = 10;
  }

  draw() {
    context.fillStyle = "black";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export { Platform };