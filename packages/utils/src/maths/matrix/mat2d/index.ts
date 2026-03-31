import { mat2d as glMat2d } from "gl-matrix";
import type { mat2d as GLMat2d } from "gl-matrix";
import Vector2 from "../../vector/vec2/index.js";

class Matrix2D {
    #mat2d: GLMat2d;

    constructor();
    constructor(values: [number?, number?, number?, number?, number?, number?]);
    constructor(other: Matrix2D);
    constructor(a: number, b?: number, c?: number, d?: number, tx?: number, ty?: number);
    constructor($1?: Matrix2D.OVERLOAD, $2?: number, $3?: number, $4?: number, $5?: number, $6?: number) {
        const values = Matrix2D.resolve($1, $2, $3, $4, $5, $6);
        this.#mat2d = glMat2d.fromValues(...values);
    }

    static create() { return new Matrix2D(); }
    static clone(matrix: Matrix2D) { return Matrix2D.fromRaw(glMat2d.clone(matrix.raw())); }
    static copy(out: Matrix2D, matrix: Matrix2D) { glMat2d.copy(out.raw(), matrix.raw()); return out; }
    static identity(out: Matrix2D) { glMat2d.identity(out.raw()); return out; }
    static fromValues(a: number, b: number, c: number, d: number, tx: number, ty: number) { return new Matrix2D(a, b, c, d, tx, ty); }
    static set(out: Matrix2D, a: number, b: number, c: number, d: number, tx: number, ty: number) { glMat2d.set(out.raw(), a, b, c, d, tx, ty); return out; }
    static invert(out: Matrix2D, matrix: Matrix2D) { glMat2d.invert(out.raw(), matrix.raw()); return out; }
    static determinant(matrix: Matrix2D) { return glMat2d.determinant(matrix.raw()); }
    static multiply(out: Matrix2D, left: Matrix2D, right: Matrix2D) { glMat2d.multiply(out.raw(), left.raw(), right.raw()); return out; }
    static mul(out: Matrix2D, left: Matrix2D, right: Matrix2D) { return Matrix2D.multiply(out, left, right); }
    static rotate(out: Matrix2D, matrix: Matrix2D, radians: number) { glMat2d.rotate(out.raw(), matrix.raw(), radians); return out; }
    static scale(out: Matrix2D, matrix: Matrix2D, vector: Vector2) { glMat2d.scale(out.raw(), matrix.raw(), vector.raw()); return out; }
    static translate(out: Matrix2D, matrix: Matrix2D, vector: Vector2) { glMat2d.translate(out.raw(), matrix.raw(), vector.raw()); return out; }
    static fromRotation(out: Matrix2D, radians: number) { glMat2d.fromRotation(out.raw(), radians); return out; }
    static fromScaling(out: Matrix2D, vector: Vector2) { glMat2d.fromScaling(out.raw(), vector.raw()); return out; }
    static fromTranslation(out: Matrix2D, vector: Vector2) { glMat2d.fromTranslation(out.raw(), vector.raw()); return out; }
    static str(matrix: Matrix2D) { return glMat2d.str(matrix.raw()); }
    static frob(matrix: Matrix2D) { return glMat2d.frob(matrix.raw()); }
    static add(out: Matrix2D, left: Matrix2D, right: Matrix2D) { glMat2d.add(out.raw(), left.raw(), right.raw()); return out; }
    static subtract(out: Matrix2D, left: Matrix2D, right: Matrix2D) { glMat2d.subtract(out.raw(), left.raw(), right.raw()); return out; }
    static sub(out: Matrix2D, left: Matrix2D, right: Matrix2D) { return Matrix2D.subtract(out, left, right); }
    static multiplyScalar(out: Matrix2D, matrix: Matrix2D, scalar: number) { glMat2d.multiplyScalar(out.raw(), matrix.raw(), scalar); return out; }
    static multiplyScalarAndAdd(out: Matrix2D, left: Matrix2D, right: Matrix2D, scale: number) { glMat2d.multiplyScalarAndAdd(out.raw(), left.raw(), right.raw(), scale); return out; }
    static exactEquals(left: Matrix2D, right: Matrix2D) { return glMat2d.exactEquals(left.raw(), right.raw()); }
    static equals(left: Matrix2D, right: Matrix2D) { return glMat2d.equals(left.raw(), right.raw()); }
    static fromRaw(matrix: GLMat2d) { return new Matrix2D(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]); }
    static resolve($1?: Matrix2D.OVERLOAD, $2?: number, $3?: number, $4?: number, $5?: number, $6?: number): Matrix2D.LOOKUP {
        if ($1 instanceof Matrix2D) return $1.array();
        if (Array.isArray($1)) return [$1[0] ?? 1, $1[1] ?? 0, $1[2] ?? 0, $1[3] ?? 1, $1[4] ?? 0, $1[5] ?? 0];
        if (typeof $1 === "number") return [$1, $2 ?? 0, $3 ?? 0, $4 ?? 1, $5 ?? 0, $6 ?? 0];
        return [1, 0, 0, 1, 0, 0];
    }

    raw() { return this.#mat2d; }
    clone() { return Matrix2D.clone(this); }
    copy(other: Matrix2D) { return Matrix2D.copy(this, other); }
    identity() { return Matrix2D.identity(this); }
    set(a: number, b: number, c: number, d: number, tx: number, ty: number) { return Matrix2D.set(this, a, b, c, d, tx, ty); }
    array(): [number, number, number, number, number, number] { return [this.#mat2d[0], this.#mat2d[1], this.#mat2d[2], this.#mat2d[3], this.#mat2d[4], this.#mat2d[5]]; }
    invert() { return Matrix2D.invert(this, this); }
    determinant() { return Matrix2D.determinant(this); }
    multiply(other: Matrix2D) { return Matrix2D.multiply(this, this, other); }
    mul(other: Matrix2D) { return this.multiply(other); }
    rotate(radians: number) { return Matrix2D.rotate(this, this, radians); }
    scale(vector: Vector2) { return Matrix2D.scale(this, this, vector); }
    translate(vector: Vector2) { return Matrix2D.translate(this, this, vector); }
    fromRotation(radians: number) { return Matrix2D.fromRotation(this, radians); }
    fromScaling(vector: Vector2) { return Matrix2D.fromScaling(this, vector); }
    fromTranslation(vector: Vector2) { return Matrix2D.fromTranslation(this, vector); }
    str() { return Matrix2D.str(this); }
    frob() { return Matrix2D.frob(this); }
    add(other: Matrix2D) { return Matrix2D.add(this, this, other); }
    subtract(other: Matrix2D) { return Matrix2D.subtract(this, this, other); }
    sub(other: Matrix2D) { return this.subtract(other); }
    multiplyScalar(scalar: number) { return Matrix2D.multiplyScalar(this, this, scalar); }
    multiplyScalarAndAdd(other: Matrix2D, scale: number) { return Matrix2D.multiplyScalarAndAdd(this, this, other, scale); }
    exactEquals(other: Matrix2D) { return Matrix2D.exactEquals(this, other); }
    equals(other: Matrix2D) { return Matrix2D.equals(this, other); }
    toString() { return this.str(); }
    toJSON() { return this.array(); }
}

namespace Matrix2D {
    export type LOOKUP = [number, number, number, number, number, number];
    export type ARR_OVERLOAD = [number?, number?, number?, number?, number?, number?];
    export type OVERLOAD = ARR_OVERLOAD | Matrix2D | number;
}

export default Matrix2D;
