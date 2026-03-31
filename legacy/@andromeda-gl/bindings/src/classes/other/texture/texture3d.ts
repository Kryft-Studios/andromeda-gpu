import error from "../../../helpers/errors";
import { TextureBase } from "./texturebase";
import { guessTextureParameters } from "./internalformatguessor";

export class Texture3D extends TextureBase {
    #width: number = 0;
    #height: number = 0;
    #depth: number = 0;
    #gl: WebGL2RenderingContext;
    #config: Required<Texture3D.CONFIG>;

    constructor(gl: WebGL2RenderingContext, config: Texture3D.CONFIG = {}) {
        super(gl, gl.TEXTURE_3D);
        this.#gl = gl;
        
        this.#config = {
            usage: config.usage ?? "normal",
            internalFormat: config.internalFormat ?? gl.RGBA8,
            generateMipmaps: config.generateMipmaps ?? true
        };

        this.setFilters(gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    }

    /**
     * Upload or update 3D volume data.
     */
    update(source: ArrayBufferView, width: number, height: number, depth: number, x = 0, y = 0, z = 0) {
        const gl = this.#gl;
        this.bind();

        if (width === 0 || height === 0 || depth === 0) {
            throw error(15, "Texture3D dimensions cannot be zero.");
        }

        const { format, type } = guessTextureParameters(gl, source, width, height, depth);

        if (this.#config.usage === "sub") {
            gl.texSubImage3D(gl.TEXTURE_3D, 0, x, y, z, width, height, depth, format, type, source);
        } else {
            gl.texImage3D(gl.TEXTURE_3D, 0, this.#config.internalFormat, width, height, depth, 0, format, type, source);
            
            this.#width = width;
            this.#height = height;
            this.#depth = depth;
        }

        if (this.#config.generateMipmaps) this.generateMipmaps();
    }

    width() { return this.#width; }
    height() { return this.#height; }
    depth() { return this.#depth; }
}

export namespace Texture3D {
    export interface CONFIG {
        usage?: "normal" | "sub"; 
        internalFormat?: number;
        generateMipmaps?: boolean;
    }
}