import Vec from "./vec";

export class GraphNode {
    public readonly edges: GraphNode[];
    public pos: Vec;

    constructor() {
        this.pos = new Vec(Math.random() * 1000, Math.random() * 1000);
        this.edges = [];
    }

    public connect(other: GraphNode) {
        this.edges.push(other);
        other.edges.push(this);
    }

    public hasEdge(other: GraphNode) {
        return this.edges.includes(other);
    }
}

export function treeGraph(depth: number, branches: number): GraphNode[] {
    let graph = [new GraphNode()];
    if (depth > 1) {
        for (let i = 0; i < branches; i++) {
            const subGraph = treeGraph(depth - 1, branches);
            graph[0].connect(subGraph[0]);
            graph = graph.concat(subGraph);
        }
    }
    return graph;
}
