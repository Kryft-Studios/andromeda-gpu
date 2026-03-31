import { vec2 as glVec2 } from "gl-matrix";
import type { mat2, mat2d, mat3, mat4, vec2 as GLVec2, vec3 } from "gl-matrix";

class Vector2 {
    #vec2: GLVec2;

    constructor();
    constructor(x: number, y?: number);
    constructor([x, y]: [number?, number?]);
    constructor({ x, y }: { x?: number, y?: number });
    constructor(other: Vector2);
    constructor($1?: Vector2.OVERLOAD, $2?: number) {
        const { x, y } = Vector2.resolve($1, $2);
        this.#vec2 = glVec2.fromValues(x, y);
    }

    static create() {
        return new Vector2();
    }

    static clone(vector: Vector2) {
        return Vector2.fromRaw(glVec2.clone(vector.raw()));
    }

    static fromValues(x: number, y: number) {
        return new Vector2(x, y);
    }

    static copy(out: Vector2, vector: Vector2) {
        glVec2.copy(out.raw(), vector.raw());
        return out;
    }

    static set(out: Vector2, x: number, y: number) {
        glVec2.set(out.raw(), x, y);
        return out;
    }

    static add(out: Vector2, left: Vector2, right: Vector2) {
        glVec2.add(out.raw(), left.raw(), right.raw());
        return out;
    }

    static subtract(out: Vector2, left: Vector2, right: Vector2) {
        glVec2.subtract(out.raw(), left.raw(), right.raw());
        return out;
    }

    static sub(out: Vector2, left: Vector2, right: Vector2) {
        return Vector2.subtract(out, left, right);
    }

    static multiply(out: Vector2, left: Vector2, right: Vector2) {
        glVec2.multiply(out.raw(), left.raw(), right.raw());
        return out;
    }

    static mul(out: Vector2, left: Vector2, right: Vector2) {
        return Vector2.multiply(out, left, right);
    }

    static divide(out: Vector2, left: Vector2, right: Vector2) {
        glVec2.divide(out.raw(), left.raw(), right.raw());
        return out;
    }

    static div(out: Vector2, left: Vector2, right: Vector2) {
        return Vector2.divide(out, left, right);
    }

    static ceil(out: Vector2, vector: Vector2) {
        glVec2.ceil(out.raw(), vector.raw());
        return out;
    }

    static floor(out: Vector2, vector: Vector2) {
        glVec2.floor(out.raw(), vector.raw());
        return out;
    }

    static min(out: Vector2, left: Vector2, right: Vector2) {
        glVec2.min(out.raw(), left.raw(), right.raw());
        return out;
    }

    static max(out: Vector2, left: Vector2, right: Vector2) {
        glVec2.max(out.raw(), left.raw(), right.raw());
        return out;
    }

    static round(out: Vector2, vector: Vector2) {
        glVec2.round(out.raw(), vector.raw());
        return out;
    }

    static scale(out: Vector2, vector: Vector2, amount: number) {
        glVec2.scale(out.raw(), vector.raw(), amount);
        return out;
    }

