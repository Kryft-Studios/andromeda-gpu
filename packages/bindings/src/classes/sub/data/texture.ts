import align from "../../../helpers/align";
import defaults from "../../../helpers/defaults";
import error from "../../../helpers/errors";
import DC_MEMBER from "../../../helpers/types/DCMember";
import UNSURE from "../../../helpers/types/unsure";
import BufferCreator from "./buffers";
import TEXTURE_USAGE_OPTIONS, { getOptionsFromTextureUsage, getTextureUsage } from "./texture/textureUsageOptions";
import TextureViewCreator from "./texture/textureView";

/**
 * Public texture construction options.
 */
interface TCO_BASE {
    /** Initial value for the texture creator */
    value?: GPUAllowSharedBufferSource

    /**The size of the texture*/
    size: GPUExtent3DStrict;

    /**the miplevel count */
    mipLevelCount?: number | undefined;

    /**the sample count */
    sampleCount?: number | undefined;

    /**dimension, 1d, 2d or 3d */
    dimension?: GPUTextureDimension | undefined;

    /**format of the texture. */
    format: GPUTextureFormat;

    /**formats for the view of the texture. */
    viewFormats?: Iterable<GPUTextureFormat> | undefined;

    /**Texture binding view dimension*/
    textureBindingViewDimension?: GPUTextureViewDimension | undefined;
}
export interface TEXTURE_CREATOR_OPTIONS extends TCO_BASE {
    /**usage options for the texture */
    usage?: TEXTURE_USAGE_OPTIONS | number;
}
interface TCO_UNUM extends TCO_BASE,GPUTextureDescriptor {
    /**usage options for the texture */
    usage: number
}
interface RESOLVED_EXTENT_3D  extends GPUExtent3DDict {
    width: number
    height: number
    depthOrArrayLayers: number
}
export interface TEXTURE_TO_BUFFER_OPTIONS {
    offset?: number
    bytesPerRow?: number
    rowsPerImage?: number
    origin?: GPUOrigin3D
    aspect?: GPUTextureAspect
    mipLevel?: number
    size?: GPUExtent3D
}
export interface TEXTURE_TO_TEXTURE_OPTIONS {
    sourceMipLevel?: number
    destinationMipLevel?: number
    sourceOrigin?: GPUOrigin3D
    destinationOrigin?: GPUOrigin3D
    size?: GPUExtent3D
}

const TEXTURE_FORMAT_BPP: Record<string, number> = {
    // 8-bit formats (1 byte)
    'r8unorm': 1,
    'r8snorm': 1,
    'r8uint': 1,
    'r8sint': 1,

    // 16-bit formats (2 bytes)
    'r16uint': 2,
    'r16sint': 2,
    'r16float': 2,
    'rg8unorm': 2,

    // 32-bit formats (4 bytes)
    'rgba8unorm': 4,
    'rgba8unorm-srgb': 4,
    'bgra8unorm': 4,
    'rg16float': 4,
    'r32float': 4,

    // 64-bit formats (8 bytes)
    'rgba16float': 8,
    'rg32float': 8,

    // 128-bit formats (16 bytes)
    'rgba32float': 16,
};
const textureAlreadyDestroyed = error(2, "Texture already destroyed!")
const cannotWriteToTexture = error(10, "Cannot write to texture since the flag 'usage.copy.write' is false or undefined")
const cannotReadFromTexture = error(11, "Texture cannot be copied because the flag 'usage.copy.read' is false or undefined")
const otherCannotWriteToTexture = error(12, "Texture could not be copied since the other texture doesnt allow writing to it")
const otherCannotWriteToBuffer = error(13, "Texture could not be copied since the other buffer doesnt allow writing to it")
const cannotRecreateRawTexture = error(38,"Cannot recreate a raw GPUTexture because no original descriptor was stored.","Construct the texture through TextureCreator options if you need resize/resurrection support.")
const invalidTextureSize = error(39,"Texture size must be greater than zero in every dimension.","Pass width, height, and depthOrArrayLayers values of at least 1.")

/**
 * Wrapper around {@link GPUTexture} with cached usage/value helpers and
 * convenience copy operations.
 */
