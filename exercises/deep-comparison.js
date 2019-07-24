function deepEqual(val1, val2,) {
  if (typeof val1 === typeof val2) {
    if (val1 !== null) {
      if (typeof val1 === "object") {
        if (Object.keys(val1).length === Object.keys(val2).length) {
          result = true;
          for (key of Object.keys(val1)) {
            if (val1[key] !== undefined && val2[key] !== undefined) {
              result = result && deepEqual(val1[key], val2[key]);
            }
          }
          return result;
        }
      } else if (val1 === val2) {
        return true;
      }
    }
  }
  return false;
}
