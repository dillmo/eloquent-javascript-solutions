import drawShapes from "./shapes";
import drawPieChart from "./pieChart";
import drawBouncingBall from "./bouncingBall";

document.getElementById("shapes").appendChild(drawShapes());
document.getElementById("the-pie-chart").appendChild(drawPieChart());
document.getElementById("a-bouncing-ball").appendChild(drawBouncingBall());
