import {
    DeviceControls,
    TEXTURE,
    DEVICE,
    SAMPLER
} from "@agpu/bindings";
import RANGE from "@agpu/helpers/greaterthan";
/**
 * # `Texture`
 * This class represents a Texture in AGPU.
 * 
 */
class Texture<OPTIONS extends Texture.OPTIONS = Texture.OPTIONS,ACTUALOPTIONS extends OPTIONS & Texture.OPTIONS = OPTIONS> {
    #tex: TEXTURE
    #device: DEVICE
    #opts: ACTUALOPTIONS
    constructor(dvcontrols: DeviceControls, image: ImageData | ImageBitmap, options: ACTUALOPTIONS) {
        this.#device = dvcontrols
        this.#opts = options
        this.#tex = new dvcontrols.Texture({
            format: "rgba8unorm",
            size: {
                height: image.height,
                width: image.width
            },
            dimension: options.dimension?.dimension,
            textureBindingViewDimension: options.dimension?.view ?? options.dimension?.dimension,
            viewFormats: ["rgba8unorm"],
            mipLevelCount:options.image?.mipLevel
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
    /**Returns the dimension of the texture */
    get dimension(): ACTUALOPTIONS["dimension"] {
        return this.#opts.dimension
    }
    /**Returns the wrap mode of the texture */
    get wrapMode(): ACTUALOPTIONS["wrapMode"] {
        return this.#opts.wrapMode
    }
    /**Returns the lod clamping of the texture */
    get lod():ACTUALOPTIONS["lod"] {
        return this.#opts.lod
    }
    /**Returns the filters of the texture */
    get filters():ACTUALOPTIONS["filter"]{
        return this.#opts.filter
    }
    /**Returns the max anistropy of the texture */
    get anisotropy():ACTUALOPTIONS["maxAnisotropy"]{
        return this.#opts.maxAnisotropy
    }
    /**Returns the options of the texture */
    get options():ACTUALOPTIONS{
        return this.#opts;
    }

    /**Returns the raw webgpu texture.*/
    get texture(): TEXTURE {
        return this.#tex;
    }
    #sampler?: SAMPLER
    /**Returns the raw sampler. */
    get sampler(): SAMPLER {
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

namespace Texture {
    export interface OPTIONS {
        image?: {
            flipY?: boolean,
            origin?: GPUOrigin2D,
            mipLevel?: number,
        },
        wrapMode?: GPUAddressMode,
        lod?:[number,number],
        filter?: {
            min?: GPUFilterMode,
            max?: GPUFilterMode,
            mipmap?: GPUFilterMode
        },
        dimension?: DIMENSION_OPTIONS
        maxAnisotropy?: RANGE<1, 17>
    }
    export type DIMENSION_OPTIONS = {
            dimension: "2d",
            view?: "cube-array"|"2d"|"2d-array"|"cube"
        } | {
            dimension: "1d",
            view?: "1d"
        } | {
            dimension : "3d",
            view?: "3d"
        }
    //_export type LOD<MIN extends number, MAX extends RANGE<MIN,11>> = [MIN, MAX];
    //_export type LOD<K extends number> = [K, RANGE<K, 12>]
}

type ARR_MAP = {
    1: [number];
    2: [number, number];
    3: [number, number, number];
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