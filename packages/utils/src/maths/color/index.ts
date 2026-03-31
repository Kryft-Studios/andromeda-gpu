
class Color {
    #lookup: Color.EXPLICIT_OBJ
    constructor(obj: Color.EXPLICIT_OBJ) {
        this.#lookup = obj
    }

    r(): number
    r(n: number): this
    r(n?: number): number | this {
        if (typeof n === "undefined") return this.#lookup.r
        this.#lookup.r = Color.clamp(n); return this
    }

    g(): number
    g(n: number): this
    g(n?: number): number | this {
        if (typeof n === "undefined") return this.#lookup.g
        this.#lookup.g = Color.clamp(n); return this
    }

    b(): number
    b(n: number): this
    b(n?: number): number | this {
        if (typeof n === "undefined") return this.#lookup.b
        this.#lookup.b = Color.clamp(n); return this
    }

    a(): number
    a(n: number): this
    a(n?: number): number | this {
        if (typeof n === "undefined") return this.#lookup.a
        this.#lookup.a = Color.clamp(n); return this
    }

    static hex(hex: Color.HEX_FORMAT) {
        if (!Color.isHex(hex)) throw "Invalid hex"
        return new Color(this.hexToObj(hex.slice(1).split("")))
    }

    static object(obj: Color.OBJ_FORMAT) {
        if (!Color.isValidObj(obj)) throw "Invalid object"
        return new Color(this.objToFixedObj(obj))
    }

    static array(arr: Color.ARR_FORMAT) {
        if (!Color.isValidArray(arr)) throw "Invalid array"
        return new Color(this.arrayToObj(arr))
    }
    static hsla(obj: Color.HSL_OBJ) {
        if (!Color.isHsla(obj)) throw "Invalid hsla";

        const h = obj.h ?? 0;
        const s = obj.s ?? 100;
        const l = obj.l ?? 100;
        const a = obj.a ?? 1;

        const rgb = Color.hslaToRgb(h, s, l, a);
        return new Color({
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
            a: Math.round(rgb.a * 255)
        });
    }
    object() {
        return { ...this.#lookup }
    }
    f32array() {
        return new Float32Array(this.unitRgba.array())
    }
    lerp(other: Color, t: number): Color.OBJ_FORMAT {
        const _t = Math.max(0, Math.min(1, t));

        const start = this.object();
        const end = other.object();

        return {
            r: start.r + (end.r - start.r) * _t,
            g: start.g + (end.g - start.g) * _t,
            b: start.b + (end.b - start.b) * _t,
            a: start.a + (end.a - start.a) * _t
        };
    }

