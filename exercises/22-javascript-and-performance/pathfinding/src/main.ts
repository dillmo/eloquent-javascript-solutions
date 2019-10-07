import {GraphNode, treeGraph} from "./graph";

function findPath(a: GraphNode, b: GraphNode): GraphNode[] | undefined {
    const work: GraphNode[][] = [[a]];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < work.length; i++) {
        const path = work[i];
        const lastNode = path[path.length - 1];
        if (lastNode === b) {
            return path;
        }
        for (const neighbor of lastNode.edges) {
            // neighbor doesn't occur at end of any path in work list
            if (!work.reduce((l, p) => {
                    return l || p[p.length - 1] === neighbor;
                }, false)) {
                    // push new path that is current path + neighbor
                    work.push(path.concat(neighbor));
            }
        }
    }
}

function findPathStoreNodes(a: GraphNode, b: GraphNode): GraphNode[] | undefined {
    const work: GraphNode[][] = [[a]];
    const nodesExplored: GraphNode[] = [];

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < work.length; i++) {
        const path = work[i];
        const lastNode = path[path.length - 1];
        if (lastNode === b) {
            return path;
        }
        for (const neighbor of lastNode.edges) {
            if (!nodesExplored.includes(neighbor)) {
                nodesExplored.push(neighbor);
                work.push(path.concat(neighbor));
            }
        }
    }
}

function testFindPath(depth: number, branches: number, fun: (a: GraphNode, b: GraphNode) => GraphNode[] | undefined) {
    const graph = treeGraph(depth, branches);
    // add a cycle to the graph
    graph[1].connect(graph[graph.length - 1]);
    const soln = fun(graph[0], graph[graph.length - 1]);

    if (!soln) {
        // tslint:disable-next-line: no-console
        console.log("FAIL: no path");
        return;
    }

    if (soln.length !== 3) {
        // tslint:disable-next-line: no-console
        console.log(
            `FAIL: expected path length 3, got ${soln.length}`);
        return;
    }

    for (let i = 0; i < soln.length - 1; i++) {
        if (!soln[i].hasEdge(soln[i + 1])) {
            // tslint:disable-next-line: no-console
            console.log("FAIL: broken path");
            return;
        }
    }

    // tslint:disable-next-line: no-console
    console.log("SUCCESS: path finder passed all tests");
}

// testFindPath(6, 6, findPath);

function timeFindPath(depth: number, branches: number, fun: (a: GraphNode, b: GraphNode) => GraphNode[] | undefined) {
    const graph = treeGraph(depth, branches);
    const time = Date.now();
    fun(graph[0], graph[graph.length - 1]);
    return Date.now() - time;
}

// tslint:disable-next-line: no-console
console.log(timeFindPath(6, 6, findPath), "ms");
console.log(timeFindPath(6, 6, findPathStoreNodes), "ms");
