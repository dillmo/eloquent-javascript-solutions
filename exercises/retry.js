class MultiplicatorUnitFailure extends Error {}

function primitiveMultiply(a, b) {
  if (Math.floor(Math.random() * 5) > 3) return a * b;
  throw new MultiplicatorUnitFailure();
}

function retryPrimitiveMultiply(a, b) {
  for (;;) {
    try {
      return primitiveMultiply(a, b);
    } catch (e) {
      if (!(e instanceof MultiplicatorUnitFailure)) throw e;
    }
  }
}
