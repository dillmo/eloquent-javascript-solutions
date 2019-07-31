function isJSNumber(str) {
  return /[+-]?(\d+\.?\d*|\d*\.?\d+)([eE]+[+-]?\d+)?/.test(str);
}
