let canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 240;
let cx = canvas.getContext("2d");

function drawSlices(results) {
  let total = results.reduce((sum, {count}) => sum + count, 0);
  // start at the top
  let currentAngle = -0.5 * Math.PI;
  for (let result of results) {
    let sliceAngle = (result.count / total) * 2 * Math.PI;
    cx.beginPath();
    // center=200,120, radius=100
    // from current angle, clockwise by slice's angle
    cx.arc(200, 120, 100, currentAngle, currentAngle + sliceAngle);
    currentAngle += sliceAngle;
    cx.lineTo(200, 120);
    cx.fillStyle = result.color;
    cx.fill();
  }
}

function drawLabels(results, circleTopLeft) {
  let total = results.reduce((sum, {count}) => sum + count, 0);
  let currentAngle = -0.5 * Math.PI;
  for (let result of results) {
    currentAngle += (result.count / total) * Math.PI;
    let arc = {x: Math.cos(currentAngle), y: Math.sin(currentAngle)}
    cx.beginPath();
    let left, right;
    if (arc.x < 0) {
      left = 0;
      right = arc.x * 100 + circleTopLeft.x + 100;
    } else {
      left = arc.x * 100 + circleTopLeft.x + 100;
      right = 400;
    }
    cx.moveTo(left, arc.y * 100 + circleTopLeft.y + 100);
    cx.lineTo(right, arc.y * 100 + circleTopLeft.y + 100);
    cx.stroke();
    cx.fillStyle = "black";
    cx.font = "12px Georgia";
    cx.fillText(result.name, left + 5, arc.y * 100 + circleTopLeft.y + 100 - 5);
    currentAngle += (result.count / total) * Math.PI;
  }
}

export default function drawPieChart() {
  const results = [
    {name: "Satisfied", count: 1043, color: "lightblue"},
    {name: "Neutral", count: 563, color: "lightgreen"},
    {name: "Unsatisfied", count: 510, color: "pink"},
    {name: "No comment", count: 175, color: "silver"}
  ];
  drawSlices(results);
  drawLabels(results, {x: 100, y: 20});
  return canvas;
}
