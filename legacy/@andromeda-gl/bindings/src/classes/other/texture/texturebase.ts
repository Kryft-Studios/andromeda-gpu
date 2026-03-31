import error from "../../../helpers/errors";

export abstract class TextureBase {
    readonly #gl: WebGL2RenderingContext;
    readonly #texture: WebGLTexture;
    readonly #target: WebGL2RenderingContext["TEXTURE_3D"]|WebGL2RenderingContext["TEXTURE_2D"];
    
    #isDestroyed = false;

    constructor(gl: WebGL2RenderingContext, target: TextureBase.TARGET) {
        this.#gl = gl;
        this.#target = target;
        
        const tex = gl.createTexture();
        if (!tex) throw error(11,"Failed to create texture!")
        this.#texture = tex;

        this.bind();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4); 
    }

    bind() {
        if (this.#isDestroyed) throw error(12,"Texture already destroyed!")
        this.#gl.bindTexture(this.#target, this.#texture);
    }

    setFilters(min: number, mag: number, wrapS: number, wrapT: number, wrapR?: number) {
        if (this.#isDestroyed) throw error(12,"Texture already destroyed!")
        const gl = this.#gl;
        this.bind();
        gl.texParameteri(this.#target, gl.TEXTURE_MIN_FILTER, min);
        gl.texParameteri(this.#target, gl.TEXTURE_MAG_FILTER, mag);
        gl.texParameteri(this.#target, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(this.#target, gl.TEXTURE_WRAP_T, wrapT);
        if (wrapR && this.#target === gl.TEXTURE_3D) {
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, wrapR);
        }
    }

    setAnisotropy(level: number) {
        if (this.#isDestroyed) throw error(12,"Texture already destroyed!")
        const gl = this.#gl;
        const ext = gl.getExtension('EXT_texture_filter_anisotropic');
        if (ext) {
            this.bind();
            const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            gl.texParameterf(this.#target, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(level, max));
        }
    }

    generateMipmaps() {
        if (this.#isDestroyed) throw error(12,"Texture already destroyed!")
        this.bind();
        this.#gl.generateMipmap(this.#target);
    }

    destroy() {
        if (!this.#isDestroyed) {
            this.#gl.deleteTexture(this.#texture);
            this.#isDestroyed = true;
        }
    }

    raw() { return this.#texture; }
}
export namespace TextureBase {
    export interface CONFIG {
    type: TYPE;
    format?: number;
    level?: number;
}
export type TYPE = "compressed" | "normal" | "sub";
export type TARGET = WebGL2RenderingContext["TEXTURE_3D"]|WebGL2RenderingContext["TEXTURE_2D"];
}