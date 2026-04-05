import { vec4 as glVec4 } from "gl-matrix";
import type { mat4, quat, vec4 as GLVec4 } from "gl-matrix";

class Vector4 {
    #vec4: GLVec4;

    constructor();
    constructor(x: number, y?: number, z?: number, w?: number);
    constructor([x, y, z, w]: [number?, number?, number?, number?]);
    constructor({ x, y, z, w }: { x?: number, y?: number, z?: number, w?: number });
    constructor(other: Vector4);
    constructor($1?: Vector4.OVERLOAD, $2?: number, $3?: number, $4?: number) {
        const { x, y, z, w } = Vector4.resolve($1, $2, $3, $4);
        this.#vec4 = glVec4.fromValues(x, y, z, w);
    }

    static create() {
        return new Vector4();
    }

    static clone(vector: Vector4) {
        return Vector4.fromRaw(glVec4.clone(vector.raw()));
    }

    static fromValues(x: number, y: number, z: number, w: number) {
        return new Vector4(x, y, z, w);
    }

    static copy(out: Vector4, vector: Vector4) {
        glVec4.copy(out.raw(), vector.raw());
        return out;
    }

    static set(out: Vector4, x: number, y: number, z: number, w: number) {
        glVec4.set(out.raw(), x, y, z, w);
        return out;
    }

    static add(out: Vector4, left: Vector4, right: Vector4) {
        glVec4.add(out.raw(), left.raw(), right.raw());
        return out;
    }

    static subtract(out: Vector4, left: Vector4, right: Vector4) {
        glVec4.subtract(out.raw(), left.raw(), right.raw());
        return out;
    }

    static sub(out: Vector4, left: Vector4, right: Vector4) {
        return Vector4.subtract(out, left, right);
    }

    static multiply(out: Vector4, left: Vector4, right: Vector4) {
        glVec4.multiply(out.raw(), left.raw(), right.raw());
        return out;
    }

    static mul(out: Vector4, left: Vector4, right: Vector4) {
        return Vector4.multiply(out, left, right);
    }

    static divide(out: Vector4, left: Vector4, right: Vector4) {
        glVec4.divide(out.raw(), left.raw(), right.raw());
        return out;
    }

    static div(out: Vector4, left: Vector4, right: Vector4) {
        return Vector4.divide(out, left, right);
    }

    static ceil(out: Vector4, vector: Vector4) {
        glVec4.ceil(out.raw(), vector.raw());
        return out;
    }

    static floor(out: Vector4, vector: Vector4) {
        glVec4.floor(out.raw(), vector.raw());
        return out;
    }

    static min(out: Vector4, left: Vector4, right: Vector4) {
        glVec4.min(out.raw(), left.raw(), right.raw());
        return out;
    }

    static max(out: Vector4, left: Vector4, right: Vector4) {
        glVec4.max(out.raw(), left.raw(), right.raw());
        return out;
    }

    static round(out: Vector4, vector: Vector4) {
        glVec4.round(out.raw(), vector.raw());
        return out;
    }

    static scale(out: Vector4, vector: Vector4, amount: number) {
        glVec4.scale(out.raw(), vector.raw(), amount);
        return out;
    }

