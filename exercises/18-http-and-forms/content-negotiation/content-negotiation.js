let url = "https://eloquentjavascript.net/author";
let mediaTypes = ["text/plain", "text/html", "application/json",
                  "application/rainbows+unicorns"];
let table = document.createElement("table");
let headers = document.createElement("tr");
for (let header of ["Media Type", "Status", "Content"]) {
  let cell = document.createElement("td");
  cell.textContent = header;
  headers.appendChild(cell);
}
table.appendChild(headers);
for (let mediaType of mediaTypes) {
  let row = document.createElement("tr");
  let method = document.createElement("td");
  method.textContent = mediaType;
  row.appendChild(method);
  let responseCode = document.createElement("td");
  row.appendChild(responseCode);
  let responseContent = document.createElement("td");
  row.appendChild(responseContent);
  fetch(url, {headers: {Accept: mediaType}}).then(response => {
    responseCode.textContent = response.status;
    return response.text();
  }).then(text => {
    responseContent.textContent = text;
  });
  table.appendChild(row);
}
document.body.appendChild(table);
