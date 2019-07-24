function prepend(element, list) {
  return {
    value: element,
    rest: list
  };
}

function arrayToList(array) {
  for (let element of array.reverse()) {
    if (list) {
      list = prepend(element, list)
    } else {
      var list = prepend(element, null);
    }
  }
  return list;
}

function listToArray(list) {
  let array = [list.value];
  if (list.rest) {
    return array.concat(listToArray(list.rest));
  }
  return array;
}

function nth(list, n) {
  if (n < 0) {
    return undefined;
  }
  if (n == 0) {
    return list.value;
  }
  return nth(list.rest, n - 1);
}
