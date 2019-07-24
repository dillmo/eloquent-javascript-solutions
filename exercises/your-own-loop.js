function loop(val, test, update, body) {
  while (test(val)) {
    body(val);
    val = update(val);
  }
}
