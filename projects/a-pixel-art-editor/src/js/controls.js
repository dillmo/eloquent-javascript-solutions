import elt from "./dom";

export class ToolSelect {
  constructor(state, {tools, dispatch}) {
    this.select = elt("select", {
      onchange: () => dispatch({tool: this.select.value})
    }, ...Object.keys(tools).map(name => elt("option", {
      selected: name == state.tool
    }, name)));
    this.dom = elt("label", null, "\ud83d\udd8c Tool: ", this.select);
  }
  syncState(state) { this.select.value = state.tool; }
}

export class ColorSelect {
  constructor(state, {dispatch}) {
    this.input = elt("input", {
      type: "color",
      value: state.color,
      onchange: () => dispatch({color: this.input.value})
    });
    this.dom = elt("label", null, "\ud83c\udfa8 Color: ", this.input);
  }
  syncState(state) { this.input.value = state.color; }
}
