function buildGrid() {
  let grid = document.createElement("table");
  for (let y = 0; y < 16; y++) {
    let row = document.createElement("tr");
    for (let x = 0; x < 16; x++) {
      let cell = document.createElement("td");
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Math.random() > 0.85;
      checkbox.id = `${x},${y}`;
      cell.appendChild(checkbox);
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  return grid;
}

function stepGrid() {
  let state = [];
  let checkboxes = document.querySelectorAll("input[type=checkbox]");
  for (checkbox of checkboxes) {
    let commaIndex = checkbox.id.indexOf(",");
    let x = Number(checkbox.id.slice(0, commaIndex))
    let y = Number(checkbox.id.slice(commaIndex + 1));
    let adjacentLive = 0;
    let neighbors = [];
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (i != x || j != y) {
          neighbors.push(document.getElementById(`${i},${j}`));
        }
      }
    }
    for (neighbor of neighbors) {
      if (neighbor && neighbor.checked) adjacentLive++;
    }
    if (state[x] === undefined) state[x] = [];
    if (adjacentLive < 2 || adjacentLive > 3) state[x][y] = false;
    if (adjacentLive == 3) state[x][y] = true;
  }
  updateGrid(state);
}

function updateGrid(state) {
  state.forEach((row, x) => {
    row.forEach((val, y) => {
      document.getElementById(`${x},${y}`).checked = val;
    });
  });
}

document.getElementById("game").appendChild(buildGrid());
document.querySelector("form").addEventListener("submit", event => {
  event.preventDefault();
  stepGrid();
});
