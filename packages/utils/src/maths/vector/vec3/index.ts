import { vec3 as glVec3 } from "gl-matrix";
import type { mat3, mat4, quat, vec3 as GLVec3 } from "gl-matrix";

class Vector3 {
    #vec3: GLVec3;

    constructor();
    constructor(x: number, y?: number, z?: number);
    constructor([x, y, z]: [number?, number?, number?]);
    constructor({ x, y, z }: { x?: number, y?: number, z?: number });
    constructor(other: Vector3);
    constructor($1?: Vector3.OVERLOAD, $2?: number, $3?: number) {
        const { x, y, z } = Vector3.resolve($1, $2, $3);
        this.#vec3 = glVec3.fromValues(x, y, z);
    }

    static create() {
        return new Vector3();
    }

    static clone(vector: Vector3) {
        return Vector3.fromRaw(glVec3.clone(vector.raw()));
    }

    static fromValues(x: number, y: number, z: number) {
        return new Vector3(x, y, z);
    }

    static copy(out: Vector3, vector: Vector3) {
        glVec3.copy(out.raw(), vector.raw());
        return out;
    }

    static set(out: Vector3, x: number, y: number, z: number) {
        glVec3.set(out.raw(), x, y, z);
        return out;
    }

    static add(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.add(out.raw(), left.raw(), right.raw());
        return out;
    }

    static subtract(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.subtract(out.raw(), left.raw(), right.raw());
        return out;
    }

    static sub(out: Vector3, left: Vector3, right: Vector3) {
        return Vector3.subtract(out, left, right);
    }

    static multiply(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.multiply(out.raw(), left.raw(), right.raw());
        return out;
    }

    static mul(out: Vector3, left: Vector3, right: Vector3) {
        return Vector3.multiply(out, left, right);
    }

    static divide(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.divide(out.raw(), left.raw(), right.raw());
        return out;
    }

    static div(out: Vector3, left: Vector3, right: Vector3) {
        return Vector3.divide(out, left, right);
    }

    static ceil(out: Vector3, vector: Vector3) {
        glVec3.ceil(out.raw(), vector.raw());
        return out;
    }

    static floor(out: Vector3, vector: Vector3) {
        glVec3.floor(out.raw(), vector.raw());
        return out;
    }

    static min(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.min(out.raw(), left.raw(), right.raw());
        return out;
    }

    static max(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.max(out.raw(), left.raw(), right.raw());
        return out;
    }

    static round(out: Vector3, vector: Vector3) {
        glVec3.round(out.raw(), vector.raw());
        return out;
    }

    static scale(out: Vector3, vector: Vector3, amount: number) {
        glVec3.scale(out.raw(), vector.raw(), amount);
        return out;
    }

