import error from "../../helpers/errors";

type TYPED_ARRAY_CONSTRUCTOR<T> = { new(buffer: ArrayBufferLike, byteOffset?: number, length?: number): T };

/**
 * A easy-to-use wrapper for WebGL2 Buffers.
 * Offers async support for almost all functions.
 */
export class Buffer {
    #buf: WebGLBuffer
    constructor(gl: WebGL2RenderingContext, options: Buffer.OPTIONS = {}) {

        this.#options = options;
        this.#gl = gl;
        this.#buf = gl.createBuffer()
        this.#cachedValue = options.value ?? new Float32Array(16)
        this.bind()
        this.#dusage = Buffer.bufferDrawUsageLookup[options?.usage?.draw || "static"];
        this.#vusage = Buffer.bufferValueUsageLookup[options?.usage?.value || "array"];
        gl.bufferData(this.#vusage, this.#cachedValue, this.#dusage)
        this.#count = this.#cachedValue.length
    }
    #dusage: typeof Buffer.bufferDrawUsageLookup[Buffer.DRAW_USAGE]
    #vusage: typeof Buffer.bufferValueUsageLookup[Buffer.VALUE_USAGE]
    #gl: WebGL2RenderingContext
    #options: Buffer.OPTIONS
    #cachedValue: Buffer.FORMAT
    #dirty: boolean = false;
    #count: number = 0;
    [Symbol.dispose](){
        this.delete()
    }
    
    /**
     * Returns the RAW webgl buffer of the Buffer
     */
    raw() {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        return this.#buf
    }

    /**
     * Returns the count of elements in the cached value
     */
    count() {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        return this.#count
    }

    /**
     * Set or get the value of the buffer.
     * 
     * This marks the buffer dirty. You will need to .sync it for it to take changes.
     */
    value(): Buffer.FORMAT
    value<T extends Buffer.FORMAT>(val: T): T
    value<T extends Buffer.FORMAT>(val?: T): T | Buffer.FORMAT {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        if (typeof val === "undefined") return this.#cachedValue;
        this.#dirty = true;
        this.#cachedValue = val
        return val;
    }

    /**
     * Sync the value of the buffer synchronously.
     * 
     * Does not update the buffer if the dirty flag is false.
     */
    sync = Object.assign(() => {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        if (!this.#dirty) return;
        this.bind()
        this.#gl.bufferData(this.#vusage, this.#cachedValue, this.#dusage)
        return;
    }, {
        /**
         * Sync the value of the buffer asynchronously.
         * 
         * Does not update the buffer if the dirty flag is false.
         */
        async: async () => {
            if(this.#deleted)throw error(5,"Buffer is already deleted!");
            if (!this.#dirty) return;
            const sync = this.#gl.fenceSync(this.#gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
            this.#gl.flush();
            await this.#waitForSync(sync);
            this.bind();
            this.#gl.bufferData(this.#vusage, this.#cachedValue, this.#dusage);
            this.#dirty = false;
        },
        /**
         * Sub-sync the value of the buffer synchronously.
         * 
         * Does not update the buffer if the dirty flag is false.
         * 
         * It updates the part of the buffer specified
         */
        subSync: Object.assign((offset: number = 0, length?: number) => {
if(this.#deleted)throw error(5,"Buffer is already deleted!");
            if (!this.#dirty) return;

            this.bind();

            const dataToUpload = length
                ? this.#cachedValue.constructor(this.#cachedValue.buffer, offset, length)
                : this.#cachedValue;

            this.#gl.bufferSubData(this.#vusage, offset, dataToUpload);
            this.#dirty = false;
            return;
        }, {
            /**
             * Sub-sync the value of the buffer asynchronously.
             * 
             * Does not update the buffer if the dirty flag is false.
             * 
             * It updates the part of the buffer specified
             */
            async: async (offset: number, length?: number) => {
                if(this.#deleted)throw error(5,"Buffer is already deleted!");
                if (!this.#dirty) return;
                const sync = this.#gl.fenceSync(this.#gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
                this.#gl.flush();
                await this.#waitForSync(sync);
                this.bind();

                const dataToUpload = length
                    ? new (this.#cachedValue.constructor as any)(this.#cachedValue.buffer, offset * (((this.#cachedValue as any).BYTES_PER_ELEMENT) ?? 4), length)
                    : this.#cachedValue;

                this.#gl.bufferSubData(this.#vusage, offset, dataToUpload);
                this.#dirty = false;
                return;
            }
        })
    })

    /**
     * Binds the buffer in webgl.
     */
    bind(target: number = this.#vusage) {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        this.#gl.bindBuffer(target, this.#buf);
    }

    /**
     * Reads the buffer synchronously and returns a Float32Array / Any type array
     * 
     * Also updates the buffer's cached value.
     */
    read = Object.assign(<T extends Buffer.FORMAT>(type: TYPED_ARRAY_CONSTRUCTOR<T> = Float32Array as any, len: number = this.#cachedValue.byteLength, offset: number = 0) => {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        this.bind(this.#gl.COPY_READ_BUFFER);
        const result = type ? new (type as any)(len) : new Float32Array(len);
        this.#gl.getBufferSubData(this.#gl.COPY_READ_BUFFER, offset, result);
        this.#cachedValue = result;
        return result as T;
    }, {
        /**
        * Reads the buffer synchronously and copies it to the given type array
        */
        copy: (to: Buffer.FORMAT, offset: number = 0) => {
            if(this.#deleted)throw error(5,"Buffer is already deleted!");
            const gl = this.#gl;
            this.bind(gl.COPY_READ_BUFFER)
            gl.getBufferSubData(gl.COPY_READ_BUFFER, offset, to)
        },

        /** 
         * Reads the buffer asynchronously and returns a Float32Array of the data
         * 
         * Also updates the buffer's cached value.
         */
        async: Object.assign(async (len: number, offset: number) => {
            if(this.#deleted)throw error(5,"Buffer is already deleted!");
            const sync = this.#gl.fenceSync(this.#gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
            this.#gl.flush();
            await this.#waitForSync(sync);
            let readResult = this.read(Float32Array, len, offset);
            return readResult;
        }, {
            /**
             * Reads the buffer asynchronously and copies it to the given type array
             */
            copy: async (to: Buffer.FORMAT, offset: number = 0) => {
                if(this.#deleted)throw error(5,"Buffer is already deleted!");
                const sync = this.#gl.fenceSync(this.#gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
                this.#gl.flush();
                await this.#waitForSync(sync);
                this.read.copy(to, offset)
            }
        })
    })

    /**
     * Copies the given buffer to another buffer synchronously.
     * 
     * Updates the other's buffer's cached value as well
     */
    copy = Object.assign((to: Buffer, config: Buffer.COPY_CONFIG = { offset: { read: 0, write: 0 }, size: this.#cachedValue.byteLength }) => {
        if(this.#deleted)throw error(5,"Buffer is already deleted!");
        this.bind(this.#gl.COPY_READ_BUFFER)
        to.bind(this.#gl.COPY_WRITE_BUFFER)
        if (!config.copy) config.copy = {buffer:true}
        if (config.copy?.buffer) this.#gl.copyBufferSubData(
            this.#gl.COPY_READ_BUFFER,
            this.#gl.COPY_WRITE_BUFFER,
            config.offset?.read ?? 0,
            config.offset?.write ?? 0,
            config.size ?? this.#cachedValue.byteLength
        )
        if (!config.copy?.cachedValue) return;
        to.value(this.value())
    }, {
        /**
         * Copies the given buffer to another buffer asynchronously.
         * 
         * Updates the other's buffer's cached value as well
         */
        async: async (to: Buffer, config: Buffer.COPY_CONFIG = { offset: { read: 0, write: 0 }, size: this.#cachedValue.byteLength }) => {
            if(this.#deleted)throw error(5,"Buffer is already deleted!");
            const sync = this.#gl.fenceSync(this.#gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
            this.#gl.flush();
            await this.#waitForSync(sync);
            this.copy(to, config)
        }
    })
    usage: Buffer.USAGE = {
        /**
         * Updates the draw usage of the buffer.
         */
        draw: <T extends Buffer.DRAW_USAGE>(usage?: T): typeof Buffer.bufferDrawUsageLookup[T] | (typeof Buffer.bufferDrawUsageLookup[Buffer.DRAW_USAGE]) => {
            if(this.#deleted)throw error(5,"Buffer is already deleted!");
            if (typeof usage === "undefined") return this.#dusage;
            return this.#dusage = Buffer.bufferDrawUsageLookup[usage];
        },

        value: <T extends Buffer.VALUE_USAGE>(usage?: T): typeof Buffer.bufferValueUsageLookup[T] | (typeof Buffer.bufferValueUsageLookup[Buffer.VALUE_USAGE]) => {
            if(this.#deleted)throw error(5,"Buffer is already deleted!");
            if (typeof usage === "undefined") return this.#vusage;
            return this.#vusage = Buffer.bufferValueUsageLookup[usage];
        }
    };
    #deleted:boolean=false;
    /**
     * 
     */
    delete = Object.assign(() => {
        if(this.#deleted)return;
        this.#gl.deleteBuffer(this.#buf);
        this.#buf = null as any;
        this.#cachedValue = new Float32Array(0);
        this.#deleted=true;
    }, {
        async: async () => {
            if(this.#deleted)return;
            const sync = this.#gl.fenceSync(this.#gl.SYNC_GPU_COMMANDS_COMPLETE, 0)!;
            this.#gl.flush();
            await this.#waitForSync(sync);
            this.delete();
        }
    })
    byteLength() {
        return this.#cachedValue.byteLength
    }
    async #waitForSync(sync: WebGLSync): Promise<void> {
        const gl = this.#gl;

        return new Promise((resolve, reject) => {
            const check = () => {
                const status = gl.clientWaitSync(sync, 0, 0);

                if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED) {
                    gl.deleteSync(sync);
                    resolve();
                } else if (status === gl.WAIT_FAILED) {
                    reject(new Error("Sync failed!"));
                } else {
                    setTimeout(check, 0);
                }
            };
            check();
        });
    }
}
export namespace Buffer {
    export const bufferTargetLookup = {
        "array": WebGL2RenderingContext["ARRAY_BUFFER"],
        "elementArrayBuffer": WebGL2RenderingContext["ELEMENT_ARRAY_BUFFER"],
        "copyReadBuffer": WebGL2RenderingContext["COPY_READ_BUFFER"],
        "copyWriteBuffer": WebGL2RenderingContext["COPY_WRITE_BUFFER"],
        "transformFeedbackBuffer": WebGL2RenderingContext["TRANSFORM_FEEDBACK_BUFFER"],
        "uniformBuffer": WebGL2RenderingContext["UNIFORM_BUFFER"],
        "pixelPackBuffer": WebGL2RenderingContext["PIXEL_PACK_BUFFER"],
        "pixelUnpackBuffer": WebGL2RenderingContext["PIXEL_UNPACK_BUFFER"]
    }
    /**valid formats in Buffer */
    export type FORMAT = Int8Array | Uint8Array | Uint8ClampedArray
        | Int16Array | Uint16Array
        | Int32Array | Uint32Array
        | Float32Array | Float64Array;
    export interface OPTIONS {
        /**initialize the value of the buffer */
        value?: Buffer.FORMAT,
        /**usage options for the buffer */
        usage?: {
            /**draw usage */
            draw?: DRAW_USAGE,
            /**value usage */
            value?: VALUE_USAGE
        }
    }
    /**
     * - **array**:  `gl.ARRAY_BUFFER`
     * 
     * - **elementArray**: `gl.ELEMENT_ARRAY_BUFFER`
     * 
     * - **"uniform"**: `gl.UNIFORM_BUFFER`
     */
    export type VALUE_USAGE = "array" | "elementArray" | "uniform"

    /**
     * - **static**: `gl.STATIC_DRAW`
     * - **dynamic**: `gl.DYNAMIC_DRAW`
     * - **stream**: `gl.STREAM_DRAW`
     */
    export type DRAW_USAGE = "static" | "dynamic" | "stream"
    export const bufferDrawUsageLookup = {
        dynamic: WebGL2RenderingContext["DYNAMIC_DRAW"],
        static: WebGL2RenderingContext["STATIC_DRAW"],
        stream: WebGL2RenderingContext["STREAM_DRAW"]
    }
    export const bufferValueUsageLookup = {
        array: WebGL2RenderingContext.ARRAY_BUFFER,
        elementArray: WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER,
        uniform: WebGL2RenderingContext.UNIFORM_BUFFER
    }
    export interface COPY_CONFIG {
        /**offset config*/
        offset?: {
            /**offset config for the buffer being written to */
            write?: number,
            /**offset config for the buffer being read */
            read?: number,
        },
        /**size of copy */
        size?: number,
        /**copy config */
        copy?: COPY_CONFIG.COPY
    }
    export namespace COPY_CONFIG {
        export type COPY = | {
            buffer?: false;
            cachedValue?: never;
        } | {
                buffer: true;
                cachedValue?: boolean;
            };
    }
    export interface USAGE {
        /**
         * Updates the draw usage of the buffer.
         */
        draw(): (typeof Buffer.bufferDrawUsageLookup[Buffer.DRAW_USAGE]);
        draw<T extends Buffer.DRAW_USAGE>(usage: T): typeof Buffer.bufferDrawUsageLookup[T]
        /**
         * Updates the value usage of the buffer.
         */
        value(): (typeof Buffer.bufferValueUsageLookup[Buffer.VALUE_USAGE]);
        value<T extends Buffer.VALUE_USAGE>(usage: T): typeof Buffer.bufferValueUsageLookup[T];
    }
}
