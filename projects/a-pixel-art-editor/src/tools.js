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

const around = [{dx: -1, dy: 0}, {dx: 1, dy: 0},
                {dx: 0, dy: -1}, {dx: 0, dy: 1}];

function line(start, state, dispatch) {
  function drawLine(pos) {
    if (start.x == pos.x) {
      // draw vertical line to avoid division by zero
    } else {
      let slope = (pos.y - start.y) / (pos.x - start.x);
      if (-1 < slope && slope < 1) {
        // interpolate along x
      } else {
        // interpolate along y
      }
    }
  }
}

function interpolate(slope, distance) {
  for (let i = 0; i < distance; i++) {
    
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
