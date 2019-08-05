let canvas = document.createElement("canvas");
const step = 100, margin = 10;
canvas.width = 5 * step;
canvas.height = step;
let cx = canvas.getContext("2d");

function drawTrapezoid(topLeft) {
  cx.beginPath();
  cx.moveTo(topLeft.x + 3 * margin, topLeft.y + 3 * margin);
  cx.lineTo(topLeft.x + step - 3 * margin, topLeft.y +  3 * margin);
  cx.lineTo(topLeft.x + step - margin, topLeft.y + step - 3 * margin);
  cx.lineTo(topLeft.x + margin, topLeft.y + step - 3 * margin);
  cx.closePath();
  cx.stroke();
}

function drawRedDiamond(topLeft) {
  cx.beginPath();
  cx.moveTo(topLeft.x + step / 2, topLeft.y + margin);
  cx.lineTo(topLeft.x + step - margin, topLeft.y + step / 2);
  cx.lineTo(topLeft.x + step / 2, topLeft.y + step - margin);
  cx.lineTo(topLeft.x + margin, topLeft.y + step / 2);
  cx.fillStyle = "red";
  cx.fill();
}

function drawZigZag(topLeft) {
  cx.beginPath();
  cx.moveTo(topLeft.x + margin, topLeft.y + margin);
  let yStep = (step - 2 * margin) / 12;
  for (let i = 0; i < 6; i++) {
    cx.lineTo(topLeft.x + step - margin,
              (2 * i + 1) * yStep + topLeft.y + margin);
    cx.lineTo(topLeft.x + margin,
              (2 * i + 2) * yStep + topLeft.y + margin);
  }
  cx.stroke();
}

function drawSpiral(topLeft) {
  let segments = 100;
  let radStep = (19 / 3) * Math.PI / segments
  let k = (step - 2 * margin) / (2 * segments);
  let center = {x: topLeft.x + step / 2, y: topLeft.y + step / 2};
  cx.beginPath();
  cx.moveTo(center.x, center.y);
  for (let i = 1; i <= segments; i++) {
    cx.lineTo(center.x + Math.cos(i * radStep) * k * i,
              center.y + Math.sin(i * radStep) * k * i);
  }
  cx.stroke();
}

function drawYellowStar(topLeft) {
  let center = {x: topLeft.x + step / 2, y: topLeft.y + step / 2};
  let tips = 8;
  let radStep = 2 * Math.PI / tips, k = (step - 2 * margin) / 2;
  cx.beginPath();
  cx.moveTo(center.x + k, center.y);
  for (let i = 1; i <= tips; i++) {
    cx.quadraticCurveTo(center.x, center.y,
                        center.x + Math.cos(i * radStep) * k,
                        center.y + Math.sin(i * radStep) * k);
  }
  cx.fillStyle = "yellow";
  cx.fill();
}

export default function drawShapes() {
  drawTrapezoid({x: 0, y: 0});
  drawRedDiamond({x: step, y: 0});
  drawZigZag({x: 2 * step, y: 0});
  drawSpiral({x: 3 * step, y: 0});
  drawYellowStar({x: 4 * step, y: 0});
  return canvas;
}
