export function draw(pos, state, dispatch) {
  function drawPixel({x, y}, state) {
    let drawn = {x, y, color: state.color};
    dispatch({picture: state.picture.draw([drawn])});
  }
  drawPixel(pos, state);
  return drawPixel;
}

export function rectangle(start, state, dispatch) {
  function drawRectangle(pos) {
    let xStart = Math.min(start.x, pos.x);
    let yStart = Math.min(start.y, pos.y);
    let xEnd = Math.max(start.x, pos.x);
    let yEnd = Math.max(start.y, pos.y);
    let drawn = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        drawn.push({x, y, color: state.color});
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawRectangle(start);
  return drawRectangle;
}

export function circle(start, state, dispatch) {
  function drawCircle(pos) {
    let dx = pos.x - start.x, dy = pos.y - start.y;
    let radius = Math.ceil(Math.sqrt(dx*dx + dy*dy));
    let yStart = Math.max(0, start.y - radius);
    let yEnd = Math.min(state.picture.height, start.y + radius);
    let xStart = Math.max(0, start.x - radius);
    let xEnd = Math.min(state.picture.width, start.x + radius);
    let drawn = [];
    for (let y = yStart; y <= yEnd; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        let theta = angle(start, {x, y});
        if (between(y, Math.sin(theta) * radius + start.y, start.y) &&
            between(x, Math.cos(theta) * radius + start.x, start.x)) {
          drawn.push({x, y, color: state.color});
        }
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawCircle(start);
  return drawCircle;
}

export function line (start, state, dispatch) {
  let draw = drawLine(start, state, dispatch);
  draw(start);
  return draw;
}

function buildDirections() {
  const top = {dx: 0, dy: -1}, topRight = {dx: 1, dy: -1};
  const right = {dx: 1, dy: 0}, bottomRight = {dx: 1, dy: 1};
  const bottom = {dx: 0, dy: 1}, bottomLeft = {dx: -1, dy: 1};
  const left = {dx: -1, dy: 0}, topLeft = {dx: -1, dy: -1};

  const around = [top, right, bottom, left];
  const upRight = [top, topRight, right];
  const downRight = [right, bottomRight, bottom];
  const downLeft = [bottom, bottomLeft, left];
  const upLeft = [left, topLeft, top];
  return {around, upRight, downRight, downLeft, upLeft};
}

const {around, upRight, downRight, downLeft, upLeft} = buildDirections();

function drawLine(start, state, dispatch) {
  function draw(pos) {
    let drawn = [];
    drawn.push(Object.assign({}, start, {color: state.color}));
    if (!(pos.x == start.x && pos.y == start.y)) {
      if (start.x == pos.x) {
        // build a vertical line if we can
        let startY = Math.min(start.y, pos.y), endY = Math.max(start.y, pos.y);
        for (let y = startY; y <= endY; y++) {
          drawn.push({x: pos.x, y, color: state.color});
        }
      } else if (start.y == pos.y) {
        // build a horizontal line if we can
        let startX = Math.min(start.x, pos.x), endX = Math.max(start.x, pos.x);
        for (let x = startX; x <= endX; x++) {
          drawn.push({x, y: pos.y, color: state.color});
        }
      } else {
        // otherwise use a mathematical function
        let m = (pos.y - start.y) / (pos.x - start.x);
        let b = m * start.x + start.y;
        let checkDist = s => lineInSquare(x => ({x, y: m * x + b}),
                                          y => ({x: (y - b) / m, y}),
                                          s);
        let directions;
        if (pos.x < start.x && pos.y < start.y) directions = upLeft;
        else if (pos.x < start.x && pos.y > start.y) directions = downLeft;
        else if (pos.x > start.x && pos.y < start.y) directions = upRight;
        else directions = downRight;
        for (let i = 0;; i++) {
          let neighbors = [];
          for (let direction of directions) {
            neighbors.push({x: drawn[i].x + direction.dx,
                            y: drawn[i].y + direction.dy});
          }
          if (neighbors.some(n => n.x == pos.x && n.y == pos.y)) {
            drawn.push(Object.assign({}, pos, {color: state.color}));
            break;
          }
          drawn.push(Object.assign({}, neighbors.reduce((a, b) => {
                       if (checkDist(a) < checkDist(b)) {
                         return a;
                       }
                       return b;
                     }),
                     {color: state.color}));
        }
      }
    }
    dispatch({picture: state.picture.draw(drawn)});
  }
  return draw;
}

// return the amount of line in a grid square
function lineInSquare(lineX, lineY, square) {
  let intersects = [];
  let xTest = x => between(x, square.x, square.x + 1);
  let yTest = (x, y) => between(y, square.y, square.y + 1);
  let tests = [
    {fun: lineX, val: square.y, test: xTest},
    {fun: lineX, val: square.y + 1, test: xTest},
    {fun: lineY, val: square.x, test: yTest},
    {fun: lineY, val: square.x + 1, test: yTest}
  ];
  for (let test of tests) {
    let {x, y} = test.fun(test.val);
    if (test.test(x, y)) intersects.push({x, y});
    if (intersects.length == 2) return distance(...intersects);
  }
}

function distance(a, b) {
  let dx = b.x - a.x, dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function between(val, a, b) {
  let min, max;
  if (a < b) {
    min = a;
    max = b;
  } else {
    min = b;
    max = a;
  }
  return min <= val && val <= max;
}

function angle(center, edge) {
  let opposite = edge.y - center.y;
  let adjacent = edge.x - center.x;
  return Math.atan2(opposite, adjacent);
}

export function fill({x, y}, state, dispatch) {
  let targetColor = state.picture.pixel(x, y);
  let drawn = [{x, y, color: state.color}];
  for (let done = 0; done < drawn.length; done++) {
    for (let {dx, dy} of around) {
      let x = drawn[done].x + dx, y = drawn[done].y + dy;
      if (x >= 0 && x < state.picture.width &&
          y >= 0 && y < state.picture.height &&
          state.picture.pixel(x, y) == targetColor &&
          !drawn.some(p => p.x == x && p.y == y)) {
        drawn.push({x, y, color: state.color});
      }
    }
  }
  dispatch({picture: state.picture.draw(drawn)});
}

export function pick(pos, state, dispatch) {
  dispatch({color: state.picture.pixel(pos.x, pos.y)});
}
