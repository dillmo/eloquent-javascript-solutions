export function draw(pos, state, dispatch) {
  let lastPos;
  let drawn = [];
  function drawPixel(pos) {
    if (lastPos) {
      drawn = drawn.concat(drawLine(lastPos, pos, state)
        .filter(d => !containsCoord(drawn, d)));
    } else {
      drawn.push({x: pos.x, y: pos.y, color: state.color});
    }
    lastPos = pos;
    dispatch({picture: state.picture.draw(drawn)});
  }
  drawPixel(pos);
  return drawPixel;
}

function containsCoord(array, coord) {
  for (let elem of array) {
    if (elem.x == coord.x && elem.y == coord.y) return true;
  }
  return false;
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

const around = [{dx: -1, dy: 0}, {dx: 1, dy: 0},
                {dx: 0, dy: -1}, {dx: 0, dy: 1}];

function drawLine(start, pos, state) {
  let {color} = state;
  let drawn = [];
  if (start.x == pos.x) {
    let first = Math.min(start.y, pos.y), last = Math.max(start.y, pos.y);
    for (let y = first; y <= last; y++) {
      drawn.push({x: pos.x, y, color});
    }
  } else {
    let slope = (pos.y - start.y) / (pos.x - start.x);
    if (-1 < slope && slope < 1) {
      let ys = interpolate(slope, Math.abs(pos.x - start.x));
      let x;
      if (pos.x < start.x) {
        x = pos.x;
        ys = ys.reverse().map(y => -y);
      } else {
        x = start.x;
      }
      ys.map(y => start.y + y).forEach((y, i) => {
        drawn.push({x: x + i, y, color});
      });
    } else {
      let xs = interpolate(1 / slope, Math.abs(pos.y - start.y));
      let y;
      if (pos.y < start.y) {
        y = pos.y;
        xs = xs.reverse().map(x => -x);
      } else {
        y = start.y;
      }
      xs.map(x => start.x + x).forEach((x, i) => {
        drawn.push({x, y: y + i, color});
      });
    }
  }
  return drawn;
}

export function line(start, state, dispatch) {
  drawLine(start, start, state, dispatch);
  return pos => dispatch({
    picture: state.picture.draw(drawLine(start, pos, state))
  });
}

function interpolate(slope, distance) {
  let vals = [];
  let negative;
  if (slope < 0) {
    negative = true;
    slope *= -1;
  }
  for (let i = 0; i <= distance; i++) {
    vals.push(Math.floor(i * slope));
  }
  if (negative) return vals.map(v => -v);
  return vals;
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
