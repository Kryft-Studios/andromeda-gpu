import align from "../../../helpers/align";
import defaults from "../../../helpers/defaults";
import error from "../../../helpers/errors";
import UNSURE from "../../../helpers/types/unsure";
import TEXTURE_USAGE_OPTIONS, { getOptionsFromTextureUsage, getTextureUsage } from "./texture/textureUsageOptions";
import TextureViewCreator from "./texture/textureView";

/**
 * Public texture construction options.
 */
interface TCO_BASE {
    value?: GPUAllowSharedBufferSource
    size: GPUExtent3DStrict;
    mipLevelCount?: number | undefined;
    sampleCount?: number | undefined;
    dimension?: GPUTextureDimension | undefined;
    format: GPUTextureFormat;
    viewFormats?: Iterable<GPUTextureFormat> | undefined;
    textureBindingViewDimension?: GPUTextureViewDimension | undefined;
}
export interface TEXTURE_CREATOR_OPTIONS extends TCO_BASE {
    usage?: TEXTURE_USAGE_OPTIONS | number;
}
interface TCO_UNUM extends TCO_BASE {
    usage?: number
}
interface RESOLVED_EXTENT_3D {
    width: number
    height: number
    depthOrArrayLayers: number
}
export interface BUFFER_COPY_TARGET {
    raw(): GPUBuffer
    can: {
        copy: {
            write: boolean
        }
    }
}
export interface TEXTURE_COPY_TARGET {
    raw(): GPUTexture
    can: {
        copy: {
            write: boolean
        }
    }
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
    #usage: number
    #usageChanged: boolean = false;
    constructor(device: GPUDevice, optionsOrTexture: TEXTURE_CREATOR_OPTIONS | GPUTexture) {
        this.#device = device;
        if (!isRawGPUTexture(optionsOrTexture)) {
            const { value, usage, ...gpuDescriptor } = optionsOrTexture;

            const numericUsage = this.#usage = typeof usage === "number" ? usage : typeof usage === "object" ? getTextureUsage(usage) : defaults.textureUsage;
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
            const texture = optionsOrTexture;
            this.#usageOptions = getOptionsFromTextureUsage(texture.usage)
            this.#texture = texture;
            this.#view = new TextureViewCreator(texture.createView());
            this.#options = undefined;
            this.#value = undefined;
            this.#usage = texture.usage
        }
        /**@type {GPUTextureViewDescriptor} */
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
    #recreate() {
        if (!this.#options) throw cannotRecreateRawTexture;
        this.#texture.destroy();
        this.#options = { ...this.#options, usage: this.#usage };
        this.#texture = this.#device.createTexture(this.#options as TCO_UNUM as GPUTextureDescriptor);
        this.#view = new TextureViewCreator(this.#texture.createView());
    }

    /**
     * Sync changes made.
     * 
     * ● Throws AGPU_2 if the texture was destroyed
     */
    sync(): void {
        if (this.#destroyed) throw textureAlreadyDestroyed
        if (!this.#dirty && !this.#usageChanged) return;
        if (this.#usageChanged) this.#recreate();
        if (this.#value) {
            if (!this.can.copy.write) throw cannotWriteToTexture;
            this.#write(this.#value);
        }
        this.#usageChanged = false;
        this.#dirty = false;
    }

    /**
     * Represents the raw GPUTexture
     */
    raw() { return this.#texture; }

    /**
     * Represents the raw GPUTextureView
     */
    view() { return this.#view; }

    /**
     * Copies this texture into a buffer destination.
     */
    copyToBuffer(destination: BUFFER_COPY_TARGET | GPUBuffer, options: TEXTURE_TO_BUFFER_OPTIONS = {}): void {
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
    copyToTexture(destination: TEXTURE_COPY_TARGET | GPUTexture, options: TEXTURE_TO_TEXTURE_OPTIONS = {}): void {
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

        const oldWidth = this.#texture.width;
        const oldHeight = this.#texture.height;
        const oldDepth = this.#texture.depthOrArrayLayers;

        if (newWidth === oldWidth && newHeight === oldHeight && newDepthOrArrayLayers === oldDepth) {
            return;
        }

        this.#texture.destroy();

        this.#texture = this.#device.createTexture({
            ...this.#options as TCO_UNUM as GPUTextureDescriptor,
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

        // Case 3: Texture Resurrection
        // We recreate the texture from saved options.
        if (val === false && this.#destroyed) {
            if (!this.#options) throw cannotRecreateRawTexture;
            this.#texture = this.#device.createTexture(this.#options as TCO_UNUM as GPUTextureDescriptor);
            this.#view = new TextureViewCreator(this.#texture.createView());
            this.#destroyed = false;
            if (this.#value) this.#write(this.#value);
            return false;
        }

        return this.#destroyed;
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

    /**
     * Getter/Setter for texture Usage.
     * 
     * ● Marks the texture as "**dirty**" if changed. 
     * 
     * ● If no value is passed, the function returns the current texture usage and options of the texture.
     * 
     * ● If a value is passed and the value is a number, the function returns the same texture usage passed.
     * 
     * ● If a value is passed and the value is a TEXTURE_USAGE_OPTIONS, the function returns the texture usage computed from the options.
     * 
     * ● Throws AGPU_2 if the texture was destroyed
     */
    textureUsage(): TextureCreator.bufferUsage.RETURNS;
    textureUsage<T extends number>(usage: T): T;
    textureUsage(usage: TEXTURE_USAGE_OPTIONS): number
    textureUsage<T extends number>(usage?: T | TEXTURE_USAGE_OPTIONS): number | T | TextureCreator.bufferUsage.RETURNS {
        // Case 1: The texture is already destroyed
        // In this case we throw AGPU_2

        if (this.#destroyed) throw textureAlreadyDestroyed

        // Case 2: if usage is undefined
        // Return the current texture usage
        if (typeof usage === "undefined") return { number: this.#usage, ...this.#usageOptions };

        // Case 3: if usage is defined, but is not equal to current usage
        // In that case, we change the texture usage and flag the texture dirty in order for the texture to take changes
        const nextUsage = typeof usage === "number" ? usage : getTextureUsage(usage);
        if (nextUsage !== this.#usage) {
            this.#usageChanged = true;
            this.#dirty = true;
            if (typeof usage === "number") {
                this.#usage = usage;
                this.#usageOptions = getOptionsFromTextureUsage(usage)
            } else {
                this.#usage = getTextureUsage(usage)
                this.#usageOptions = usage;
            }
        } else {
            // Case 4: If usage is defined and is equal to the current usage
            // In that case, we do nothing special
        }
        // Return the given usage back (T).
        return typeof usage === "number" ? usage : getTextureUsage(usage);
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
function isBufferCopyTarget(target: BUFFER_COPY_TARGET | GPUBuffer): target is BUFFER_COPY_TARGET {
    return typeof (target as BUFFER_COPY_TARGET).raw === "function";
}
function isRawGPUTexture(texture: TEXTURE_CREATOR_OPTIONS | GPUTexture): texture is GPUTexture {
    return typeof (texture as GPUTexture).createView === "function";
}
function isTextureCopyTarget(target: TEXTURE_COPY_TARGET | GPUTexture): target is TEXTURE_COPY_TARGET {
    return typeof (target as TEXTURE_COPY_TARGET).raw === "function";
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
