import defaults from "../../../helpers/defaults"
import align from "../../../helpers/align";
import error from "../../../helpers/errors";
import UNSURE from "../../../helpers/types/unsure";
import BUFFER_USAGE_OPTIONS, { getOptionsFromUsage } from "./buffers/bufferUsageOptions";
import { getOptionsFromTextureUsage } from "./texture/textureUsageOptions";
import { getBufferUsage } from "./buffers/bufferUsageOptions";

/**
 * Construction options for {@link BufferCreator}.
 */
export interface BUFFER_CONSTRUCTION_OPTIONS extends GPUObjectDescriptorBase {

    /**
     * The initial value of the Buffer
     * 
     * Using this requires usage.copy.write to be true
     * 
     * If this is passed but copy.write is false or undefined, the constructor throws a error.
     * @example
     * 
     * // Float 32 array
     * Float32Array
     * 
     * // Float 16 Array
     * Float16Array
     * 
     * // 64 bit unsigned integer array
     * BigUint64Array
     */
    value?: GPUAllowSharedBufferSource,

    /**
     * The GPUBufferUsage of the Buffer.
     * 
     * @example
     * BufferUsage.VERTEX | BufferUsage.COPY_DST
     */
    usage?: BUFFER_USAGE_OPTIONS | number,
}
export const bufferDestroyedError = error(1, "The buffer is already destroyed!")
export const cannotBeRead = error(3, "Buffer cannot be read")
export const initCannotRead = error(4, "Buffer could not be initialized since the given buffer cannot be read")
export const initCouldNotAssignValue = error(5, "Buffer could not be initialized since the flag 'usage.copy.write' is false or undefined")
export const couldNotAssignValue = error(6, "Buffer.value didnt work as the flag 'usage.copy.write' is set to false.")
export const cannotBeWrittenTo = error(7, "Buffer could not be copied because the flag 'usage.copy.write' is disabled in it")
export const otherCannotBeWrittenTo = error(8, "Buffer could not be copied since the other buffer doesnt allow so.")
export const otherTextureCannotBeWrittenTo = error(10, "Buffer could not be copied since the other texture doesnt allow writing to it")
export const invalidBufferSize = error(36, "Buffer size must be greater than zero.","Provide a non-empty typed array or other GPUAllowSharedBufferSource when creating the buffer.")
export const invalidBufferCopySize = error(37, "Buffer copy size must be greater than zero and fit in both source and destination buffers.","Pass a positive copy size that does not exceed either buffer's size.")

/**
 * Minimal texture surface accepted by {@link BufferCreator.copyToTexture}.
 */
export interface TEXTURE_COPY_DESTINATION {
    raw(): GPUTexture
    can: {
        copy: {
            write: boolean
        }
    }
}
interface RESOLVED_EXTENT_3D {
    width: number
    height: number
    depthOrArrayLayers: number
}
export interface BUFFER_TO_TEXTURE_OPTIONS {
    offset?: number
    bytesPerRow?: number
    rowsPerImage?: number
    origin?: GPUOrigin3D
    mipLevel?: number
    aspect?: GPUTextureAspect
    size?: GPUExtent3D
}
const TEXTURE_FORMAT_BPP: Record<string, number> = {
    'r8unorm': 1,
    'r8snorm': 1,
    'r8uint': 1,
    'r8sint': 1,
    'r16uint': 2,
    'r16sint': 2,
    'r16float': 2,
    'rg8unorm': 2,
    'rgba8unorm': 4,
    'rgba8unorm-srgb': 4,
    'bgra8unorm': 4,
    'rg16float': 4,
    'r32float': 4,
    'rgba16float': 8,
    'rg32float': 8,
    'rgba32float': 16,
};
/**@type {GPUBuffer} */
/**
 * Wrapper around {@link GPUBuffer} with cached CPU-side state and convenience
 * copy helpers.
 */
