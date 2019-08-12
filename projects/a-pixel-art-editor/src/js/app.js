import elt from "./dom";
import {PictureCanvas, drawPicture} from "./canvas";
import {pictureFromImage, Picture} from "./picture";
import {draw, fill, rectangle, pick, circle, line} from "./tools";
import {ToolSelect, ColorSelect} from "./controls";

let downKeys = [];

function handleShortcut(event, tools, dispatch) {
  // update downKeys
  if (event.type == "keydown" && !downKeys.some(key => key == event.key)) {
    downKeys.push(event.key);
  }
  if (event.type == "keyup") {
    downKeys = downKeys.filter(key => key != event.key);
  }

  if (downKeys.length == 1) {
    for (let name of Object.keys(tools)) {
      if (downKeys[0] == name[0]) dispatch({tool: name});
    }
  } else if (downKeys.length == 2 &&
             downKeys.some(key => key == "z") &&
             downKeys.some(key => key == "Control")) {
    dispatch({undo: true});
  }
}

class PixelEditor {
  constructor(state, config) {
    let {tools, controls, dispatch} = config;
    this.state = state;

    this.canvas = new PictureCanvas(state.picture, pos => {
      let tool = tools[this.state.tool];
      let onMove = tool(pos, this.state, dispatch);
      if (onMove) return pos => onMove(pos, this.state);
    });
    this.controls = controls.map(
      Control => new Control(state, config));
    this.dom = elt("div", {
                     tabIndex: 0,
                     onkeydown: event => handleShortcut(event, tools, dispatch),
                     onkeyup: event => handleShortcut(event, tools, dispatch)
                   }, this.canvas.dom, elt("br"),
                   ...this.controls.reduce(
                     (a, c) => a.concat(" ", c.dom), []));
  }

  syncState(state) {
    this.state = state;
    this.canvas.syncState(state.picture);
    for (let ctrl of this.controls) ctrl.syncState(state);
  }
}

class SaveButton {
  constructor(state) {
    this.picture = state.picture;
    this.dom = elt("button", {
      onclick: () => this.save()
    }, "\ud83d\udcbe Save");
  }

  save() {
    let canvas = elt("canvas");
    drawPicture(this.picture, canvas, 1);
    let link = elt("a", {
      href: canvas.toDataURL(),
      download: "pixelart.png"
    });
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  syncState(state) { this.picture = state.picture; }
}

class LoadButton {
  constructor(_, {dispatch}) {
    this.dom = elt("button", {
      onclick: () => startLoad(dispatch)
    }, "\ud83d\udcc1 Load");
  }

  syncState() {}
}

function startLoad(dispatch) {
  let input = elt("input", {
    type: "file",
    onchange: () => finishLoad(input.files[0], dispatch)
  });
  document.body.appendChild(input);
  input.click();
  input.remove();
}

function finishLoad(file, dispatch) {
  if (file == null) return;
  let reader = new FileReader();
  reader.addEventListener("load", () => {
    let image = elt("img", {
      onload: () => dispatch({
        picture: pictureFromImage(image)
      }),
      src: reader.result
    });
  });
  reader.readAsDataURL(file);
}

function historyUpdateState(state, action) {
  if (action.undo == true) {
    if (state.done.length == 0) return state;
    return Object.assign({}, state, {
      picture: state.done[0],
      done: state.done.slice(1),
      doneAt: 0
    });
  } else if (action.picture && state.doneAt < Date.now() - 1000) {
    return Object.assign({}, state, action, {
      done: [state.picture, ...state.done],
      doneAt: Date.now()
    });
  } else {
    return Object.assign({}, state, action);
  }
}

class UndoButton {
  constructor(state, {dispatch}) {
    this.dom = elt("button", {
      onclick: () => dispatch({undo: true}),
      disabled: state.done.length == 0
    }, "\u2baa Undo");
  }
  syncState(state) {
    this.dom.disabled = state.done.length == 0;
  }
}

const startState = {
  tool: "draw",
  color: "#000000",
  picture: Picture.empty(60, 30, "#f0f0f0"),
  done: [],
  doneAt: 0
};

const baseTools = {draw, fill, rectangle, circle, pick, line}

const baseControls = [
  ToolSelect, ColorSelect, SaveButton, LoadButton, UndoButton
];

export default function startPixelEditor({state = startState,
                                          tools = baseTools,
                                          controls = baseControls}) {
  let app = new PixelEditor(state, {
    tools,
    controls,
    dispatch(action) {
      state = historyUpdateState(state, action);
      app.syncState(state);
    }
  });
  return app.dom;
}
