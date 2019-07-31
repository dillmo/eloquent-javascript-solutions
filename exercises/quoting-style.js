function singleQuotesToDouble(str) {
  return str.replace(/(^|\W)'|'($|\W)/g, "$1\"$2");
}