    hex(): string {
        const { r, g, b } = this.#lookup;

        const toHex = (v: number) =>
            v.toString(16).padStart(2, "0");

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    hexA(): string {
        const { r, g, b, a } = this.#lookup;

        const toHex = (v: number) =>
            v.toString(16).padStart(2, "0");

        return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
    }

    array():[number,number,number,number] {
        return [this.#lookup.r, this.#lookup.g, this.#lookup.b, this.#lookup.a]
    }

    hsla = Object.assign(():{h:number,s:number,l:number,a:number}=>{
        const { r, g, b } = this.#lookup
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: h * 360,
            s: s * 100,
            l: l * 100,
            a: this.#lookup.a
        };
    },{
        array:():[number,number,number,number]=>{
        return Object.values(this.hsla()) as [number,number,number,number]
    }
    })

    unitRgba = Object.assign(()=>{
        return {
            r: this.#lookup.r / 255,
            g: this.#lookup.g / 255,
            b: this.#lookup.b / 255,
            a: this.#lookup.a
        }
    }, {
        array:():[number,number,number,number]=>{
        return [this.#lookup.r / 255,
        this.#lookup.g / 255,
        this.#lookup.b / 255,
        this.#lookup.a
        ]
    }
    })

    hsl = Object.assign(()=>{const {h,s,l} = this.hsla();return {h,s,l}},{
        array:():[number,number,number]=>{const {h,s,l}=this.hsla();return [h,s,l]}
    })
}
namespace Color {
    type HEX1 = `#${string}`;
    type HEX2 = `#${string}${string}`;
    type HEX3 = `#${string}${string}${string}`;
    type HEX6 = `#${string}${string}${string}${string}${string}${string}`;
    type HEX8 = `#${string}${string}${string}${string}${string}${string}${string}${string}`;
    export type HEX_FORMAT = HEX1 | HEX2 | HEX3 | HEX6 | HEX8
    export function isHex(str: string): str is HEX_FORMAT {
        if (!str.startsWith("#")) return false;
        let letters = str.slice(1).split("")
        if (letters.length === 0) return false;
        if (!letters.every(a => VALID_HEX_LETTERS.includes(a))) return false;
        return true;
    }
    export function hexToObj(l: string[]) {
        const len = l.length;
        let r, g, b, a = 255;

        switch (len) {
            case 1:
                const full = l[0].repeat(2);
                r = g = b = a = parseInt(full, 16);
                break;

            case 2:
                r = parseInt(l[0] + l[0], 16);
                g = parseInt(l[1] + l[1], 16);
                b = parseInt(l[0] + l[0], 16);
                a = 0;
                break;

            case 3:
                r = parseInt(l[0] + l[0], 16);
                g = parseInt(l[1] + l[1], 16);
                b = parseInt(l[2] + l[2], 16);
                a = 0;
                break;

            case 6:
                r = parseInt(l[0] + l[1], 16);
                g = parseInt(l[2] + l[3], 16);
                b = parseInt(l[4] + l[5], 16);
                break;

            case 8:
                r = parseInt(l[0] + l[1], 16);
                g = parseInt(l[2] + l[3], 16);
                b = parseInt(l[4] + l[5], 16);
                a = parseInt(l[6] + l[7], 16);
                break;

            default:
                r = g = b = 0;
                a = 255;
        }

        return { r, g, b, a };
    }
    export function arrayToObj(arr: ARR_FORMAT) {
        return {
            r: arr[0] || 0,
            g: arr[1] || 0,
            b: arr[2] || 0,
            a: arr[3] || 0
        }
    }
    export function objToFixedObj(obj: OBJ_FORMAT) {
        return {
            r: obj.r || 0,
            g: obj.g || 0,
            a: obj.a || 0,
            b: obj.b || 0
        }
    }
    export function isValidObj(obj: OBJ_FORMAT) {
        return Object.values(obj).every(a => a >= 0 && a <= 255)
    }
    export function isValidArray(arr: ARR_FORMAT) {
        return arr.every(a => typeof a !== "undefined" && a >= 0 && a <= 255)
    }
    export const VALID_HEX_LETTERS = "0123456789abcdefABCDEF".split("");
    export interface OBJ_FORMAT {
        r?: number,
        g?: number,
        b?: number,
        a?: number
    }
    export type ARR_FORMAT = [number?, number?, number?, number?];
    export type VALID_FORMATS = HEX_FORMAT | OBJ_FORMAT | ARR_FORMAT
    export interface EXPLICIT_OBJ {
        r: number, g: number, b: number, a: number
    }
    export const clamp = (v: number) => Math.max(0, Math.min(255, v))
    export interface HSL_OBJ {
        h?: number,
        s?: number,
        l?: number,
        a?: number
    }
    export function isHsla(obj: HSL_OBJ) {
        if (obj.h !== undefined && !(obj.h >= 0 && obj.h <= 360)) return false
        if (obj.s !== undefined && !(obj.s >= 0 && obj.s <= 100)) return false
        if (obj.l !== undefined && !(obj.l >= 0 && obj.l <= 100)) return false
        if (obj.a !== undefined && !(obj.a >= 0 && obj.a <= 1)) return false
        return true;
    }
    export function hslaToRgb(h: number, s: number, l: number, alpha: number) {
        s /= 100; l /= 100;

        const k = (n: number) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);

        const f = (n: number) =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4)),
            a: alpha
        };
    }
}
export default Color;

