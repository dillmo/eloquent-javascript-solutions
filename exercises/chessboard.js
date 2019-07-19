let size = 8;

let evenRow = "", oddRow = "";
for (let i = 0; i < size; i++) {
  if (i % 2 == 0) {
    evenRow += " ";
    oddRow += "#";
  } else {
    evenRow += "#";
    oddRow += " ";
  }
}

for (let i = 0; i < size; i++) {
  if (i % 2 == 0) {
    console.log(evenRow);
  } else {
    console.log(oddRow);
  }
}
