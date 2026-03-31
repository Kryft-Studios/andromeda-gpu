import { mat2 as glMat2 } from "gl-matrix";
import type { mat2 as GLMat2 } from "gl-matrix";
import Vector2 from "../../vector/vec2/index.js";

class Matrix2 {
    #mat2: GLMat2;

    constructor();
    constructor(values: [number?, number?, number?, number?]);
    constructor(other: Matrix2);
    constructor(m00: number, m01?: number, m10?: number, m11?: number);
    constructor($1?: Matrix2.OVERLOAD, $2?: number, $3?: number, $4?: number) {
        const values = Matrix2.resolve($1, $2, $3, $4);
        this.#mat2 = glMat2.fromValues(...values);
    }

    static create() { return new Matrix2(); }
    static clone(matrix: Matrix2) { return Matrix2.fromRaw(glMat2.clone(matrix.raw())); }
    static copy(out: Matrix2, matrix: Matrix2) { glMat2.copy(out.raw(), matrix.raw()); return out; }
    static identity(out: Matrix2) { glMat2.identity(out.raw()); return out; }
    static fromValues(m00: number, m01: number, m10: number, m11: number) { return new Matrix2(m00, m01, m10, m11); }
    static set(out: Matrix2, m00: number, m01: number, m10: number, m11: number) { glMat2.set(out.raw(), m00, m01, m10, m11); return out; }
    static transpose(out: Matrix2, matrix: Matrix2) { glMat2.transpose(out.raw(), matrix.raw()); return out; }
    static invert(out: Matrix2, matrix: Matrix2) { glMat2.invert(out.raw(), matrix.raw()); return out; }
    static adjoint(out: Matrix2, matrix: Matrix2) { glMat2.adjoint(out.raw(), matrix.raw()); return out; }
    static determinant(matrix: Matrix2) { return glMat2.determinant(matrix.raw()); }
    static multiply(out: Matrix2, left: Matrix2, right: Matrix2) { glMat2.multiply(out.raw(), left.raw(), right.raw()); return out; }
    static mul(out: Matrix2, left: Matrix2, right: Matrix2) { return Matrix2.multiply(out, left, right); }
    static rotate(out: Matrix2, matrix: Matrix2, radians: number) { glMat2.rotate(out.raw(), matrix.raw(), radians); return out; }
    static scale(out: Matrix2, matrix: Matrix2, vector: Vector2) { glMat2.scale(out.raw(), matrix.raw(), vector.raw()); return out; }
    static fromRotation(out: Matrix2, radians: number) { glMat2.fromRotation(out.raw(), radians); return out; }
    static fromScaling(out: Matrix2, vector: Vector2) { glMat2.fromScaling(out.raw(), vector.raw()); return out; }
    static str(matrix: Matrix2) { return glMat2.str(matrix.raw()); }
    static frob(matrix: Matrix2) { return glMat2.frob(matrix.raw()); }
    static LDU(L: Matrix2, D: Matrix2, U: Matrix2, matrix: Matrix2) { glMat2.LDU(L.raw(), D.raw(), U.raw(), matrix.raw()); return { L, D, U }; }
    static add(out: Matrix2, left: Matrix2, right: Matrix2) { glMat2.add(out.raw(), left.raw(), right.raw()); return out; }
    static subtract(out: Matrix2, left: Matrix2, right: Matrix2) { glMat2.subtract(out.raw(), left.raw(), right.raw()); return out; }
    static sub(out: Matrix2, left: Matrix2, right: Matrix2) { return Matrix2.subtract(out, left, right); }
    static exactEquals(left: Matrix2, right: Matrix2) { return glMat2.exactEquals(left.raw(), right.raw()); }
    static equals(left: Matrix2, right: Matrix2) { return glMat2.equals(left.raw(), right.raw()); }
    static multiplyScalar(out: Matrix2, matrix: Matrix2, scalar: number) { glMat2.multiplyScalar(out.raw(), matrix.raw(), scalar); return out; }
    static multiplyScalarAndAdd(out: Matrix2, left: Matrix2, right: Matrix2, scale: number) { glMat2.multiplyScalarAndAdd(out.raw(), left.raw(), right.raw(), scale); return out; }
    static fromRaw(matrix: GLMat2) { return new Matrix2(matrix[0], matrix[1], matrix[2], matrix[3]); }
    static resolve($1?: Matrix2.OVERLOAD, $2?: number, $3?: number, $4?: number): Matrix2.LOOKUP {
        if ($1 instanceof Matrix2) return $1.array();
        if (Array.isArray($1)) return [$1[0] ?? 1, $1[1] ?? 0, $1[2] ?? 0, $1[3] ?? 1];
        if (typeof $1 === "number") return [$1, $2 ?? 0, $3 ?? 0, $4 ?? 1];
        return [1, 0, 0, 1];
    }

    raw() { return this.#mat2; }
    clone() { return Matrix2.clone(this); }
    copy(other: Matrix2) { return Matrix2.copy(this, other); }
    identity() { return Matrix2.identity(this); }
    set(m00: number, m01: number, m10: number, m11: number) { return Matrix2.set(this, m00, m01, m10, m11); }
    array(): [number, number, number, number] { return [this.#mat2[0], this.#mat2[1], this.#mat2[2], this.#mat2[3]]; }
    transpose() { return Matrix2.transpose(this, this); }
    invert() { return Matrix2.invert(this, this); }
    adjoint() { return Matrix2.adjoint(this, this); }
    determinant() { return Matrix2.determinant(this); }
    multiply(other: Matrix2) { return Matrix2.multiply(this, this, other); }
    mul(other: Matrix2) { return this.multiply(other); }
    rotate(radians: number) { return Matrix2.rotate(this, this, radians); }
    scale(vector: Vector2) { return Matrix2.scale(this, this, vector); }
    fromRotation(radians: number) { return Matrix2.fromRotation(this, radians); }
    fromScaling(vector: Vector2) { return Matrix2.fromScaling(this, vector); }
    str() { return Matrix2.str(this); }
    frob() { return Matrix2.frob(this); }
    add(other: Matrix2) { return Matrix2.add(this, this, other); }
    subtract(other: Matrix2) { return Matrix2.subtract(this, this, other); }
    sub(other: Matrix2) { return this.subtract(other); }
    exactEquals(other: Matrix2) { return Matrix2.exactEquals(this, other); }
    equals(other: Matrix2) { return Matrix2.equals(this, other); }
    multiplyScalar(scalar: number) { return Matrix2.multiplyScalar(this, this, scalar); }
    multiplyScalarAndAdd(other: Matrix2, scale: number) { return Matrix2.multiplyScalarAndAdd(this, this, other, scale); }
    toString() { return this.str(); }
    toJSON() { return this.array(); }
}

namespace Matrix2 {
    export type LOOKUP = [number, number, number, number];
    export type ARR_OVERLOAD = [number?, number?, number?, number?];
    export type OVERLOAD = ARR_OVERLOAD | Matrix2 | number;
}

export default Matrix2;
