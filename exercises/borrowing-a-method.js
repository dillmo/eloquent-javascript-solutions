let obj = {hasOwnProperty: "hello there"};
console.log(obj.hasOwnProperty);
console.log(Object.prototype.hasOwnProperty.call(obj, "hasOwnProperty"));
