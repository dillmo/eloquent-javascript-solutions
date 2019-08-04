let eventHandlers = [];

function addEventListener(type, action) {
  window.addEventListener(type, action);
  eventHandlers.push({type: type, action: action});
}

function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  addEventListener("keydown", track);
  addEventListener("keyup", track);
  return down;
}

function onRelease(key, action) {
  function doOnRelease(event) {
    if (key == event.key) {
      action();
      event.preventDefault();
    }
  }
  addEventListener("keydown", doOnRelease);
}

function cleanup() {
  for (let handler of eventHandlers) {
    window.removeEventListener(handler.type, handler.action);
  }
}

exports.trackKeys = trackKeys;
exports.onRelease = onRelease;
exports.cleanup = cleanup;
