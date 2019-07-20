function isEven(x) {
  if (x < 0) x = -x;
  if (x <= 1) return x == 0;
  else return isEven(x - 2);
}