    static scaleAndAdd(out: Vector2, left: Vector2, right: Vector2, amount: number) {
        glVec2.scaleAndAdd(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static distance(left: Vector2, right: Vector2) {
        return glVec2.distance(left.raw(), right.raw());
    }

    static dist(left: Vector2, right: Vector2) {
        return Vector2.distance(left, right);
    }

    static squaredDistance(left: Vector2, right: Vector2) {
        return glVec2.squaredDistance(left.raw(), right.raw());
    }

    static sqrDist(left: Vector2, right: Vector2) {
        return Vector2.squaredDistance(left, right);
    }

    static length(vector: Vector2) {
        return glVec2.length(vector.raw());
    }

    static len(vector: Vector2) {
        return Vector2.length(vector);
    }

    static squaredLength(vector: Vector2) {
        return glVec2.squaredLength(vector.raw());
    }

    static sqrLen(vector: Vector2) {
        return Vector2.squaredLength(vector);
    }

    static negate(out: Vector2, vector: Vector2) {
        glVec2.negate(out.raw(), vector.raw());
        return out;
    }

    static inverse(out: Vector2, vector: Vector2) {
        glVec2.inverse(out.raw(), vector.raw());
        return out;
    }

    static normalize(out: Vector2, vector: Vector2) {
        glVec2.normalize(out.raw(), vector.raw());
        return out;
    }

    static dot(left: Vector2, right: Vector2) {
        return glVec2.dot(left.raw(), right.raw());
    }

    static cross(left: Vector2, right: Vector2) {
        const out = [0, 0, 0] as vec3;
        return glVec2.cross(out, left.raw(), right.raw());
    }

    static lerp(out: Vector2, left: Vector2, right: Vector2, amount: number) {
        glVec2.lerp(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static random(scale?: number) {
        return Vector2.fromRaw(glVec2.random(glVec2.create(), scale));
    }

    static transformMat2(out: Vector2, vector: Vector2, matrix: mat2) {
        glVec2.transformMat2(out.raw(), vector.raw(), matrix);
        return out;
    }

    static transformMat2d(out: Vector2, vector: Vector2, matrix: mat2d) {
        glVec2.transformMat2d(out.raw(), vector.raw(), matrix);
        return out;
    }

    static transformMat3(out: Vector2, vector: Vector2, matrix: mat3) {
        glVec2.transformMat3(out.raw(), vector.raw(), matrix);
        return out;
    }

    static transformMat4(out: Vector2, vector: Vector2, matrix: mat4) {
        glVec2.transformMat4(out.raw(), vector.raw(), matrix);
        return out;
    }

    static rotate(out: Vector2, vector: Vector2, origin: Vector2, radians: number) {
        glVec2.rotate(out.raw(), vector.raw(), origin.raw(), radians);
        return out;
    }

    static angle(left: Vector2, right: Vector2) {
        return glVec2.angle(left.raw(), right.raw());
    }

    static zero(out: Vector2) {
        glVec2.zero(out.raw());
        return out;
    }

    static str(vector: Vector2) {
        return glVec2.str(vector.raw());
    }

    static exactEquals(left: Vector2, right: Vector2) {
        return glVec2.exactEquals(left.raw(), right.raw());
    }

    static equals(left: Vector2, right: Vector2) {
        return glVec2.equals(left.raw(), right.raw());
    }

    static fromRaw(vector: GLVec2) {
        return new Vector2(vector[0], vector[1]);
    }

    static resolve($1?: Vector2.OVERLOAD, $2?: number): Vector2.LOOKUP_OBJECT {
        if ($1 instanceof Vector2) {
            return { x: $1.raw()[0], y: $1.raw()[1] };
        }

        if (Array.isArray($1)) {
            return { x: $1[0] ?? 0, y: $1[1] ?? 0 };
        }

        if (typeof $1 === "object" && $1 !== null) {
            return { x: $1.x ?? 0, y: $1.y ?? 0 };
        }

        if (typeof $1 === "number") {
            return { x: $1, y: $2 ?? 0 };
        }

        return { x: 0, y: 0 };
    }

    x(): number;
    x(num: number): this;
    x(num?: number): this | number {
        if (typeof num === "undefined") return this.#vec2[0];
        this.#vec2[0] = num;
        return this;
    }

    y(): number;
    y(num: number): this;
    y(num?: number): this | number {
        if (typeof num === "undefined") return this.#vec2[1];
        this.#vec2[1] = num;
        return this;
    }

    raw() {
        return this.#vec2;
    }

    clone() {
        return Vector2.clone(this);
    }

    set(x: number, y: number) {
        return Vector2.set(this, x, y);
    }

    copy(other: Vector2) {
        return Vector2.copy(this, other);
    }

    array(): [number, number] {
        return [this.#vec2[0], this.#vec2[1]];
    }

    toArray() {
        return this.array();
    }

    add(other: Vector2) {
        return Vector2.add(this, this, other);
    }

    subtract(other: Vector2) {
        return Vector2.subtract(this, this, other);
    }

    sub(other: Vector2) {
        return this.subtract(other);
    }

    multiply(other: Vector2) {
        return Vector2.multiply(this, this, other);
    }

    mul(other: Vector2) {
        return this.multiply(other);
    }

    divide(other: Vector2) {
        return Vector2.divide(this, this, other);
    }

    div(other: Vector2) {
        return this.divide(other);
    }

    ceil() {
        return Vector2.ceil(this, this);
    }

    floor() {
        return Vector2.floor(this, this);
    }

    min(other: Vector2) {
        return Vector2.min(this, this, other);
    }

    max(other: Vector2) {
        return Vector2.max(this, this, other);
    }

    round() {
        return Vector2.round(this, this);
    }

    scale(amount: number) {
        return Vector2.scale(this, this, amount);
    }

    scaleAndAdd(other: Vector2, amount: number) {
        return Vector2.scaleAndAdd(this, this, other, amount);
    }

    distance(other: Vector2) {
        return Vector2.distance(this, other);
    }

    dist(other: Vector2) {
        return this.distance(other);
    }

    squaredDistance(other: Vector2) {
        return Vector2.squaredDistance(this, other);
    }

    sqrDist(other: Vector2) {
        return this.squaredDistance(other);
    }

    length() {
        return Vector2.length(this);
    }

    len() {
        return this.length();
    }

    squaredLength() {
        return Vector2.squaredLength(this);
    }

    sqrLen() {
        return this.squaredLength();
    }

    negate() {
        return Vector2.negate(this, this);
    }

    inverse() {
        return Vector2.inverse(this, this);
    }

    normalize() {
        return Vector2.normalize(this, this);
    }

    dot(other: Vector2) {
        return Vector2.dot(this, other);
    }

    cross(other: Vector2) {
        return Vector2.cross(this, other);
    }

    lerp(other: Vector2, amount: number) {
        return Vector2.lerp(this, this, other, amount);
    }

    random(scale?: number) {
        const randomVector = Vector2.random(scale);
        return this.copy(randomVector);
    }

    transformMat2(matrix: mat2) {
        return Vector2.transformMat2(this, this, matrix);
    }

    transformMat2d(matrix: mat2d) {
        return Vector2.transformMat2d(this, this, matrix);
    }

    transformMat3(matrix: mat3) {
        return Vector2.transformMat3(this, this, matrix);
    }

    transformMat4(matrix: mat4) {
        return Vector2.transformMat4(this, this, matrix);
    }

    rotate(origin: Vector2, radians: number) {
        return Vector2.rotate(this, this, origin, radians);
    }

    angle(other: Vector2) {
        return Vector2.angle(this, other);
    }

    zero() {
        return Vector2.zero(this);
    }

    str() {
        return Vector2.str(this);
    }

    exactEquals(other: Vector2) {
        return Vector2.exactEquals(this, other);
    }

    equals(other: Vector2) {
        return Vector2.equals(this, other);
    }

    toString() {
        return this.str();
    }

    toJSON() {
        return { x: this.#vec2[0], y: this.#vec2[1] };
    }
}

namespace Vector2 {
    export type X = number;
    export type Y = number;
    export type ARR_OVERLOAD = [number?, number?];
    export type OBJ_OVERLOAD = { x?: number, y?: number };
    export type LOOKUP_OBJECT = { x: number, y: number };
    export type OVERLOAD = ARR_OVERLOAD | OBJ_OVERLOAD | Vector2 | number;
}

export default Vector2;
