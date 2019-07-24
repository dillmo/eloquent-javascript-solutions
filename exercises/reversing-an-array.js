function reverseArray(array) {
  newArray = [];
  for (let i = array.length - 1; i >= 0; i--) {
    newArray.push(array[i]);
  }
  return newArray;
}

function reverseArrayInPlace(array) {
  let m = 0, n = array.length - 1;
  while (m < n) {
    let firstVal = array[m];
    array[m] = array[n];
    array[n] = firstVal;
    m++, n--;
  }
}