export class BufferCreator {
    #currentBuffer: GPUBuffer;
    #device: GPUDevice;
    #value: GPUAllowSharedBufferSource;
    #bufferUsage: number;
    #dirty: boolean = false;
    #destroyed: boolean = false;
    #usageChanged: boolean = false;
    #label?: string
    #readComplete: boolean
    #onReadCompleteQueues: (Function)[] = []
    #usageOptions: BUFFER_USAGE_OPTIONS
    constructor(device: GPUDevice, options?: BUFFER_CONSTRUCTION_OPTIONS) {
        if ((options as BUFFER_CONSTRUCTION_OPTIONS)?.value) {
            if (!((options?.usage as BUFFER_USAGE_OPTIONS).copy as { write: boolean })) throw initCouldNotAssignValue;
        }
        this.#device = device;
        this.#usageOptions = typeof options?.usage === "object" ? options.usage : typeof options?.usage === "number" ? getOptionsFromUsage(options.usage) : {}
        this.#label = options?.label
        this.#value = options?.value ?? new Float32Array(16);
        this.#bufferUsage = typeof options?.usage === "object" ? getBufferUsage(options?.usage) : typeof options?.usage === "number" ? options?.usage : defaults.bufferUsage;
        // create the buffer.
        this.#currentBuffer = createBuffer(
            device,
            this.#value,
            this.#bufferUsage,
            this.#label,
        );

        this.#device.queue.writeBuffer(this.#currentBuffer, 0, this.#value);
        if(!this.#checkFlags())throw error(18,"Buffer flag validation error")
        this.#readComplete = true;
    }
    #checkFlags(): boolean {
        const garbagecan = this.can; // garbage can 🔥🔥🔥🔥
        const value = this.#value;
        const size = value.byteLength;

        if (garbagecan.beBoundAs.index) {
            if (!(value instanceof Uint32Array) && !(value instanceof Uint16Array)) return false;
        }

        if (garbagecan.beBoundAs.indirect) {
            if (!(value instanceof Uint32Array)) return false;
        }

        if (garbagecan.beBoundAs.vertex) {
            if (size % 4 !== 0) return false;
        }

        if (garbagecan.beBoundAs.uniform) {
            if (size % 16 !== 0) return false;
            if (size > 65536) return false;
        }

        if (garbagecan.beBoundAs.storage) {
            if (size % 4 !== 0) return false;
        }

