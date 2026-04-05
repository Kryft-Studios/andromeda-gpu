import { mat3 as glMat3 } from "gl-matrix";
import type { mat2d, mat3 as GLMat3, mat4, quat } from "gl-matrix";
import Vector2 from "../../vector/vec2/index.js";

class Matrix3 {
    #mat3: GLMat3;

    constructor();
    constructor(values: [number?, number?, number?, number?, number?, number?, number?, number?, number?]);
    constructor(other: Matrix3);
    constructor(m00: number, m01?: number, m02?: number, m10?: number, m11?: number, m12?: number, m20?: number, m21?: number, m22?: number);
    constructor($1?: Matrix3.OVERLOAD, $2?: number, $3?: number, $4?: number, $5?: number, $6?: number, $7?: number, $8?: number, $9?: number) {
        const values = Matrix3.resolve($1, $2, $3, $4, $5, $6, $7, $8, $9);
        this.#mat3 = glMat3.fromValues(...values);
    }

    static create() { return new Matrix3(); }
    static fromMat4(out: Matrix3, matrix: mat4) { glMat3.fromMat4(out.raw(), matrix); return out; }
    static clone(matrix: Matrix3) { return Matrix3.fromRaw(glMat3.clone(matrix.raw())); }
    static copy(out: Matrix3, matrix: Matrix3) { glMat3.copy(out.raw(), matrix.raw()); return out; }
    static fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) { return new Matrix3(m00, m01, m02, m10, m11, m12, m20, m21, m22); }
    static set(out: Matrix3, m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) { glMat3.set(out.raw(), m00, m01, m02, m10, m11, m12, m20, m21, m22); return out; }
    static identity(out: Matrix3) { glMat3.identity(out.raw()); return out; }
    static transpose(out: Matrix3, matrix: Matrix3) { glMat3.transpose(out.raw(), matrix.raw()); return out; }
    static invert(out: Matrix3, matrix: Matrix3) { glMat3.invert(out.raw(), matrix.raw()); return out; }
    static adjoint(out: Matrix3, matrix: Matrix3) { glMat3.adjoint(out.raw(), matrix.raw()); return out; }
    static determinant(matrix: Matrix3) { return glMat3.determinant(matrix.raw()); }
    static multiply(out: Matrix3, left: Matrix3, right: Matrix3) { glMat3.multiply(out.raw(), left.raw(), right.raw()); return out; }
    static mul(out: Matrix3, left: Matrix3, right: Matrix3) { return Matrix3.multiply(out, left, right); }
    static translate(out: Matrix3, matrix: Matrix3, vector: Vector2) { glMat3.translate(out.raw(), matrix.raw(), vector.raw()); return out; }
    static rotate(out: Matrix3, matrix: Matrix3, radians: number) { glMat3.rotate(out.raw(), matrix.raw(), radians); return out; }
    static scale(out: Matrix3, matrix: Matrix3, vector: Vector2) { glMat3.scale(out.raw(), matrix.raw(), vector.raw()); return out; }
    static fromTranslation(out: Matrix3, vector: Vector2) { glMat3.fromTranslation(out.raw(), vector.raw()); return out; }
    static fromRotation(out: Matrix3, radians: number) { glMat3.fromRotation(out.raw(), radians); return out; }
    static fromScaling(out: Matrix3, vector: Vector2) { glMat3.fromScaling(out.raw(), vector.raw()); return out; }
    static fromMat2d(out: Matrix3, matrix: mat2d) { glMat3.fromMat2d(out.raw(), matrix); return out; }
    static fromQuat(out: Matrix3, rotation: quat) { glMat3.fromQuat(out.raw(), rotation); return out; }
    static normalFromMat4(out: Matrix3, matrix: mat4) { glMat3.normalFromMat4(out.raw(), matrix); return out; }
    static projection(out: Matrix3, width: number, height: number) { glMat3.projection(out.raw(), width, height); return out; }
    static str(matrix: Matrix3) { return glMat3.str(matrix.raw()); }
    static frob(matrix: Matrix3) { return glMat3.frob(matrix.raw()); }
    static add(out: Matrix3, left: Matrix3, right: Matrix3) { glMat3.add(out.raw(), left.raw(), right.raw()); return out; }
    static subtract(out: Matrix3, left: Matrix3, right: Matrix3) { glMat3.subtract(out.raw(), left.raw(), right.raw()); return out; }
    static sub(out: Matrix3, left: Matrix3, right: Matrix3) { return Matrix3.subtract(out, left, right); }
    static multiplyScalar(out: Matrix3, matrix: Matrix3, scalar: number) { glMat3.multiplyScalar(out.raw(), matrix.raw(), scalar); return out; }
    static multiplyScalarAndAdd(out: Matrix3, left: Matrix3, right: Matrix3, scale: number) { glMat3.multiplyScalarAndAdd(out.raw(), left.raw(), right.raw(), scale); return out; }
    static exactEquals(left: Matrix3, right: Matrix3) { return glMat3.exactEquals(left.raw(), right.raw()); }
    static equals(left: Matrix3, right: Matrix3) { return glMat3.equals(left.raw(), right.raw()); }
    static fromRaw(matrix: GLMat3) { return new Matrix3(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6], matrix[7], matrix[8]); }
    static resolve($1?: Matrix3.OVERLOAD, $2?: number, $3?: number, $4?: number, $5?: number, $6?: number, $7?: number, $8?: number, $9?: number): Matrix3.LOOKUP {
        if ($1 instanceof Matrix3) return $1.array();
        if (Array.isArray($1)) return [$1[0] ?? 1, $1[1] ?? 0, $1[2] ?? 0, $1[3] ?? 0, $1[4] ?? 1, $1[5] ?? 0, $1[6] ?? 0, $1[7] ?? 0, $1[8] ?? 1];
        if (typeof $1 === "number") return [$1, $2 ?? 0, $3 ?? 0, $4 ?? 0, $5 ?? 1, $6 ?? 0, $7 ?? 0, $8 ?? 0, $9 ?? 1];
        return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }

    get x() { return this.#mat3[0]; }
    set x(value: number) { this.#mat3[0] = value; }
    get y() { return this.#mat3[1]; }
    set y(value: number) { this.#mat3[1] = value; }
    get z() { return this.#mat3[2]; }
    set z(value: number) { this.#mat3[2] = value; }
    get w() { return this.#mat3[3]; }
    set w(value: number) { this.#mat3[3] = value; }

    raw() { return this.#mat3; }
    clone() { return Matrix3.clone(this); }
    copy(other: Matrix3) { return Matrix3.copy(this, other); }
    set(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number) { return Matrix3.set(this, m00, m01, m02, m10, m11, m12, m20, m21, m22); }
    identity() { return Matrix3.identity(this); }
    array(): [number, number, number, number, number, number, number, number, number] { return [this.#mat3[0], this.#mat3[1], this.#mat3[2], this.#mat3[3], this.#mat3[4], this.#mat3[5], this.#mat3[6], this.#mat3[7], this.#mat3[8]]; }
    fromMat4(matrix: mat4) { return Matrix3.fromMat4(this, matrix); }
    transpose() { return Matrix3.transpose(this, this); }
    invert() { return Matrix3.invert(this, this); }
    adjoint() { return Matrix3.adjoint(this, this); }
    determinant() { return Matrix3.determinant(this); }
    multiply(other: Matrix3) { return Matrix3.multiply(this, this, other); }
    mul(other: Matrix3) { return this.multiply(other); }
    translate(vector: Vector2) { return Matrix3.translate(this, this, vector); }
    rotate(radians: number) { return Matrix3.rotate(this, this, radians); }
    scale(vector: Vector2) { return Matrix3.scale(this, this, vector); }
    fromTranslation(vector: Vector2) { return Matrix3.fromTranslation(this, vector); }
    fromRotation(radians: number) { return Matrix3.fromRotation(this, radians); }
    fromScaling(vector: Vector2) { return Matrix3.fromScaling(this, vector); }
    fromMat2d(matrix: mat2d) { return Matrix3.fromMat2d(this, matrix); }
    fromQuat(rotation: quat) { return Matrix3.fromQuat(this, rotation); }
    normalFromMat4(matrix: mat4) { return Matrix3.normalFromMat4(this, matrix); }
    projection(width: number, height: number) { return Matrix3.projection(this, width, height); }
    str() { return Matrix3.str(this); }
    frob() { return Matrix3.frob(this); }
    add(other: Matrix3) { return Matrix3.add(this, this, other); }
    subtract(other: Matrix3) { return Matrix3.subtract(this, this, other); }
    sub(other: Matrix3) { return this.subtract(other); }
    multiplyScalar(scalar: number) { return Matrix3.multiplyScalar(this, this, scalar); }
    multiplyScalarAndAdd(other: Matrix3, scale: number) { return Matrix3.multiplyScalarAndAdd(this, this, other, scale); }
    exactEquals(other: Matrix3) { return Matrix3.exactEquals(this, other); }
    equals(other: Matrix3) { return Matrix3.equals(this, other); }
    toString() { return this.str(); }
    toJSON() { return this.array(); }
}

namespace Matrix3 {
    export type LOOKUP = [number, number, number, number, number, number, number, number, number];
    export type ARR_OVERLOAD = [number?, number?, number?, number?, number?, number?, number?, number?, number?];
    export type OVERLOAD = ARR_OVERLOAD | Matrix3 | number;
}

export default Matrix3;
