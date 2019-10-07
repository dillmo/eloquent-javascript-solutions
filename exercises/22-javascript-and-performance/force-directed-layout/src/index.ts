import { GraphNode, treeGraph } from "./graph";
import { nodeSize, Scale } from "./scale";

function drawGraph(graph: GraphNode[]) {
    let canvas = document.querySelector("canvas");
    if (!canvas) {
        canvas = document.body.appendChild(document.createElement("canvas"));
        canvas.width = canvas.height = 400;
    }
    const cx = canvas.getContext("2d")!;

    cx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = new Scale(graph, canvas.width, canvas.height);

    // draw the edges
    cx.strokeStyle = "orange";
    cx.lineWidth = 3;
    for (let i = 0; i < graph.length; i++) {
        const origin = graph[i];
        for (const target of origin.edges) {
            if (graph.indexOf(target) <= i) {
                continue;
            }
            cx.beginPath();
            cx.moveTo(scale.x(origin.pos.x), scale.y(origin.pos.y));
            cx.lineTo(scale.x(target.pos.x), scale.y(target.pos.y));
            cx.stroke();
        }
    }

    // draw the nodes
    cx.fillStyle = "purple";
    for (const node of graph) {
        cx.beginPath();
        cx.arc(scale.x(node.pos.x), scale.y(node.pos.y), nodeSize, 0, 7);
        cx.fill();
    }
}

const springLength = 40;
const springStrength = 0.1;
const repulsionStrength = 1500;

function forceDirected_simple(graph: GraphNode[]) {
    for (const node of graph) {
        for (const other of graph) {
            if (other === node) {
                continue;
            }
            const apart = other.pos.minus(node.pos);
            const distance = Math.max(1, apart.length);
            let forceSize = -repulsionStrength / (distance * distance);
            if (node.hasEdge(other)) {
                forceSize += (distance - springLength) * springStrength;
            }
            const normalized = apart.times(1 / distance);
            node.pos = node.pos.plus(normalized.times(forceSize));
        }
    }
}

function forceDirected_noRepeat(graph: GraphNode[]) {
    for (let i = 0; i < graph.length; i++) {
        const node = graph[i];
        for (let j = i + 1; j < graph.length; j++) {
            const other = graph[j];
            const apart = other.pos.minus(node.pos);
            const distance = Math.max(1, apart.length);
            let forceSize = -repulsionStrength / (distance * distance);
            if (node.hasEdge(other)) {
                forceSize += (distance - springLength) * springStrength;
            }
            const applied = apart.times(forceSize / distance);
            node.pos = node.pos.plus(applied);
            other.pos = other.pos.minus(applied);
        }
    }
}

const skipDistance = 175;

function forceDirected_skip(graph: GraphNode[]) {
    for (let i = 0; i < graph.length; i++) {
        const node = graph[i];
        for (let j = i + 1; j < graph.length; j++) {
            const other = graph[j];
            const apart = other.pos.minus(node.pos);
            const distance = Math.max(1, apart.length);
            const hasEdge = node.hasEdge(other);
            if (!hasEdge && distance > skipDistance) {
                continue;
            }
            let forceSize = -repulsionStrength / (distance * distance);
            if (hasEdge) {
                forceSize += (distance - springLength) * springStrength;
            }
            const applied = apart.times(forceSize / distance);
            node.pos = node.pos.plus(applied);
            other.pos = other.pos.minus(applied);
        }
    }
}

function forceDirected_noVector(graph: GraphNode[]) {
    for (let i = 0; i < graph.length; i++) {
        const node = graph[i];
        for (let j = i + 1; j < graph.length; j++) {
            const other = graph[j];
            const apartX = other.pos.x - node.pos.x;
            const apartY = other.pos.y - node.pos.y;
            const distance = Math.max(1,
                Math.sqrt(apartX * apartX + apartY * apartY));
            const hasEdge = node.hasEdge(other);
            if (!hasEdge && distance > skipDistance) {
                continue;
            }
            let forceSize = -repulsionStrength / (distance * distance);
            if (hasEdge) {
                forceSize += (distance - springLength) * springStrength;
            }
            const forceX = apartX * forceSize / distance;
            const forceY = apartY * forceSize / distance;
            node.pos.x += forceX;
            node.pos.y += forceY;
            other.pos.x -= forceX;
            other.pos.y -= forceY;
        }
    }
}

function runLayout(implementation: (graph: GraphNode[]) => void, graph: GraphNode[]) {
    function run(steps: number, time: number) {
        const startTime = Date.now();
        for (let i = 0; i < 100; i++) {
            implementation(graph);
        }
        time += Date.now() - startTime;
        drawGraph(graph);
        if (steps === 0) {
            // tslint:disable-next-line: no-console
            console.log(time);
        } else {
            requestAnimationFrame(() => run(steps - 100, time));
        }
    }
    run(4000, 0);
}

runLayout(forceDirected_noVector, treeGraph(4, 4));
