import error from "../../../helpers/errors";
import { TextureBase } from "./texturebase";
import { guessTextureParameters } from "./internalformatguessor";

export class Texture2D extends TextureBase {
    #width: number = 0;
    #height: number = 0;
    #gl: WebGL2RenderingContext;
    #config: Required<Texture2D.CONFIG>;

    constructor(gl: WebGL2RenderingContext, config: Texture2D.CONFIG = {}) {
        super(gl, gl.TEXTURE_2D);
        this.#gl = gl;
        
        this.#config = {
            usage: config.usage ?? "normal",
            internalFormat: config.internalFormat ?? gl.RGBA8,
            generateMipmaps: config.generateMipmaps ?? true
        };

        this.setFilters(gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    }

    /**
     * Upload or update pixels. 
     */
    update(source: TexImageSource | ArrayBufferView, width?: number, height?: number, x = 0, y = 0) {
        const gl = this.#gl;
        this.bind();

        const w = width ?? (source as any).width ?? (source as any).videoWidth ?? 0;
        const h = height ?? (source as any).height ?? (source as any).videoHeight ?? 0;

        if (w === 0 || h === 0) throw error(15, "Texture dimensions cannot be zero.");

        const { format, type } = guessTextureParameters(gl, source, w, h);

        if (this.#config.usage === "sub") {
            if (ArrayBuffer.isView(source)) {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, format, type, source);
            } else {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, format, type, source as TexImageSource);
            }
        } else if (this.#config.usage === "compressed") {
            const ext = gl.getExtension("WEBGL_compressed_texture_s3tc"); 
            if (!ext) throw error(14, "Compressed textures not supported.");
            gl.compressedTexImage2D(gl.TEXTURE_2D, 0, this.#config.internalFormat, w, h, 0, source as ArrayBufferView);
        } else {
            if (ArrayBuffer.isView(source)) {
                gl.texImage2D(gl.TEXTURE_2D, 0, this.#config.internalFormat, w, h, 0, format, type, source);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, this.#config.internalFormat, format, type, source as TexImageSource);
            }
            this.#width = w;
            this.#height = h;
        }

        if (this.#config.generateMipmaps) this.generateMipmaps();
    }

    width() { return this.#width; }
    height() { return this.#height; }
}

export namespace Texture2D {
    export interface CONFIG {
        usage?: "normal" | "sub" | "compressed";
        internalFormat?: number;
        generateMipmaps?: boolean;
    }
}