import Sprite from "./Sprite.js";
import CollisionBlock from "./CollisionBlock.js";
import { keys, lastKey } from "../helpers/keys.js";
import { context } from "../helpers/canvas.js";
import { map } from "../helpers/objects.js";

export default class Player extends Sprite {
  constructor({ collisionBlocks = [] }) {
    super({
      imageSrc: "./assets/idleRight.png",
      imageScale: 2.5,
      frameRate: 3,
      frameBuffer: 30,
      animations: {
        idleLeft: {
          imageSrc: "./assets/idleLeft.png",
          frameRate: 3,
          frameBuffer: 30,
        },
        idleRight: {
          imageSrc: "./assets/idleRight.png",
          frameRate: 3,
          frameBuffer: 30,
        },
        runLeft: {
          imageSrc: "./assets/runLeft.png",
          frameRate: 8,
          frameBuffer: 15,
        },
        runRight: {
          imageSrc: "./assets/runRight.png",
          frameRate: 8,
          frameBuffer: 15,
        },
        jumpLeft: {
          imageSrc: "./assets/jumpLeft.png",
          frameRate: 8,
          frameBuffer: 12,
        },
        jumpRight: {
          imageSrc: "./assets/jumpRight.png",
          frameRate: 8,
          frameBuffer: 12,
        },
      },
    });
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.movement = {
      lastDirection: "right",
      isGrounded: true,
      jumpCount: 0,
      maxJumpCount: 2,
    };
    this.collisionBlocks = collisionBlocks;
    this.health = 3;
  }

  movePlayer() {
    this.position.x += this.velocity.x;
    //horizontal movement (left, right)
    if ((keys.a.pressed && lastKey === "a") || (keys.ArrowLeft.pressed && lastKey === "ArrowLeft")) {
      this.velocity.x = -1;
      this.movement.lastDirection = "left";
      this.switchAnimation("runLeft");
    } else if ((keys.d.pressed && lastKey === "d") || (keys.ArrowRight.pressed && lastKey === "ArrowRight")) {
      this.velocity.x = 1;
      this.movement.lastDirection = "right";
      this.switchAnimation("runRight");
    } else {
      this.velocity.x = 0;
      if (this.movement.isGrounded) {
        if (this.movement.lastDirection === "left") {
          this.switchAnimation("idleLeft");
        } else if (this.movement.lastDirection === "right") {
          this.switchAnimation("idleRight");
        }
      }
    }
    //vertical movement (jump)
    if ((keys.w.pressed || keys.ArrowUp.pressed || keys.spacebar.pressed) && (this.movement.isGrounded || this.movement.jumpCount < this.movement.maxJumpCount)) {
      this.velocity.y = -9;
      this.movement.isGrounded = false;
      this.movement.jumpCount++;
      keys.w.pressed = false;
      keys.ArrowUp.pressed = false;
      keys.spacebar.pressed = false;
      if (this.movement.lastDirection === "left") {
        this.switchAnimation("jumpLeft");
      } else if (this.movement.lastDirection === "right") {
        this.switchAnimation("jumpRight");
      }
    }
  }

  applyGravity() {
    const gravity = 0.25;
    this.position.y += this.velocity.y;
    this.velocity.y += gravity;
  }

  isCollidingWith(collisionBlock) {
    const player = {
      left: this.position.x,
      right: this.position.x + this.width * this.imageScale,
      top: this.position.y,
      bottom: this.position.y + this.height * this.imageScale,
    };
    const collision = {
      left: collisionBlock.position.x + collisionBlock.shape[0].x * CollisionBlock.scale,
      right: collisionBlock.position.x + (collisionBlock.shape[0].x + collisionBlock.dimensions.width) * CollisionBlock.scale,
      top: collisionBlock.position.y + collisionBlock.shape[0].y * CollisionBlock.scale,
      bottom: collisionBlock.position.y + (collisionBlock.shape[0].y + collisionBlock.dimensions.height) * CollisionBlock.scale,
    };
    if (player.left <= collision.right && player.right >= collision.left && player.top <= collision.bottom && player.bottom >= collision.top) {
      return true;
    }
  }

  checkForHorizontalCollisions() {
    this.position.x += this.velocity.x;
    for (let collisionBlock of this.collisionBlocks) {
      if (this.isCollidingWith(collisionBlock)) {
        const player = {
          left: this.position.x,
          right: this.position.x + this.width * this.imageScale
        };
        const collision = {
          left: collisionBlock.position.x + collisionBlock.shape[0].x * CollisionBlock.scale,
          right: collisionBlock.position.x + (collisionBlock.shape[0].x + collisionBlock.dimensions.width) * CollisionBlock.scale
        };

        if (this.velocity.x < 0) { //collision on x-axis going to the left
          this.velocity.x = 0;
          this.position.x = collision.right + 0.01; //to the right of the collisionBlock
          break;
        } else if (this.velocity.x > 0) { //collision on x-axis to the right
          this.velocity.x = 0;
          this.position.x = collision.left - (player.right - player.left) - 0.01; //to the left of the collisionBlock
          break;
        }
      }
    }

    //collision with the left/right map border
    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + this.width * this.imageScale > map.width) {
      this.position.x = map.width - this.width * this.imageScale;
    }
  }
  
  checkForVerticalCollisions() {
    for (let collisionBlock of this.collisionBlocks) {
      if (this.isCollidingWith(collisionBlock)) {
        if (this.velocity.y < 0) { //collision on y-axis going up
          this.velocity.y = 0;
          this.position.y = collisionBlock.position.y + collisionBlock.dimensions.height * CollisionBlock.scale + 0.01; //to the bottom of the collisionBlock
          break;
        } else if (this.velocity.y > 0) { //collision on y-axis going down
          this.velocity.y = 0;
          this.position.y = collisionBlock.position.y - this.height * this.imageScale - 0.01; //to the top of the collisionBlock
          this.movement.isGrounded = true;
          this.movement.jumpCount = 0;
          break;
        }
      }
    }

    //temporary collision with the bottom map border (before the getsHit is implemented)
    if (this.position.y + this.height * this.imageScale > map.height) {
      this.velocity.y = 0;
      this.position.y = map.height - this.height * this.imageScale;
      this.movement.isGrounded = true;
      this.movement.jumpCount = 0;
    }
  }

  update() {
    // context.fillStyle = 'green';
    // context.fillRect(this.position.x, this.position.y, this.width * this.imageScale, this.height * this.imageScale);
    super.update();
    this.movePlayer();
    this.checkForHorizontalCollisions();
    this.applyGravity();
    this.checkForVerticalCollisions();
  }
}