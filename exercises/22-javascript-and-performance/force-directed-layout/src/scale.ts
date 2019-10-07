import { GraphNode } from "./graph";

export const nodeSize = 8;

export class Scale {
    private readonly offsetX: number;
    private readonly offsetY: number;
    private readonly scaleX: number;
    private readonly scaleY: number;
    constructor(graph: GraphNode[], width: number, height: number) {
        const xs = graph.map((node) => node.pos.x);
        const ys = graph.map((node) => node.pos.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        this.offsetX = minX;
        this.offsetY = minY;
        this.scaleX = (width - 2 * nodeSize) / (maxX - minX);
        this.scaleY = (height - 2 * nodeSize) / (maxY - minY);
    }

    public x(x: number) {
        return this.scaleX * (x - this.offsetX) + nodeSize;
    }

    public y(y: number) {
        return this.scaleY * (y - this.offsetY) + nodeSize;
    }
}
