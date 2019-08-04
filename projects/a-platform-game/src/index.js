const {CanvasDisplay} = require("./display");
const {GAME_LEVELS} = require("./levels");
const {runGame} = require("./game");

runGame(GAME_LEVELS, CanvasDisplay);
