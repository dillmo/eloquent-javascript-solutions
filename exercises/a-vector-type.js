class Vec {
  constructor(x = 0, y = 0) {
    this._x = typeof x == "number" ? x : 0;
    this._y = typeof y == "number" ? y : 0;
  }

  get x() {
    return this._x;
  }

  set x(x) {
    if (typeof x == "number") this._x = x;
  }

  get y() {
    return this._y;
  }

  set y(y) {
    if (typeof y == "number") this._y = y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  plus(vector) {
    return new Vec(
      this.x + vector.x,
      this.y + vector.y
    );
  }

  minus(vector) {
    return new Vec(
      this.x - vector.x,
      this.y - vector.y
    );
  }

  toString() {
    return `<${this.x}, ${this.y}>`;
  }
}