        return true;
    }
    /**
     * Returns the raw GPUBuffer of the Buffer.
     * 
     * Changing this may cause issues
     */
    raw() {
        // return the raw GPUBuffer
        return this.#currentBuffer;
    }
    [Symbol("Symbol.disposable")]() {
        this.destroy(true)
    }

    /**
     * Getter / Setter for destroying the buffer
     * 
     * ● If no value is passed, it returns if the buffer is destroyed
     * 
     * ● If the buffer is destroyed and destroy parameter is true, then it returns true
     * 
     * ● If the buffer is not destroyed but destroy parameter is true, then it returns true and destroys the buffer
     * 
     * ● If the buffer is not destroyed and destroy parameter is false, then it returns false
     * 
     * ● If the buffer is destroyed and destroy parameter is true, then it recreates the buffer and returns true
     */
    destroy(): boolean
    destroy<T extends boolean>(destroy: T): T
    destroy<T extends boolean>(destroy?: T): T | boolean {
        // Case 1: If destroy is undefined
        // In that case we return #destroyed
        if (typeof destroy === "undefined") return this.#destroyed;

        // Case 2: If the buffer is destroyed and destroy is true
        // In that case we return true
        if (this.#destroyed && destroy) return true;

        // Case 3: If the buffer is not destroyed and destroy is true
        // In that case we destroy the buffer, set #destroyed to true and return true
        if (!this.#destroyed && destroy) {
            this.#destroyed = true;
            this.#currentBuffer.destroy()
            return true;
        }

        // Case 4: If the buffer is not destroyed and destroy is false
        // In this case we return false 
        if (!this.#destroyed && !destroy) return false;

        // Case 5: If the buffer is destroyed and destroy is false
        // In this case, We recreate the buffer and write it. Then we set #destroyed to true
        if (this.#destroyed && !destroy) {
            this.#currentBuffer = createBuffer(this.#device, this.#value, this.#bufferUsage, this.#label)
            this.#device.queue.writeBuffer(this.#currentBuffer, 0, this.#value);
            this.#destroyed = false;
            return false;
        }

        return this.#destroyed;
    }
    /**
     * Getter/Setter for Buffer Usage.
     * 
     * ● Marks the buffer as "**dirty**" if changed. 
     * 
     * ● If no value is passed, the function returns the current buffer usage and options of the buffer.
     * 
     * ● If a value is passed and the value is a number, the function returns the same buffer usage passed.
     * 
     * ● If a value is passed and the value is a BUFFER_USAGE_OPTIONS, the function returns the buffer usage computed from the options.
     * 
     * ● Throws AGPU_1 if the buffer was destroyed
     */
    bufferUsage(): BufferCreator.bufferUsage.RETURNS
    bufferUsage<T extends number>(usage: T): T;
    bufferUsage(usage: BUFFER_USAGE_OPTIONS): number
    bufferUsage<T extends number>(usage?: T | BUFFER_USAGE_OPTIONS): number | T | BufferCreator.bufferUsage.RETURNS {
        // Case 1: The buffer is already destroyed
        // In this case we throw AGPU_1
        if (this.#destroyed) throw bufferDestroyedError

        // Case 2: if usage is undefined
        // Return the current buffer usage
        if (typeof usage === "undefined") return { number: this.#bufferUsage, ...this.#usageOptions };

        // Case 3: if usage is defined, but is not equal to current usage
        // In that case, we change the buffer usage and flag the buffer dirty in order for the buffer to take changes
        if (usage !== this.#bufferUsage) {
            this.#usageChanged = true;
            this.#dirty = true;
            if (typeof usage === "number") {
                this.#bufferUsage = usage;
                this.#usageOptions = getOptionsFromUsage(usage)
            } else {
                this.#bufferUsage = getBufferUsage(usage)
                this.#usageOptions = usage;
            }
        } else {
            // Case 4: If usage is defined and is equal to the current usage
            // In that case, we do nothing special
        }
        // Return the given usage back (T).
        return typeof usage === "number" ? usage : getBufferUsage(usage);
    }

    /**
     * Getter/Setter for Value.
     * 
     * ● Marks the buffer as "**dirty**" if changed.
     * 
     * ● If no value is passed, the function returns a promise that resolves to the current value of the buffer.
     * 
     * ● If a value is passed, the function returns the same value passed.
     * 
     * ● Throws AGPU_1 if the buffer was destroyed
     */
    value(): UNSURE<GPUAllowSharedBufferSource>;
    value<T extends GPUAllowSharedBufferSource>(val: T): T;
    value<T extends GPUAllowSharedBufferSource>(val?: T): T | UNSURE<GPUAllowSharedBufferSource> {
        // Case 1: The buffer is already destroyed
        // In this case we throw AGPU_1
        if (this.#destroyed) throw bufferDestroyedError

        // Case 2: If value is undefined (getter)
        // In this case, we return the current value of the buffer
        if (typeof val === "undefined") {
            return this.#value;
        }
        // Case 3: If value is defined but is not equal to the current value
        // In this case, we change the stored value and mark the buffer dirty
        if (val !== this.#value) {
            this.#value = val;
            this.#dirty = true;
        } else {
            // Case 4: If value is defined and is equal to the current value
            // In this case, we do nothing special.
        }

        // Return the given value back (T)
        return val;
    }

    /**
     * Getter/Setter for label.
     * 
     * ● If no value is passed, the function returns the current label of the buffer.
     * 
     * ● If a value is passed, the function returns the same label passed.
     * 
     * ● Throws AGPU_1 if the buffer was destroyed
     */
    label(): string
    label<T extends string>(label: T): T
    label<T extends string>(label?: T): T | string {
        // Case 1: The buffer is already destroyed
        // In this case we throw AGPU_1
        if (this.#destroyed) throw bufferDestroyedError

        // Case 2: If label is undefined
        // In that case we just return the current label
        if (typeof label === "undefined") return this.#label ?? this.#currentBuffer.label;

        // Case 3: If label is defined but is not equal to the current label.
        // In that case we change the value and change the "label" property of the buffer
        if (label !== this.#label) {
            this.#label = label;
            this.#currentBuffer.label = label;
        } else {
            // Case 4: If label is defined and is equal to the current label
            // In that case we do nothing special
        }

        // Finally, return the given label back (T)
        return label;
    }

    /**
     * Synchronizes local state with GPU hardware.
     * 
     * ● Only runs if #dirty is true. That means if any changes were made.
     * 
     * ● Throws AGPU_1 if the buffer was destroyed
     */
    sync(): void {
    if (this.#destroyed) throw bufferDestroyedError;
    if (!this.#dirty) return;

    const currentSize = this.#currentBuffer.size;
    const newSize = this.#value.byteLength;
    const usageChanged = this.#usageChanged;
    if (newSize > currentSize || usageChanged) {
        this.#currentBuffer.destroy();
        this.#currentBuffer = createBuffer(
            this.#device,
            this.#value,
            this.#bufferUsage,
            this.#label
        );
    }
    if (!this.can.copy.write) throw couldNotAssignValue;
    this.#device.queue.writeBuffer(this.#currentBuffer, 0, this.#value);

    this.#usageChanged = false;
    this.#dirty = false;
}


    /**
     * Reads the buffer.
     * 
     * #### Different from .value(newValue). How?
     * This is different from .value as it reads the value from the GPU instead of relying on what's stored  in this class
     * 
     * ● This does not update the stored value though! You will have to manually change that.
     */
    async read(): Promise<ArrayBuffer> {
        if (!this.can.map.read) throw cannotBeRead;
        const staging = this.#device.createBuffer({
            size: this.#currentBuffer.size,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        const encoder = this.#device.createCommandEncoder();
        encoder.copyBufferToBuffer(
            this.#currentBuffer, 0,
            staging, 0,
            this.#currentBuffer.size
        );
        this.#device.queue.submit([encoder.finish()]);

        await staging.mapAsync(GPUMapMode.READ);
        const data = staging.getMappedRange().slice()
        
        staging.unmap();
        staging.destroy();

        return data;
    }
    async #ensureReady(): Promise<void> {
        if (this.#readComplete) return;
        return new Promise((resolve) => {
            this.#onReadCompleteQueues.push(() => resolve());
        });
    }
    /**
     * Returns a capability summary inferred from the current buffer usage flags.
     */
    get can() {
        return {
            copy: {
                read: !!(this.#bufferUsage & GPUBufferUsage.COPY_SRC),
                write: !!(this.#bufferUsage & GPUBufferUsage.COPY_DST),
            },
            map: {
                read: !!(this.#bufferUsage & GPUBufferUsage.MAP_READ),
                write: !!(this.#bufferUsage & GPUBufferUsage.MAP_WRITE),
            },
            beBoundAs: {
                index: !!(this.#bufferUsage & GPUBufferUsage.INDEX),
                vertex: !!(this.#bufferUsage & GPUBufferUsage.VERTEX),
                uniform: !!(this.#bufferUsage & GPUBufferUsage.UNIFORM),
                storage: !!(this.#bufferUsage & GPUBufferUsage.STORAGE),
                indirect: !!(this.#bufferUsage & GPUBufferUsage.INDIRECT)
            },
            query: !!(this.#bufferUsage & GPUBufferUsage.QUERY_RESOLVE)
        };

    }
    /**
     * Copies this buffer's data to another BufferCreator or GPUBuffer.
     */
    copyToBuffer(destination: BufferCreator | GPUBuffer, size?: number): void {
        if (this.#dirty) this.sync();

        if (!this.can.copy.read) throw cannotBeRead;

        if (destination instanceof BufferCreator) {
            if (!destination.can.copy.write) throw otherCannotBeWrittenTo;
        } else {
            const destOptions = getOptionsFromUsage(destination.usage);
            if (!(destOptions.copy as { write: boolean })?.write) throw otherCannotBeWrittenTo;
        }

        const destRaw = destination instanceof BufferCreator ? destination.raw() : destination;
        const copySize = size ?? this.#currentBuffer.size;
        if(copySize<=0||copySize>this.#currentBuffer.size||copySize>destRaw.size)throw invalidBufferCopySize;

        const encoder = this.#device.createCommandEncoder();

        encoder.copyBufferToBuffer(this.#currentBuffer, 0, destRaw, 0, copySize);
        this.#device.queue.submit([encoder.finish()]);
    }
    copyToTexture(destination: TEXTURE_COPY_DESTINATION | GPUTexture, options: BUFFER_TO_TEXTURE_OPTIONS = {}): void {
        if (this.#dirty) this.sync();
        if (!this.can.copy.read) throw cannotBeRead;

        if (isTextureCopyDestination(destination)) {
            if (!destination.can.copy.write) throw otherTextureCannotBeWrittenTo;
        } else {
            const destinationOptions = getOptionsFromTextureUsage(destination.usage);
            const destinationCanWrite = destinationOptions.copy !== false && (destinationOptions.copy === true || !!destinationOptions.copy?.write);
            if (!destinationCanWrite) throw otherTextureCannotBeWrittenTo;
        }

        const rawDestination = isTextureCopyDestination(destination) ? destination.raw() : destination;
        const copySize = options.size ? normalizeExtent3D(options.size) : {
            width: rawDestination.width,
            height: rawDestination.height,
            depthOrArrayLayers: rawDestination.depthOrArrayLayers,
        };
        const bytesPerRow = options.bytesPerRow ?? align(copySize.width * getTextureBytesPerPixel(rawDestination.format), 256);
        const rowsPerImage = options.rowsPerImage ?? copySize.height;

        const encoder = this.#device.createCommandEncoder();
        encoder.copyBufferToTexture(
            {
                buffer: this.#currentBuffer,
                offset: options.offset,
                bytesPerRow,
                rowsPerImage,
            },
            {
                texture: rawDestination,
                origin: options.origin,
                mipLevel: options.mipLevel,
                aspect: options.aspect,
            },
            copySize
        );
        this.#device.queue.submit([encoder.finish()]);
    }
    /**
     * Resolves a QuerySet into this buffer.
     * Requires the buffer to have the 'queryResolve' usage flag.
     */
    query(querySet: GPUQuerySet, firstQuery: number = 0, queryCount: number = 1, destinationOffset: number = 0): void {

        if (!this.can.query) {
            throw error(9, "The given buffer does not support GPUBufferUsage.QUERY_RESOLVE");
        }

        const encoder = this.#device.createCommandEncoder();
        encoder.resolveQuerySet(
            querySet,
            firstQuery,
            queryCount,
            this.#currentBuffer,
            destinationOffset
        );
        this.#device.queue.submit([encoder.finish()]);

        this.#dirty = true;
    }
    [Symbol.hasInstance](instance: BufferCreator): instance is BufferCreator {
        return this.__brand === "BufferCreator"
    }
    readonly __brand = "BufferCreator"
}
export namespace BufferCreator {
    export namespace bufferUsage {
        /**
         * Shape returned by `bufferUsage()` in getter mode.
         */
        export interface RETURNS extends BUFFER_USAGE_OPTIONS {
            number: number
        }
    }
}
export default BufferCreator
function createBuffer(
    device: GPUDevice,
    buf: GPUAllowSharedBufferSource,
    usage: number,
    label?: string,
) {
    if(buf.byteLength<=0)throw invalidBufferSize;

    let descriptor: GPUBufferDescriptor = {
        size: buf.byteLength,
        usage,
        label
    }
    if (label) descriptor.label = label;
    return device.createBuffer(descriptor)
}
function isTextureCopyDestination(destination: TEXTURE_COPY_DESTINATION | GPUTexture): destination is TEXTURE_COPY_DESTINATION {
    return typeof (destination as TEXTURE_COPY_DESTINATION).raw === "function";
}
function getTextureBytesPerPixel(format: GPUTextureFormat): number {
    return TEXTURE_FORMAT_BPP[format] ?? 4;
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
