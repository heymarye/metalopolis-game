import { context } from "../helpers/canvas.js";

export default class CollisionBlock {
  static width = 16;
  static height = 16;
  static scale = 4;
  constructor({ position, shape, dimensions }) {
    this.position = position;
    this.shape = shape;
    this.dimensions = dimensions;
  }

  draw() {
    context.fillStyle = "rgba(255, 0, 0, 0)";
    context.beginPath();
    //define the custom shape
    this.shape.forEach((point, index) => { //loop over each point in the shape
      if (index === 0) { //the first point in the shape
        context.moveTo(
          this.position.x + point.x * CollisionBlock.scale,
          this.position.y + point.y * CollisionBlock.scale
        ); //sets the starting point for the path
      } else {
        context.lineTo(
          this.position.x + point.x * CollisionBlock.scale,
          this.position.y + point.y * CollisionBlock.scale
        ); //draws a straight line to the specified point
      }
    });
    context.closePath();
    context.fill();
  }
}