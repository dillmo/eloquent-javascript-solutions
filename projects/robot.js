class PGroup {
  constructor(list) {
    this._elements = list;
  }

  has(element) {
    return this._elements.some(e => e == element);
  }

  add(element) {
    if (!this.has(element)) return new PGroup(this._elements.concat(element));
    return new PGroup(this._elements.map(e => e));
  }

  delete(element) {
    return new PGroup(this._elements.filter(e => e != element));
  }
}
PGroup.empty = new PGroup([]);

const roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

const roadGraph = buildGraph(roads);

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }

  static random(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
      let address = randomPick(Object.keys(roadGraph));
      let place;
      do {
        place = randomPick(Object.keys(roadGraph));
      } while (place == address);
      parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
  }
}

function runRobot(state, robot, memory, silent = false) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      if (!silent) console.log(`Done in ${turn} turns`);
      return turn;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    if (!silent) console.log(`Moved to ${action.direction}`);
  }
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

const mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

// score a route by the number of destinations in it
function scoreRoute(route, destinations) {
  let score = 0;
  for (let place of route) {
    score += destinations.filter(d => d == place).length;
  }
  return score;
}

function heuristicRobot({place, parcels}, route) {
  if (route.length == 0) {
    let destinations = parcels.map(p => p.place == place ? p.address : p.place);
    let routes = destinations.map(dest => {
      let newRoute = findRoute(roadGraph, place, dest);
      return {route: newRoute, score: scoreRoute(newRoute, destinations)};
    });
    route = routes.reduce((r1, r2) => r1.score > r2.score ? r1 : r2).route;
  }
  return {direction: route[0], memory: route.slice(1)};
}

function compareRobots([r1, r2], [r1Mem, r2Mem]) {
  steps = [0, 0];
  for (let i = 0; i < 100; i++) {
    let state = VillageState.random();
    steps[0] += runRobot(state, r1, r1Mem, true);
    steps[1] += runRobot(state, r2, r2Mem, true);
  }
  console.log(`Robot 1 averaged ${steps[0] / 100} steps.`);
  console.log(`Robot 2 averaged ${steps[1] / 100} steps.`);
}
