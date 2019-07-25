class Group {
  constructor() {
    this._data = [];
  }

  has(value) {
    return this._data.indexOf(value) != -1;
  }

  add(value) {
    if (!this.has(value)) this._data.push(value);
  }

  delete(value) {
    if (this.has(value)) {
      delete this._data[this._data.indexOf(value)];
    }
  }

  get length() {
    return this._data.length;
  }

  static from(iterable) {
    let group = new Group();
    for (let value of iterable) {
      group.add(value);
    }
    return group;
  }

  [Symbol.iterator]() {
    return new class {
      constructor(group) {
        this.pos = 0;
        this.group = group;
      }

      next() {
        if (this.pos == this.group.length) return {done: true};

        let result = {value: this.group._data[this.pos], done: false};
        this.pos++;
        return result;
      }
    }(this);
  }
}