export class TextureCreator {
    #device: GPUDevice;
    #texture: GPUTexture;
    #view: TextureViewCreator;
    #options: TEXTURE_CREATOR_OPTIONS | undefined
    #value?: GPUAllowSharedBufferSource
    #destroyed: boolean = false;
    #usageOptions: TEXTURE_USAGE_OPTIONS
    constructor(device: GPUDevice, optionsOrTexture: TEXTURE_CREATOR_OPTIONS | GPUTexture) {
        this.#device = device;
        if (!(typeof (optionsOrTexture as GPUTexture).createView === "function")) {
            optionsOrTexture = optionsOrTexture as TEXTURE_CREATOR_OPTIONS;
            const { value, usage, ...gpuDescriptor } = optionsOrTexture;

            const numericUsage = typeof usage === "number" ? usage : typeof usage === "object" ? getTextureUsage(usage) : defaults.textureUsage;
            this.#usageOptions = getOptionsFromTextureUsage(numericUsage);
            const resolvedSize = normalizeExtent3D(optionsOrTexture.size);
            if(resolvedSize.width<=0||resolvedSize.height<=0||resolvedSize.depthOrArrayLayers<=0)throw invalidTextureSize;

            // Store a clean descriptor for resurrection
            this.#options = { ...optionsOrTexture, usage: numericUsage };

            this.#texture = device.createTexture({
                ...gpuDescriptor,
                usage: numericUsage
            });

            // Create the view automatically
            this.#view = new TextureViewCreator(this.#texture.createView());

