export default class Vec {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public plus(other: Vec) {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    public minus(other: Vec) {
        return new Vec(this.x - other.x, this.y - other.y);
    }

    public times(factor: number) {
        return new Vec(this.x * factor, this.y * factor);
    }

    public get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}
