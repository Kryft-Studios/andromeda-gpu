import {
    DeviceControls,
    TEXTURE,
    DEVICE,
    SAMPLER
} from "@agpu/bindings";
import { error } from "@agpu/helpers/errors";
import RANGE from "@agpu/helpers/greaterthan";

namespace TextureStaticOperations {
    export type DIMENSION_OPTIONS = {
        dimension: "2d",
        view?: "cube-array" | "2d" | "2d-array" | "cube"
    } | {
        dimension: "1d",
        view?: "1d"
    } | {
        dimension: "3d",
        view?: "3d"
    }
    export interface OPTIONS {
        image?: {
            flipY?: boolean,
            origin?: GPUOrigin2D,
            width?: number,
            mipLevel?: number,
            height?: number
        },
        wrapMode?: GPUAddressMode,
        lod?: [number, number],
        filter?: {
            min?: GPUFilterMode,
            max?: GPUFilterMode,
            mipmap?: GPUFilterMode
        },
        dimension?: DIMENSION_OPTIONS
        maxAnisotropy?: RANGE<1, 17>
    }
}
class TextureStaticOperations {
    static readonly class?: { new(dvcontrols: DeviceControls, image: ImageBitmap | ImageData, opts: TextureStaticOperations.OPTIONS): Texture }
    static async from(dvcontrols: DeviceControls, image: HTMLImageElement, opts: TextureStaticOperations.OPTIONS = {}) {
        const bit = await createImageBitmap(image);
        return new (this as any)(dvcontrols, bit, opts)
    }
    static async fromURL(dvcontrols: DeviceControls, url: `${string}://${string}`, OPTS: TextureStaticOperations.OPTIONS = {}) {
        if (!URL.canParse(url)) throw error("@agpu/texture", 2, "The given url is invalid")
        const fesh = await fetch(url);
        const blob = await fesh.blob();
        const bit = await createImageBitmap(blob);
        return new (this as any)(dvcontrols, bit, OPTS)
    }
    static async fromArray(dvcontrols: DeviceControls, array: RANGE<1, 256>[], width: number, height: number, OPTS: TextureStaticOperations.OPTIONS) {
        const imageData = new ImageData(new Uint8ClampedArray(array), width, height);
        return new (this as any)(dvcontrols, imageData, OPTS)
    }
}

/** 
 * # `Texture`
 * This class represents a Texture in AGPU.
 *  
 */
class Texture<OPTIONS extends TextureStaticOperations.OPTIONS = TextureStaticOperations.OPTIONS, ACTUALOPTIONS extends (OPTIONS & TextureStaticOperations.OPTIONS) = OPTIONS> extends TextureStaticOperations {
    #tex: TEXTURE
    #device: DEVICE
    #opts: ACTUALOPTIONS
    #destroyed: boolean = false
    constructor(dvcontrols: DeviceControls, image: ImageData | ImageBitmap, options: ACTUALOPTIONS) {
        super()
        this.#device = dvcontrols
        this.#opts = options
        options.image = options.image ?? {};
        options.image.mipLevel = options.image?.mipLevel ?? (
            Math.floor(Math.log2(Math.max(image.width, image.height))) + 1
        )
        this.#tex = new dvcontrols.Texture({
            format: "rgba8unorm-srgb",
            size: {
                height: image.height,
                width: image.width
            }, usage: {
                "binding": { storage: true, texture: true },
                "copy": true,
                "renderAttachment": true,
                "transientAttachment": true,
            },
            dimension: options.dimension?.dimension,
            textureBindingViewDimension: options.dimension?.view ?? options.dimension?.dimension,
            viewFormats: ["rgba8unorm-srgb"],
            mipLevelCount: options.image.mipLevel
        })
        dvcontrols.device.queue.copyExternalImageToTexture({
            source: image,
            flipY: options.image?.flipY,
            origin: options.image?.origin
        }, {
            texture: this.#tex.raw(),
            aspect: "all",
            mipLevel: options.image?.mipLevel,
            premultipliedAlpha: true
        }, {
            width: image.width,
            height: image.height
        })
    }
    get destroyed() {
        return this.#destroyed;
    }
    destroy(): true {
        return this.#tex.destroy(true), this.#destroyed = true;
    }
    /**Returns the dimension of the texture */
    get dimension(): ACTUALOPTIONS["dimension"] {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#opts.dimension
    }
    /**Returns the wrap mode of the texture */
    get wrapMode(): ACTUALOPTIONS["wrapMode"] {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#opts.wrapMode
    }
    /**Returns the lod clamping of the texture */
    get lod(): ACTUALOPTIONS["lod"] {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#opts.lod
    }
    /**Returns the filters of the texture */
    get filters(): ACTUALOPTIONS["filter"] {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#opts.filter
    }
    /**Returns the max anistropy of the texture */
    get anisotropy(): ACTUALOPTIONS["maxAnisotropy"] {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#opts.maxAnisotropy
    }
    /**Returns the options of the texture */
    get options(): ACTUALOPTIONS {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#opts;
    }

    /**Returns the raw webgpu texture.*/
    get texture(): TEXTURE {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        return this.#tex;
    }
    #sampler?: SAMPLER
    /**Returns the raw sampler. */
    get sampler(): SAMPLER {
        if (this.destroyed) throw error("@agpu/texture", 1, "Texture is already destroyed")
        if (this.#sampler) return this.#sampler;
        else return this.#sampler = this.#createSampler()
    }
    #createSampler() {

        return new this.#device.Sampler({
            addressModeU: this.#opts.wrapMode ?? "repeat",
            addressModeV: this.#opts.wrapMode ?? "repeat",
            addressModeW: this.#opts.wrapMode ?? "repeat",
            lodMinClamp: this.#opts?.lod?.[0] ?? 0,
            lodMaxClamp: this.#opts.lod?.[1] ?? 10,
            minFilter: this.#opts.filter?.min ?? "linear",
            magFilter: this.#opts.filter?.max ?? "nearest",
            maxAnisotropy: this.#opts.maxAnisotropy ?? 4,
            mipmapFilter: this.#opts.filter?.mipmap ?? "linear"
        })
    }
}

type ARR_MAP = {
    1: [number];
    2: [number, number];
    4: [number, number, number, number];
};
export type F<NUM extends 1 | 2 | 4> = ARR_MAP[NUM];

/**A simple helper to make textures manually.
 * @example
 * texture("2d", 4,[
        [ // TWO. RED. PIXELS.
            [255,0,0,255],[255,0,0,255]
        ]
    ])
 */
export function texture<DIMENSION extends GPUTextureDimension, LEN extends 1 | 2 | 4>(dimension: DIMENSION, len: LEN, value: { "1d": F<LEN>[], "2d": [F<LEN>, F<LEN>][], "3d": [[F<LEN>, F<LEN>], [F<LEN>, F<LEN>]][] }[DIMENSION]) {
    return value.flat(3)
}
export default Texture;