            // If value is provided, upload it properly
            if (value) {
                this.value(value);
                this.#value = value
            }
        } else {
            // It's a raw GPUTexture
            const texture = optionsOrTexture as GPUTexture;
            this.#usageOptions = getOptionsFromTextureUsage(texture.usage)
            this.#texture = texture;
            this.#view = new TextureViewCreator(texture.createView());
            this.#options = undefined;
            this.#value = undefined;
        }

        const self = this;
        this.View = class extends TextureViewCreator {
            /**
             * **NOTE:** Options are inherited
             * 
             * https://developer.mozilla.org/en-US/docs/Web/API/GPUTexture/createView
             */
            constructor(){
                // for now  we will not add options
                // the options are inherited https://developer.mozilla.org/en-US/docs/Web/API/GPUTexture/createView
                super(self.#texture.createView())
            }
        }
    }
    readonly View
    #dirty = false;
    /**
     * Getter/Setter for the texture data.
     * 
     * ● If a value is passed, It marks the texture dirty and returns the given value again.
     * 
     * ● If no value is passed, It returns the current texture value.
     * 
     * ● Throws AGPU_2 if the texture was destroyed
     */
    value(): GPUAllowSharedBufferSource | undefined;
    value<T extends GPUAllowSharedBufferSource>(data: T): T;
    value<T extends GPUAllowSharedBufferSource>(data?: T): T | GPUAllowSharedBufferSource | undefined {
        if (this.#destroyed) throw textureAlreadyDestroyed
        if (typeof data === "undefined") return this.#value;
        if (!this.can.copy.write) throw cannotWriteToTexture
        if (data !== this.#value) {
            this.#value = data;
            this.#dirty = true;
        }
        return data;
    }
    /**
     * Returns a capability summary inferred from the current texture usage flags.
     */
    get can() {
        const usage = this.#usageOptions;
        const copy = usage.copy;
        const binding = usage.binding;
        return {
            copy: {
                read: copy !== false && (copy === true || !!copy?.read),
                write: copy !== false && (copy === true || !!copy?.write),
            },
            binding: {
                texture: !!binding?.texture,
                storage: !!binding?.storage,
            },
            renderAttachment: !!usage.renderAttachment,
        };
    }
    #write(data: GPUAllowSharedBufferSource) {
        const format = this.#texture.format;
        const bpp = TEXTURE_FORMAT_BPP[format] ?? 4;

        const unalignedBytesPerRow = this.#texture.width * bpp;

        const bytesPerRow = align(unalignedBytesPerRow, 256);

        this.#device.queue.writeTexture(
            { texture: this.#texture },
            data,
            {
                bytesPerRow: bytesPerRow,
                rowsPerImage: this.#texture.height,
            },
            {
                width: this.#texture.width,
                height: this.#texture.height,
                depthOrArrayLayers: this.#texture.depthOrArrayLayers,
            }
        );
    }

    /**
     * Sync changes made.
     * 
     * ● Throws AGPU_2 if the texture was destroyed
     */
    sync(): void {
        if (this.#destroyed) throw textureAlreadyDestroyed
        if (!this.#dirty) return;
        if (this.#value) {
            if (!this.can.copy.write) throw cannotWriteToTexture;
            this.#write(this.#value);
        }
        this.#dirty = false;
    }

    /**
     * Represents the raw GPUTexture
     */
    raw() { return this.#texture; }
    /**
     * Recreates this texture from its cached descriptor and optionally copies the
     * cached CPU-side value if one is present.
     */
    clone(): TextureCreator {
        if (this.#destroyed) throw textureAlreadyDestroyed;
        if (!this.#options) throw cannotRecreateRawTexture;
        const { value: _value, ...options } = this.#options;
        const clone = new TextureCreator(this.#device, {
            ...options,
            value: this.#value ? cloneBufferSource(this.#value) : undefined,
        });
        if (this.#texture.label) clone.label(this.#texture.label);
        return clone;
    }

    /**
     * Represents the raw GPUTextureView
     */
    view() { return this.#view; }

    /**
     * Copies this texture into a buffer destination.
     */
    copyToBuffer(destination: BufferCreator | DC_MEMBER<"Buffer"> | GPUBuffer, options: TEXTURE_TO_BUFFER_OPTIONS = {}): void {
        if (this.#destroyed) throw textureAlreadyDestroyed;
        if (!this.can.copy.read) throw cannotReadFromTexture;
        if (this.#dirty) this.sync();

        if (isBufferCopyTarget(destination)) {
            if (!destination.can.copy.write) throw otherCannotWriteToBuffer;
        } else {
            const destinationOptions = getBufferCopyOptions(destination);
            if (!destinationOptions.write) throw otherCannotWriteToBuffer;
        }

        const textureCopySize = getTextureCopySize(this.#texture, options.mipLevel, options.size);
        const bytesPerRow = options.bytesPerRow ?? align(textureCopySize.width * getTextureBytesPerPixel(this.#texture.format), 256);
        const rowsPerImage = options.rowsPerImage ?? textureCopySize.height;
        const rawDestination = isBufferCopyTarget(destination) ? destination.raw() : destination;

        const encoder = this.#device.createCommandEncoder();
        encoder.copyTextureToBuffer(
            {
                texture: this.#texture,
                origin: options.origin,
                aspect: options.aspect,
                mipLevel: options.mipLevel,
            },
            {
                buffer: rawDestination,
                offset: options.offset,
                bytesPerRow,
                rowsPerImage,
            },
            textureCopySize
        );
        this.#device.queue.submit([encoder.finish()]);
    }

    /**
     * Copies this texture into another texture destination.
     */
    copyToTexture(destination: TextureCreator | DC_MEMBER<"Texture"> | GPUTexture, options: TEXTURE_TO_TEXTURE_OPTIONS = {}): void {
        if (this.#destroyed) throw textureAlreadyDestroyed;
        if (!this.can.copy.read) throw cannotReadFromTexture;
        if (this.#dirty) this.sync();

        if (isTextureCopyTarget(destination)) {
            if (!destination.can.copy.write) throw otherCannotWriteToTexture;
        } else {
            const destinationOptions = getOptionsFromTextureUsage(destination.usage);
            const destinationCanWrite = destinationOptions.copy !== false && (destinationOptions.copy === true || !!destinationOptions.copy?.write);
            if (!destinationCanWrite) throw otherCannotWriteToTexture;
        }

        const rawDestination = isTextureCopyTarget(destination) ? destination.raw() : destination;
        const textureCopySize = getTextureCopySize(this.#texture, options.sourceMipLevel, options.size);

        const encoder = this.#device.createCommandEncoder();
        encoder.copyTextureToTexture(
            {
                texture: this.#texture,
                mipLevel: options.sourceMipLevel,
                origin: options.sourceOrigin,
            },
            {
                texture: rawDestination,
                mipLevel: options.destinationMipLevel,
                origin: options.destinationOrigin,
            },
            textureCopySize
        );
        this.#device.queue.submit([encoder.finish()]);
    }

    /**
     * Returns the aspect ratio of the width and height of the texture
     */
    aspect(): number {
        if (this.#destroyed) throw textureAlreadyDestroyed
        return this.#texture.width / this.#texture.height;
    }

    /**
     * Resizes the given texture. 
     * 
     * ● Throws AGPU_2 if the texture was already destroyed
     * 
     * ● Recreates texture and therefore expensive
     */
    resize(newWidth: number, newHeight: number, newDepthOrArrayLayers: number = this.#texture.depthOrArrayLayers) {
        if (this.#destroyed) throw textureAlreadyDestroyed;
        if (!this.#options) throw cannotRecreateRawTexture;
        if (newWidth <= 0 || newHeight <= 0 || newDepthOrArrayLayers <= 0) throw invalidTextureSize;

        if (newWidth === this.#texture.width && newHeight === this.#texture.height && newDepthOrArrayLayers === this.#texture.depthOrArrayLayers) {
            return;
        }
        
        this.#texture.destroy();
        
        this.#texture = this.#device.createTexture({
            ...this.#options as TCO_UNUM,
            size: [newWidth, newHeight, newDepthOrArrayLayers],
        });

        this.#view = new TextureViewCreator(this.#texture.createView());

        if (this.#value) {
            this.#dirty = true;
            this.sync();
        }
    }

    /**
     * Getter / Setter for destruction state.
     */
    destroy(): boolean;
    destroy<T extends boolean>(val: T): T;
    destroy<T extends boolean>(val?: T): T | boolean {
        // Case 1: Getter mode
        if (typeof val === "undefined") return this.#destroyed;

        // Case 2: Requesting destruction
        if (val === true && !this.#destroyed) {
            this.#texture.destroy();
            this.#destroyed = true;
            return true;
        }

        // Case 3: Texture Resurrection [DEPRECATED]
        if (val === false && this.#destroyed) {
            throw error(22,"You can not resurrect a texture. This feature is deprecated")
            /*if (!this.#options) throw cannotRecreateRawTexture;
            this.#texture = this.#device.createTexture(this.#options as TCO_UNUM as GPUTextureDescriptor);
            this.#view = new TextureViewCreator(this.#texture.createView());
            this.#destroyed = false;
            if (this.#value) this.#write(this.#value);
            return false;*/
        }

        return this.#destroyed = val;
    }

    /**
     * Getter/Setter for label.
     * 
     * ● If no value is passed, the function returns the current label of the texture.
     * 
     * ● If a value is passed, the function returns the same label passed.
     * 
     * ● Throws AGPU_2 if the texture was destroyed
     */
    label(): UNSURE<string>
    label<T extends string>(label: T): T
    label<T extends string>(label?: T): T | UNSURE<string> {
        if (this.#destroyed) throw textureAlreadyDestroyed
        if (typeof label === "undefined") return (this.#options as TCO_UNUM as GPUTextureDescriptor)?.label;
        return this.#texture.label = label;
    }
    [Symbol.hasInstance](instance: TextureCreator): instance is TextureCreator {
        return instance.__brand === "TextureCreator"
    }
    readonly __brand = "TextureCreator"
}
export namespace TextureCreator {
    export namespace bufferUsage {
        /**
         * Shape returned by `textureUsage()` in getter mode.
         */
        export interface RETURNS extends TEXTURE_USAGE_OPTIONS {
            number?: number
        }
    }
}

export default TextureCreator

function getTextureBytesPerPixel(format: GPUTextureFormat): number {
    return TEXTURE_FORMAT_BPP[format] ?? 4;
}
function getTextureCopySize(texture: GPUTexture, mipLevel: number | undefined, size?: GPUExtent3D): RESOLVED_EXTENT_3D {
    if (size) return normalizeExtent3D(size);

    const resolvedMipLevel = mipLevel ?? 0;
    return {
        width: Math.max(1, texture.width >> resolvedMipLevel),
        height: Math.max(1, texture.height >> resolvedMipLevel),
        depthOrArrayLayers: texture.depthOrArrayLayers,
    };
}
function isBufferCopyTarget(target: BufferCreator | GPUBuffer): target is BufferCreator {
    return typeof (target as BufferCreator).raw === "function";
}
function isTextureCopyTarget(target: TextureCreator | GPUTexture): target is  TextureCreator {
    return typeof (target as  TextureCreator).raw === "function";
}
function getBufferCopyOptions(buffer: GPUBuffer) {
    return {
        write: !!(buffer.usage & GPUBufferUsage.COPY_DST),
    };
}
function normalizeExtent3D(size: GPUExtent3D): RESOLVED_EXTENT_3D {
    if (typeof size === "number") {
        return {
            width: size,
            height: 1,
            depthOrArrayLayers: 1,
        };
    }

    if (Symbol.iterator in Object(size)) {
        const values = Array.from(size as Iterable<number>);
        return {
            width: values[0] ?? 1,
            height: values[1] ?? 1,
            depthOrArrayLayers: values[2] ?? 1,
        };
    }

    const sizeObject = size as {
        width: number
        height?: number
        depthOrArrayLayers?: number
    };
    return {
        width: sizeObject.width,
        height: sizeObject.height ?? 1,
        depthOrArrayLayers: sizeObject.depthOrArrayLayers ?? 1,
    };
}
function cloneBufferSource(value: GPUAllowSharedBufferSource): GPUAllowSharedBufferSource {
    if (value instanceof ArrayBuffer) return value.slice(0);
    if (ArrayBuffer.isView(value)) {
        const clonedBuffer = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
        const view = value as ArrayBufferView;
        const ctor = view.constructor as {
            new(buffer: ArrayBufferLike, byteOffset?: number, length?: number): typeof value
            BYTES_PER_ELEMENT?: number
        };
        if (view instanceof DataView) return new DataView(clonedBuffer);
        const bytesPerElement = ctor.BYTES_PER_ELEMENT ?? 1;
        return new ctor(clonedBuffer, 0, value.byteLength / bytesPerElement);
    }
    return value.slice(0);
}
