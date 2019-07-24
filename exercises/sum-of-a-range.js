function range(start, end, step=1) {
  let array = [];
  if (step > 0 && start < end) {
    for (let i = start; i <= end; i += step) {
      array.push(i);
    }
  } else if (step < 0 && start > end) {
    for (let i = start; i >= end; i += step) {
      array.push(i);
    }
  }
  return array;
}

function sum(array) {
  let result = 0;
  for (num of array) {
    result += num;
  }
  return result;
}
