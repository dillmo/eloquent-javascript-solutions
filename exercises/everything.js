function everyLoop(array, test) {
  result = true;
  for (element of array) {
    result = result && test(element);
  }
  return result;
}

function everySome(array, test) {
  return !array.some(v => !test(v));
}