    static scaleAndAdd(out: Vector3, left: Vector3, right: Vector3, amount: number) {
        glVec3.scaleAndAdd(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static distance(left: Vector3, right: Vector3) {
        return glVec3.distance(left.raw(), right.raw());
    }

    static dist(left: Vector3, right: Vector3) {
        return Vector3.distance(left, right);
    }

    static squaredDistance(left: Vector3, right: Vector3) {
        return glVec3.squaredDistance(left.raw(), right.raw());
    }

    static sqrDist(left: Vector3, right: Vector3) {
        return Vector3.squaredDistance(left, right);
    }

    static length(vector: Vector3) {
        return glVec3.length(vector.raw());
    }

    static len(vector: Vector3) {
        return Vector3.length(vector);
    }

    static squaredLength(vector: Vector3) {
        return glVec3.squaredLength(vector.raw());
    }

    static sqrLen(vector: Vector3) {
        return Vector3.squaredLength(vector);
    }

    static negate(out: Vector3, vector: Vector3) {
        glVec3.negate(out.raw(), vector.raw());
        return out;
    }

    static inverse(out: Vector3, vector: Vector3) {
        glVec3.inverse(out.raw(), vector.raw());
        return out;
    }

    static normalize(out: Vector3, vector: Vector3) {
        glVec3.normalize(out.raw(), vector.raw());
        return out;
    }

    static dot(left: Vector3, right: Vector3) {
        return glVec3.dot(left.raw(), right.raw());
    }

    static cross(out: Vector3, left: Vector3, right: Vector3) {
        glVec3.cross(out.raw(), left.raw(), right.raw());
        return out;
    }

    static lerp(out: Vector3, left: Vector3, right: Vector3, amount: number) {
        glVec3.lerp(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static slerp(out: Vector3, left: Vector3, right: Vector3, amount: number) {
        glVec3.slerp(out.raw(), left.raw(), right.raw(), amount);
        return out;
    }

    static hermite(out: Vector3, a: Vector3, b: Vector3, c: Vector3, d: Vector3, amount: number) {
        glVec3.hermite(out.raw(), a.raw(), b.raw(), c.raw(), d.raw(), amount);
        return out;
    }

    static bezier(out: Vector3, a: Vector3, b: Vector3, c: Vector3, d: Vector3, amount: number) {
        glVec3.bezier(out.raw(), a.raw(), b.raw(), c.raw(), d.raw(), amount);
        return out;
    }

    static random(scale?: number) {
        return Vector3.fromRaw(glVec3.random(glVec3.create(), scale));
    }

    static transformMat4(out: Vector3, vector: Vector3, matrix: mat4) {
        glVec3.transformMat4(out.raw(), vector.raw(), matrix);
        return out;
    }

    static transformMat3(out: Vector3, vector: Vector3, matrix: mat3) {
        glVec3.transformMat3(out.raw(), vector.raw(), matrix);
        return out;
    }

    static transformQuat(out: Vector3, vector: Vector3, rotation: quat) {
        glVec3.transformQuat(out.raw(), vector.raw(), rotation);
        return out;
    }

    static rotateX(out: Vector3, vector: Vector3, origin: Vector3, radians: number) {
        glVec3.rotateX(out.raw(), vector.raw(), origin.raw(), radians);
        return out;
    }

    static rotateY(out: Vector3, vector: Vector3, origin: Vector3, radians: number) {
        glVec3.rotateY(out.raw(), vector.raw(), origin.raw(), radians);
        return out;
    }

    static rotateZ(out: Vector3, vector: Vector3, origin: Vector3, radians: number) {
        glVec3.rotateZ(out.raw(), vector.raw(), origin.raw(), radians);
        return out;
    }

    static angle(left: Vector3, right: Vector3) {
        return glVec3.angle(left.raw(), right.raw());
    }

    static zero(out: Vector3) {
        glVec3.zero(out.raw());
        return out;
    }

    static str(vector: Vector3) {
        return glVec3.str(vector.raw());
    }

    static exactEquals(left: Vector3, right: Vector3) {
        return glVec3.exactEquals(left.raw(), right.raw());
    }

    static equals(left: Vector3, right: Vector3) {
        return glVec3.equals(left.raw(), right.raw());
    }

    static fromRaw(vector: GLVec3) {
        return new Vector3(vector[0], vector[1], vector[2]);
    }

    static resolve($1?: Vector3.OVERLOAD, $2?: number, $3?: number): Vector3.LOOKUP_OBJECT {
        if ($1 instanceof Vector3) {
            return { x: $1.raw()[0], y: $1.raw()[1], z: $1.raw()[2] };
        }

        if (Array.isArray($1)) {
            return { x: $1[0] ?? 0, y: $1[1] ?? 0, z: $1[2] ?? 0 };
        }

        if (typeof $1 === "object" && $1 !== null) {
            return { x: $1.x ?? 0, y: $1.y ?? 0, z: $1.z ?? 0 };
        }

        if (typeof $1 === "number") {
            return { x: $1, y: $2 ?? 0, z: $3 ?? 0 };
        }

        return { x: 0, y: 0, z: 0 };
    }

    get x() {
        return this.#vec3[0];
    }

    set x(value: number) {
        this.#vec3[0] = value;
    }

    get y() {
        return this.#vec3[1];
    }

    set y(value: number) {
        this.#vec3[1] = value;
    }

    get z() {
        return this.#vec3[2];
    }

    set z(value: number) {
        this.#vec3[2] = value;
    }

    raw() {
        return this.#vec3;
    }

    clone() {
        return Vector3.clone(this);
    }

    set(x: number, y: number, z: number) {
        return Vector3.set(this, x, y, z);
    }

    copy(other: Vector3) {
        return Vector3.copy(this, other);
    }

    array(): [number, number, number] {
        return [this.#vec3[0], this.#vec3[1], this.#vec3[2]];
    }

    toArray() {
        return this.array();
    }

    add(other: Vector3) {
        return Vector3.add(this, this, other);
    }

    subtract(other: Vector3) {
        return Vector3.subtract(this, this, other);
    }

    sub(other: Vector3) {
        return this.subtract(other);
    }

    multiply(other: Vector3) {
        return Vector3.multiply(this, this, other);
    }

    mul(other: Vector3) {
        return this.multiply(other);
    }

    divide(other: Vector3) {
        return Vector3.divide(this, this, other);
    }

    div(other: Vector3) {
        return this.divide(other);
    }

    ceil() {
        return Vector3.ceil(this, this);
    }

    floor() {
        return Vector3.floor(this, this);
    }

    min(other: Vector3) {
        return Vector3.min(this, this, other);
    }

    max(other: Vector3) {
        return Vector3.max(this, this, other);
    }

    round() {
        return Vector3.round(this, this);
    }

    scale(amount: number) {
        return Vector3.scale(this, this, amount);
    }

    scaleAndAdd(other: Vector3, amount: number) {
        return Vector3.scaleAndAdd(this, this, other, amount);
    }

    distance(other: Vector3) {
        return Vector3.distance(this, other);
    }

    dist(other: Vector3) {
        return this.distance(other);
    }

    squaredDistance(other: Vector3) {
        return Vector3.squaredDistance(this, other);
    }

    sqrDist(other: Vector3) {
        return this.squaredDistance(other);
    }

    length() {
        return Vector3.length(this);
    }

    len() {
        return this.length();
    }

    squaredLength() {
        return Vector3.squaredLength(this);
    }

    sqrLen() {
        return this.squaredLength();
    }

    negate() {
        return Vector3.negate(this, this);
    }

    inverse() {
        return Vector3.inverse(this, this);
    }

    normalize() {
        return Vector3.normalize(this, this);
    }

    dot(other: Vector3) {
        return Vector3.dot(this, other);
    }

    cross(other: Vector3) {
        return Vector3.cross(this, this, other);
    }

    lerp(other: Vector3, amount: number) {
        return Vector3.lerp(this, this, other, amount);
    }

    slerp(other: Vector3, amount: number) {
        return Vector3.slerp(this, this, other, amount);
    }

    hermite(b: Vector3, c: Vector3, d: Vector3, amount: number) {
        return Vector3.hermite(this, this, b, c, d, amount);
    }

    bezier(b: Vector3, c: Vector3, d: Vector3, amount: number) {
        return Vector3.bezier(this, this, b, c, d, amount);
    }

    random(scale?: number) {
        const randomVector = Vector3.random(scale);
        return this.copy(randomVector);
    }

    transformMat4(matrix: mat4) {
        return Vector3.transformMat4(this, this, matrix);
    }

    transformMat3(matrix: mat3) {
        return Vector3.transformMat3(this, this, matrix);
    }

    transformQuat(rotation: quat) {
        return Vector3.transformQuat(this, this, rotation);
    }

    rotateX(origin: Vector3, radians: number) {
        return Vector3.rotateX(this, this, origin, radians);
    }

    rotateY(origin: Vector3, radians: number) {
        return Vector3.rotateY(this, this, origin, radians);
    }

    rotateZ(origin: Vector3, radians: number) {
        return Vector3.rotateZ(this, this, origin, radians);
    }

    angle(other: Vector3) {
        return Vector3.angle(this, other);
    }

    zero() {
        return Vector3.zero(this);
    }

    str() {
        return Vector3.str(this);
    }

    exactEquals(other: Vector3) {
        return Vector3.exactEquals(this, other);
    }

    equals(other: Vector3) {
        return Vector3.equals(this, other);
    }

    toString() {
        return this.str();
    }

    toJSON() {
        return { x: this.#vec3[0], y: this.#vec3[1], z: this.#vec3[2] };
    }
}

namespace Vector3 {
    export type X = number;
    export type Y = number;
    export type Z = number;
    export type ARR_OVERLOAD = [number?, number?, number?];
    export type OBJ_OVERLOAD = { x?: number, y?: number, z?: number };
    export type LOOKUP_OBJECT = { x: number, y: number, z: number };
    export type OVERLOAD = ARR_OVERLOAD | OBJ_OVERLOAD | Vector3 | number;
}

export default Vector3;
