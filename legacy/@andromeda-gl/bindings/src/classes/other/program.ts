import error from "../../helpers/errors";
import ARRAY_WITH_LENGTH from "../../helpers/types/arraywithlen";
import Shader from "./shader";
export class Program {
    constructor(gl: WebGL2RenderingContext, { shaders }: { shaders: Shader[] }) {
        this.#gl = gl;
        this.#s = shaders;
        this.#p = gl.createProgram();
        for (let i = 0; i < shaders.length; i++) {
            gl.attachShader(this.#p, shaders[i].raw())
        }
        gl.linkProgram(this.#p);

        if (!gl.getProgramParameter(this.#p, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(this.#p);
            throw error(3, `Could not compile WebGL program. \n\n${info}`);
        }
    }
    #gl: WebGL2RenderingContext;
    #s: Shader[]
    #p: WebGLProgram;
    #used: boolean = false;
    [Symbol.dispose]() {
        this.delete()
    }
    [Symbol.iterator]() { }
    use() {
        if (this.#deleted) throw error(4, "Program is already destroyed!")
        if (this.#used) return;
        this.#gl.useProgram(this.#p);
        this.#used = true;
    }
    #deleted: boolean = false;
    delete() {
        if (this.#deleted) return;
        return this.#deleted = true, this.#gl.deleteProgram(this.#p)
        this.#gl.uniform1f
    }

    get shaders(): Shader[] & ((val?: Shader[]) => Shader[]) {
        const targetArray = this.#s;
        const gl = this.#gl;
        const program = this.#p;

        const proxy = new Proxy(targetArray, {
            set: (target, p, val, receiver) => {
                const index = Number(p);
                if (!isNaN(index) && val instanceof Shader) {
                    if (this.#deleted) throw error(4, "Program is already destroyed!")
                    if (target[index]) gl.detachShader(program, target[index].raw());
                    gl.attachShader(program, val.raw());
                    target[index] = val;
                    return true;
                }
                return Reflect.set(target, p, val, receiver);
            }
        });

        const fn = (val?: Shader[]): Shader[] => {
            if (this.#deleted) throw error(4, "Program is already destroyed!")
            if (typeof val === "undefined") return targetArray;
            val.forEach(s => {
                gl.attachShader(program, s.raw());
                targetArray.push(s);
            });
            return targetArray;
        };

        return Object.assign(fn, proxy) as Shader[] & ((val?: Shader[]) => Shader[]);
    }

    set shaders(val: Shader[]) {
        if (this.#deleted) throw error(4, "Program is already destroyed!")
        this.shaders(val);
    }
    uniform<LEN extends 1 | 2 | 3 | 4>(loc: WebGLUniformLocation, len: LEN) {
        if(!this.#used)throw error(10,"Program is not used")
        if (this.#deleted) throw error(4, "Program is already destroyed!")
        const f = this.#gl[`uniform${len}f`]
        const fv = this.#gl[`uniform${len}fv`]
        const i = this.#gl[`uniform${len}i`]
        const iv = this.#gl[`uniform${len}iv`]
        return {
            float: (val: ARRAY_WITH_LENGTH<LEN, number>) => {
                //@ts-ignore
                f.call(this.#gl, loc, ...val)
            },
            float32: (val: Float32Array) => {
                if (val.length !== len) throw error(8, "Invalid float 32 passed to Program.uniform(...).float32")
                fv.call(this.#gl, loc, val, val.byteOffset, val.byteLength)
            },
            integer: (val: ARRAY_WITH_LENGTH<LEN, number>) => {
                //@ts-ignore
                i.call(this.#gl, loc, ...val)
            },
            int32: (val: Int32Array) => {
                if (val.length !== len) throw error(9, "Invalid int 32 passed to Program.uniform(...).int32")
                iv.call(this.#gl, loc, val, val.byteOffset, val.byteLength)
            }
        }
    }
    uniformMat<LEN extends 2 | 3 | 4>(
        loc: WebGLUniformLocation,
        len: LEN,
        val: ARRAY_WITH_LENGTH<MAT_SIZE<LEN>, number> | Float32Array
    ) {
        if(!this.#used)throw error(10,"Program is not used")
        if (this.#deleted) throw error(4, "Program is already destroyed!");
        const method = `uniformMatrix${len}fv` as const;
        this.#gl[method](loc, false, val);
    }
    location(name:string){
        return this.#gl.getAttribLocation(this.#p,name)
    }
}
type MAT_SIZE<L extends number> =
    L extends 2 ? 4 :
    L extends 3 ? 9 :
    L extends 4 ? 16 : number;

export namespace Program {
    export interface SHADERS_FN {
        shaders(): Shader[]
        shaders(val: Shader[]): void
    }
    export type A = WebGL2RenderingContext["uniform2i"]
}
export default Program;