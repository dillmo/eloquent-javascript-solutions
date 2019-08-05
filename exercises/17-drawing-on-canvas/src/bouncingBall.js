// triple buffering
let canvases = [createCanvas(400, 200),
                createCanvas(400, 200),
                createCanvas(400, 200)];
canvases[0].style.border = "2px solid";
let cx = canvases.map(c => c.getContext("2d"));

function createCanvas(width, height) {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

class Ball {
  constructor(r, x, y, vx, vy, ax, ay) {
    this.radius = r;
    this.x = x;
    this.y = y;
    this.v = {x: vx, y: vy};
    this.a = {x: ax, y: ay};
  }

  update(dt) {
    if (this.x + this.v.x * dt < 0 ||
        this.x + this.v.x * dt + 2 * this.radius > 400) {
      this.v.x *= -1;
    }
    if (this.y + this.v.y * dt < 0 ||
        this.y + this.v.y * dt + 2 * this.radius > 200) {
      this.v.y *= -1;
    }
    return new Ball(this.radius, this.x + this.v.x * dt, this.y + this.v.y * dt,
                    this.v.x + this.a.x * dt, this.v.y + this.a.y * dt,
                    this.a.x, this.a.y);
  }
}

function animate(ball) {
  let lastTime;
  function drawFrame(time) {
    cx[0].drawImage(canvases[1], 0, 0);
    cx[1].drawImage(canvases[2], 0, 0);
    cx[2].fillStyle = "white";
    cx[2].fillRect(0, 0, canvases[2].width, canvases[2].height);
    cx[2].fillStyle = "red";
    cx[2].beginPath();
    cx[2].arc(ball.x + ball.radius, ball.y + ball.radius, ball.radius, 0, 7);
    cx[2].fill();
    if (lastTime) ball = ball.update(Math.min((time - lastTime) / 1000, 0.25));
    lastTime = time;
  }
  setInterval(() => requestAnimationFrame(drawFrame), 1000 / 60);
}

export default function drawBouncingBall() {
  animate(new Ball(20, 200, 50, 200, 0, 0, 200));
  return canvases[0];
}
