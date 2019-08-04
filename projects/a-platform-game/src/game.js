const {State} = require("./state");
const {runAnimation} = require("./display");
const {trackKeys, onRelease} = require("./keys");
const cleanupKeyHandlers = require("./keys").cleanup;
const {Level} = require("./level");

function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  let paused = false;
  let arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);
  onRelease("Escape", () => paused = !paused);
  return new Promise(resolve => {
    runAnimation(time => {
      if (!paused) {
        state = state.update(time, arrowKeys);
        display.syncState(state);
      }
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        cleanupKeyHandlers();
        resolve(state.status);
        return false;
      }
    });
  });
}

async function runGame(plans, Display) {
  let lives = 3;
  for (let level = 0; level < plans.length && lives > 0;) {
    console.log(`${lives} lives remaining`);
    let status = await runLevel(new Level(plans[level] ),
                                Display);
    if (status == "won") level++;
    else lives--;
  }
  if (lives > 0) console.log("You've won!");
  else console.log("Game Over");
}

exports.runGame = runGame;