    static scaleAndAdd(out: Vector4, left: Vector4, right: Vector4, amount: number) {
        glVec4.scaleAndAdd(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static distance(left: Vector4, right: Vector4) {
        return glVec4.distance(left.raw(), right.raw());
    }

    static dist(left: Vector4, right: Vector4) {
        return Vector4.distance(left, right);
    }

    static squaredDistance(left: Vector4, right: Vector4) {
        return glVec4.squaredDistance(left.raw(), right.raw());
    }

    static sqrDist(left: Vector4, right: Vector4) {
        return Vector4.squaredDistance(left, right);
    }

    static length(vector: Vector4) {
        return glVec4.length(vector.raw());
    }

    static len(vector: Vector4) {
        return Vector4.length(vector);
    }

    static squaredLength(vector: Vector4) {
        return glVec4.squaredLength(vector.raw());
    }

    static sqrLen(vector: Vector4) {
        return Vector4.squaredLength(vector);
    }

    static negate(out: Vector4, vector: Vector4) {
        glVec4.negate(out.raw(), vector.raw());
        return out;
    }

    static inverse(out: Vector4, vector: Vector4) {
        glVec4.inverse(out.raw(), vector.raw());
        return out;
    }

    static normalize(out: Vector4, vector: Vector4) {
        glVec4.normalize(out.raw(), vector.raw());
        return out;
    }

    static dot(left: Vector4, right: Vector4) {
        return glVec4.dot(left.raw(), right.raw());
    }

    static cross(out: Vector4, u: Vector4, v: Vector4, w: Vector4) {
        glVec4.cross(out.raw(), u.raw(), v.raw(), w.raw());
        return out;
    }

    static lerp(out: Vector4, left: Vector4, right: Vector4, amount: number) {
        glVec4.lerp(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static random(scale?: number) {
        return Vector4.fromRaw(glVec4.random(glVec4.create(), scale));
    }

    static transformMat4(out: Vector4, vector: Vector4, matrix: mat4) {
        glVec4.transformMat4(out.raw(), vector.raw(), matrix);
        return out;
    }

    static transformQuat(out: Vector4, vector: Vector4, rotation: quat) {
        glVec4.transformQuat(out.raw(), vector.raw(), rotation);
        return out;
    }

    static zero(out: Vector4) {
        glVec4.zero(out.raw());
        return out;
    }

    static str(vector: Vector4) {
        return glVec4.str(vector.raw());
    }

    static exactEquals(left: Vector4, right: Vector4) {
        return glVec4.exactEquals(left.raw(), right.raw());
    }

    static equals(left: Vector4, right: Vector4) {
        return glVec4.equals(left.raw(), right.raw());
    }

    static fromRaw(vector: GLVec4) {
        return new Vector4(vector[0], vector[1], vector[2], vector[3]);
    }

    static resolve($1?: Vector4.OVERLOAD, $2?: number, $3?: number, $4?: number): Vector4.LOOKUP_OBJECT {
        if ($1 instanceof Vector4) {
            return { x: $1.raw()[0], y: $1.raw()[1], z: $1.raw()[2], w: $1.raw()[3] };
        }

        if (Array.isArray($1)) {
            return { x: $1[0] ?? 0, y: $1[1] ?? 0, z: $1[2] ?? 0, w: $1[3] ?? 0 };
        }

        if (typeof $1 === "object" && $1 !== null) {
            return { x: $1.x ?? 0, y: $1.y ?? 0, z: $1.z ?? 0, w: $1.w ?? 0 };
        }

        if (typeof $1 === "number") {
            return { x: $1, y: $2 ?? 0, z: $3 ?? 0, w: $4 ?? 0 };
        }

        return { x: 0, y: 0, z: 0, w: 0 };
    }

    get x() {
        return this.#vec4[0];
    }

    set x(value: number) {
        this.#vec4[0] = value;
    }

    get y() {
        return this.#vec4[1];
    }

    set y(value: number) {
        this.#vec4[1] = value;
    }

    get z() {
        return this.#vec4[2];
    }

    set z(value: number) {
        this.#vec4[2] = value;
    }

    get w() {
        return this.#vec4[3];
    }

    set w(value: number) {
        this.#vec4[3] = value;
    }

    raw() {
        return this.#vec4;
    }

    clone() {
        return Vector4.clone(this);
    }

    set(x: number, y: number, z: number, w: number) {
        return Vector4.set(this, x, y, z, w);
    }

    copy(other: Vector4) {
        return Vector4.copy(this, other);
    }

    array(): [number, number, number, number] {
        return [this.#vec4[0], this.#vec4[1], this.#vec4[2], this.#vec4[3]];
    }

    toArray() {
        return this.array();
    }

    add(other: Vector4) {
        return Vector4.add(this, this, other);
    }

    subtract(other: Vector4) {
        return Vector4.subtract(this, this, other);
    }

    sub(other: Vector4) {
        return this.subtract(other);
    }

    multiply(other: Vector4) {
        return Vector4.multiply(this, this, other);
    }

    mul(other: Vector4) {
        return this.multiply(other);
    }

    divide(other: Vector4) {
        return Vector4.divide(this, this, other);
    }

    div(other: Vector4) {
        return this.divide(other);
    }

    ceil() {
        return Vector4.ceil(this, this);
    }

    floor() {
        return Vector4.floor(this, this);
    }

    min(other: Vector4) {
        return Vector4.min(this, this, other);
    }

    max(other: Vector4) {
        return Vector4.max(this, this, other);
    }

    round() {
        return Vector4.round(this, this);
    }

    scale(amount: number) {
        return Vector4.scale(this, this, amount);
    }

    scaleAndAdd(other: Vector4, amount: number) {
        return Vector4.scaleAndAdd(this, this, other, amount);
    }

    distance(other: Vector4) {
        return Vector4.distance(this, other);
    }

    dist(other: Vector4) {
        return this.distance(other);
    }

    squaredDistance(other: Vector4) {
        return Vector4.squaredDistance(this, other);
    }

    sqrDist(other: Vector4) {
        return this.squaredDistance(other);
    }

    length() {
        return Vector4.length(this);
    }

    len() {
        return this.length();
    }

    squaredLength() {
        return Vector4.squaredLength(this);
    }

    sqrLen() {
        return this.squaredLength();
    }

    negate() {
        return Vector4.negate(this, this);
    }

    inverse() {
        return Vector4.inverse(this, this);
    }

    normalize() {
        return Vector4.normalize(this, this);
    }

    dot(other: Vector4) {
        return Vector4.dot(this, other);
    }

    cross(v: Vector4, w: Vector4) {
        return Vector4.cross(this, this, v, w);
    }

    lerp(other: Vector4, amount: number) {
        return Vector4.lerp(this, this, other, amount);
    }

    random(scale?: number) {
        const randomVector = Vector4.random(scale);
        return this.copy(randomVector);
    }

    transformMat4(matrix: mat4) {
        return Vector4.transformMat4(this, this, matrix);
    }

    transformQuat(rotation: quat) {
        return Vector4.transformQuat(this, this, rotation);
    }

    zero() {
        return Vector4.zero(this);
    }

    str() {
        return Vector4.str(this);
    }

    exactEquals(other: Vector4) {
        return Vector4.exactEquals(this, other);
    }

    equals(other: Vector4) {
        return Vector4.equals(this, other);
    }

    toString() {
        return this.str();
    }

    toJSON() {
        return { x: this.#vec4[0], y: this.#vec4[1], z: this.#vec4[2], w: this.#vec4[3] };
    }
}

namespace Vector4 {
    export type X = number;
    export type Y = number;
    export type Z = number;
    export type W = number;
    export type ARR_OVERLOAD = [number?, number?, number?, number?];
    export type OBJ_OVERLOAD = { x?: number, y?: number, z?: number, w?: number };
    export type LOOKUP_OBJECT = { x: number, y: number, z: number, w: number };
    export type OVERLOAD = ARR_OVERLOAD | OBJ_OVERLOAD | Vector4 | number;
}

export default Vector4;
