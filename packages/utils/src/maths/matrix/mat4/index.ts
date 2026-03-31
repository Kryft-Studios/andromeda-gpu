import { mat4 as glMat4 } from "gl-matrix";
import type { mat4 as GLMat4, quat, quat2, vec3 } from "gl-matrix";
import Vector3 from "../../vector/vec3/index.js";

export type MATRIX_4_FOV = {
    upDegrees: number;
    downDegrees: number;
    leftDegrees: number;
    rightDegrees: number;
};

class Matrix4 {
    #mat4: GLMat4;

    constructor();
    constructor(values: Matrix4.ARR_OVERLOAD);
    constructor(other: Matrix4);
    constructor(m00: number, m01?: number, m02?: number, m03?: number, m10?: number, m11?: number, m12?: number, m13?: number, m20?: number, m21?: number, m22?: number, m23?: number, m30?: number, m31?: number, m32?: number, m33?: number);
    constructor($1?: Matrix4.OVERLOAD, $2?: number, $3?: number, $4?: number, $5?: number, $6?: number, $7?: number, $8?: number, $9?: number, $10?: number, $11?: number, $12?: number, $13?: number, $14?: number, $15?: number, $16?: number) {
        const values = Matrix4.resolve($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
        this.#mat4 = glMat4.fromValues(...values);
    }

    static create() { return new Matrix4(); }
    static clone(matrix: Matrix4) { return Matrix4.fromRaw(glMat4.clone(matrix.raw())); }
    static copy(out: Matrix4, matrix: Matrix4) { glMat4.copy(out.raw(), matrix.raw()); return out; }
    static fromValues(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number) { return new Matrix4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33); }
    static set(out: Matrix4, m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number) { glMat4.set(out.raw(), m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33); return out; }
    static identity(out: Matrix4) { glMat4.identity(out.raw()); return out; }
    static transpose(out: Matrix4, matrix: Matrix4) { glMat4.transpose(out.raw(), matrix.raw()); return out; }
    static invert(out: Matrix4, matrix: Matrix4) { glMat4.invert(out.raw(), matrix.raw()); return out; }
    static adjoint(out: Matrix4, matrix: Matrix4) { glMat4.adjoint(out.raw(), matrix.raw()); return out; }
    static determinant(matrix: Matrix4) { return glMat4.determinant(matrix.raw()); }
    static multiply(out: Matrix4, left: Matrix4, right: Matrix4) { glMat4.multiply(out.raw(), left.raw(), right.raw()); return out; }
    static mul(out: Matrix4, left: Matrix4, right: Matrix4) { return Matrix4.multiply(out, left, right); }
    static translate(out: Matrix4, matrix: Matrix4, vector: Vector3) { glMat4.translate(out.raw(), matrix.raw(), vector.raw()); return out; }
    static scale(out: Matrix4, matrix: Matrix4, vector: Vector3) { glMat4.scale(out.raw(), matrix.raw(), vector.raw()); return out; }
    static rotate(out: Matrix4, matrix: Matrix4, radians: number, axis: Vector3) { glMat4.rotate(out.raw(), matrix.raw(), radians, axis.raw()); return out; }
    static rotateX(out: Matrix4, matrix: Matrix4, radians: number) { glMat4.rotateX(out.raw(), matrix.raw(), radians); return out; }
    static rotateY(out: Matrix4, matrix: Matrix4, radians: number) { glMat4.rotateY(out.raw(), matrix.raw(), radians); return out; }
    static rotateZ(out: Matrix4, matrix: Matrix4, radians: number) { glMat4.rotateZ(out.raw(), matrix.raw(), radians); return out; }
    static fromTranslation(out: Matrix4, vector: Vector3) { glMat4.fromTranslation(out.raw(), vector.raw()); return out; }
    static fromScaling(out: Matrix4, vector: Vector3) { glMat4.fromScaling(out.raw(), vector.raw()); return out; }
    static fromRotation(out: Matrix4, radians: number, axis: Vector3) { glMat4.fromRotation(out.raw(), radians, axis.raw()); return out; }
    static fromXRotation(out: Matrix4, radians: number) { glMat4.fromXRotation(out.raw(), radians); return out; }
    static fromYRotation(out: Matrix4, radians: number) { glMat4.fromYRotation(out.raw(), radians); return out; }
    static fromZRotation(out: Matrix4, radians: number) { glMat4.fromZRotation(out.raw(), radians); return out; }
    static fromRotationTranslation(out: Matrix4, rotation: quat, translation: Vector3) { glMat4.fromRotationTranslation(out.raw(), rotation, translation.raw()); return out; }
    static fromQuat2(out: Matrix4, dualQuat: quat2) { glMat4.fromQuat2(out.raw(), dualQuat); return out; }
    static getTranslation(matrix: Matrix4) { return Vector3.fromRaw(glMat4.getTranslation([0, 0, 0] as vec3, matrix.raw())); }
    static getScaling(matrix: Matrix4) { return Vector3.fromRaw(glMat4.getScaling([0, 0, 0] as vec3, matrix.raw())); }
    static getRotation(matrix: Matrix4) { return glMat4.getRotation([0, 0, 0, 1] as quat, matrix.raw()); }
    static decompose(matrix: Matrix4) {
        const rotation = [0, 0, 0, 1] as quat;
        const translation = [0, 0, 0] as vec3;
        const scaling = [0, 0, 0] as vec3;
        glMat4.decompose(rotation, translation, scaling, matrix.raw());
        return { rotation, translation: Vector3.fromRaw(translation), scaling: Vector3.fromRaw(scaling) };
    }
    static fromRotationTranslationScale(out: Matrix4, rotation: quat, translation: Vector3, scaling: Vector3) { glMat4.fromRotationTranslationScale(out.raw(), rotation, translation.raw(), scaling.raw()); return out; }
    static fromRotationTranslationScaleOrigin(out: Matrix4, rotation: quat, translation: Vector3, scaling: Vector3, origin: Vector3) { glMat4.fromRotationTranslationScaleOrigin(out.raw(), rotation, translation.raw(), scaling.raw(), origin.raw()); return out; }
    static fromQuat(out: Matrix4, rotation: quat) { glMat4.fromQuat(out.raw(), rotation); return out; }
    static frustum(out: Matrix4, left: number, right: number, bottom: number, top: number, near: number, far: number) { glMat4.frustum(out.raw(), left, right, bottom, top, near, far); return out; }
    static perspectiveNO(out: Matrix4, fovy: number, aspect: number, near: number, far: number) { glMat4.perspectiveNO(out.raw(), fovy, aspect, near, far); return out; }
    static perspective(out: Matrix4, fovy: number, aspect: number, near: number, far: number) { glMat4.perspective(out.raw(), fovy, aspect, near, far); return out; }
    static perspectiveZO(out: Matrix4, fovy: number, aspect: number, near: number, far: number) { glMat4.perspectiveZO(out.raw(), fovy, aspect, near, far); return out; }
    static perspectiveFromFieldOfView(out: Matrix4, fov: MATRIX_4_FOV, near: number, far: number) { glMat4.perspectiveFromFieldOfView(out.raw(), fov, near, far); return out; }
    static orthoNO(out: Matrix4, left: number, right: number, bottom: number, top: number, near: number, far: number) { glMat4.orthoNO(out.raw(), left, right, bottom, top, near, far); return out; }
    static ortho(out: Matrix4, left: number, right: number, bottom: number, top: number, near: number, far: number) { glMat4.ortho(out.raw(), left, right, bottom, top, near, far); return out; }
    static orthoZO(out: Matrix4, left: number, right: number, bottom: number, top: number, near: number, far: number) { glMat4.orthoZO(out.raw(), left, right, bottom, top, near, far); return out; }
    static lookAt(out: Matrix4, eye: Vector3, center: Vector3, up: Vector3) { glMat4.lookAt(out.raw(), eye.raw(), center.raw(), up.raw()); return out; }
    static targetTo(out: Matrix4, eye: Vector3, target: Vector3, up: Vector3) { glMat4.targetTo(out.raw(), eye.raw(), target.raw(), up.raw()); return out; }
    static str(matrix: Matrix4) { return glMat4.str(matrix.raw()); }
    static frob(matrix: Matrix4) { return glMat4.frob(matrix.raw()); }
    static add(out: Matrix4, left: Matrix4, right: Matrix4) { glMat4.add(out.raw(), left.raw(), right.raw()); return out; }
    static subtract(out: Matrix4, left: Matrix4, right: Matrix4) { glMat4.subtract(out.raw(), left.raw(), right.raw()); return out; }
    static sub(out: Matrix4, left: Matrix4, right: Matrix4) { return Matrix4.subtract(out, left, right); }
    static multiplyScalar(out: Matrix4, matrix: Matrix4, scalar: number) { glMat4.multiplyScalar(out.raw(), matrix.raw(), scalar); return out; }
    static multiplyScalarAndAdd(out: Matrix4, left: Matrix4, right: Matrix4, scale: number) { glMat4.multiplyScalarAndAdd(out.raw(), left.raw(), right.raw(), scale); return out; }
    static exactEquals(left: Matrix4, right: Matrix4) { return glMat4.exactEquals(left.raw(), right.raw()); }
    static equals(left: Matrix4, right: Matrix4) { return glMat4.equals(left.raw(), right.raw()); }
    static fromRaw(matrix: GLMat4) { return new Matrix4(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6], matrix[7], matrix[8], matrix[9], matrix[10], matrix[11], matrix[12], matrix[13], matrix[14], matrix[15]); }
    static resolve($1?: Matrix4.OVERLOAD, $2?: number, $3?: number, $4?: number, $5?: number, $6?: number, $7?: number, $8?: number, $9?: number, $10?: number, $11?: number, $12?: number, $13?: number, $14?: number, $15?: number, $16?: number): Matrix4.LOOKUP {
        if ($1 instanceof Matrix4) return $1.array();
        if (Array.isArray($1)) return [$1[0] ?? 1, $1[1] ?? 0, $1[2] ?? 0, $1[3] ?? 0, $1[4] ?? 0, $1[5] ?? 1, $1[6] ?? 0, $1[7] ?? 0, $1[8] ?? 0, $1[9] ?? 0, $1[10] ?? 1, $1[11] ?? 0, $1[12] ?? 0, $1[13] ?? 0, $1[14] ?? 0, $1[15] ?? 1];
        if (typeof $1 === "number") return [$1, $2 ?? 0, $3 ?? 0, $4 ?? 0, $5 ?? 0, $6 ?? 1, $7 ?? 0, $8 ?? 0, $9 ?? 0, $10 ?? 0, $11 ?? 1, $12 ?? 0, $13 ?? 0, $14 ?? 0, $15 ?? 0, $16 ?? 1];
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }

    raw() { return this.#mat4; }
    clone() { return Matrix4.clone(this); }
    copy(other: Matrix4) { return Matrix4.copy(this, other); }
    set(m00: number, m01: number, m02: number, m03: number, m10: number, m11: number, m12: number, m13: number, m20: number, m21: number, m22: number, m23: number, m30: number, m31: number, m32: number, m33: number) { return Matrix4.set(this, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33); }
    identity() { return Matrix4.identity(this); }
    array(): Matrix4.LOOKUP { return [this.#mat4[0], this.#mat4[1], this.#mat4[2], this.#mat4[3], this.#mat4[4], this.#mat4[5], this.#mat4[6], this.#mat4[7], this.#mat4[8], this.#mat4[9], this.#mat4[10], this.#mat4[11], this.#mat4[12], this.#mat4[13], this.#mat4[14], this.#mat4[15]]; }
    transpose() { return Matrix4.transpose(this, this); }
    invert() { return Matrix4.invert(this, this); }
    adjoint() { return Matrix4.adjoint(this, this); }
    determinant() { return Matrix4.determinant(this); }
    multiply(other: Matrix4) { return Matrix4.multiply(this, this, other); }
    mul(other: Matrix4) { return this.multiply(other); }
    translate(vector: Vector3) { return Matrix4.translate(this, this, vector); }
    scale(vector: Vector3) { return Matrix4.scale(this, this, vector); }
    rotate(radians: number, axis: Vector3) { return Matrix4.rotate(this, this, radians, axis); }
    rotateX(radians: number) { return Matrix4.rotateX(this, this, radians); }
    rotateY(radians: number) { return Matrix4.rotateY(this, this, radians); }
    rotateZ(radians: number) { return Matrix4.rotateZ(this, this, radians); }
    fromTranslation(vector: Vector3) { return Matrix4.fromTranslation(this, vector); }
    fromScaling(vector: Vector3) { return Matrix4.fromScaling(this, vector); }
    fromRotation(radians: number, axis: Vector3) { return Matrix4.fromRotation(this, radians, axis); }
    fromXRotation(radians: number) { return Matrix4.fromXRotation(this, radians); }
    fromYRotation(radians: number) { return Matrix4.fromYRotation(this, radians); }
    fromZRotation(radians: number) { return Matrix4.fromZRotation(this, radians); }
    fromRotationTranslation(rotation: quat, translation: Vector3) { return Matrix4.fromRotationTranslation(this, rotation, translation); }
    fromQuat2(dualQuat: quat2) { return Matrix4.fromQuat2(this, dualQuat); }
    fromRotationTranslationScale(rotation: quat, translation: Vector3, scaling: Vector3) { return Matrix4.fromRotationTranslationScale(this, rotation, translation, scaling); }
    fromRotationTranslationScaleOrigin(rotation: quat, translation: Vector3, scaling: Vector3, origin: Vector3) { return Matrix4.fromRotationTranslationScaleOrigin(this, rotation, translation, scaling, origin); }
    fromQuat(rotation: quat) { return Matrix4.fromQuat(this, rotation); }
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number) { return Matrix4.frustum(this, left, right, bottom, top, near, far); }
    perspectiveNO(fovy: number, aspect: number, near: number, far: number) { return Matrix4.perspectiveNO(this, fovy, aspect, near, far); }
    perspective(fovy: number, aspect: number, near: number, far: number) { return Matrix4.perspective(this, fovy, aspect, near, far); }
    perspectiveZO(fovy: number, aspect: number, near: number, far: number) { return Matrix4.perspectiveZO(this, fovy, aspect, near, far); }
    perspectiveFromFieldOfView(fov: MATRIX_4_FOV, near: number, far: number) { return Matrix4.perspectiveFromFieldOfView(this, fov, near, far); }
    orthoNO(left: number, right: number, bottom: number, top: number, near: number, far: number) { return Matrix4.orthoNO(this, left, right, bottom, top, near, far); }
    ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) { return Matrix4.ortho(this, left, right, bottom, top, near, far); }
    orthoZO(left: number, right: number, bottom: number, top: number, near: number, far: number) { return Matrix4.orthoZO(this, left, right, bottom, top, near, far); }
    lookAt(eye: Vector3, center: Vector3, up: Vector3) { return Matrix4.lookAt(this, eye, center, up); }
    targetTo(eye: Vector3, target: Vector3, up: Vector3) { return Matrix4.targetTo(this, eye, target, up); }
    getTranslation() { return Matrix4.getTranslation(this); }
    getScaling() { return Matrix4.getScaling(this); }
    getRotation() { return Matrix4.getRotation(this); }
    decompose() { return Matrix4.decompose(this); }
    str() { return Matrix4.str(this); }
    frob() { return Matrix4.frob(this); }
    add(other: Matrix4) { return Matrix4.add(this, this, other); }
    subtract(other: Matrix4) { return Matrix4.subtract(this, this, other); }
    sub(other: Matrix4) { return this.subtract(other); }
    multiplyScalar(scalar: number) { return Matrix4.multiplyScalar(this, this, scalar); }
    multiplyScalarAndAdd(other: Matrix4, scale: number) { return Matrix4.multiplyScalarAndAdd(this, this, other, scale); }
    exactEquals(other: Matrix4) { return Matrix4.exactEquals(this, other); }
    equals(other: Matrix4) { return Matrix4.equals(this, other); }
    toString() { return this.str(); }
    toJSON() { return this.array(); }
}

namespace Matrix4 {
    export type LOOKUP = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    export type ARR_OVERLOAD = [number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?];
    export type OVERLOAD = ARR_OVERLOAD | Matrix4 | number;
}

export default Matrix4;
