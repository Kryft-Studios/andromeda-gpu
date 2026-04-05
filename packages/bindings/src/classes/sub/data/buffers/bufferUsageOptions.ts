/// <reference types="@webgpu/types" />

/**
 * Fine-grained copy flags for buffer usage construction.
 */
export interface BUFFER_COPY_OPTIONS {
    /**Whether the buffer can be read while being copied. */
    read?: boolean;
    /**Whether the buffer can be written to while being copied */
    write?: boolean;
}
import "@webgpu/types";
export interface BUFFER_BINDING_OPTIONS {
    /**Whether the buffer can be bound as a vertex buffer */
    vertex?: boolean;
    /**Whether the buffer can be bound as a index buffer */
    index?: boolean;
    /**Whether the buffer can be bound as a uniform buffer */
    uniform?: boolean;
    /**Whether the buffer can be bound as a storage buffer */
    storage?: boolean;
    /**Whether the buffer can be bound as a indirect buffer */
    indirect?: boolean;
}

/**
 * CPU mapping flags for buffer usage construction.
 */
export interface BUFFER_MAP_OPTIONS {
    /**Whether the buffer can be read while mapping */
    read?: boolean;

    /**Whether the buffer can be written to while mapping */
    write?: boolean;
}

export interface BUFFER_USAGE_OPTIONS {
    /**
     * Copy operations
     * - `true`: Enable both texture and buffer copy (COPY_SRC | COPY_DST)
     * - `false`: Disable copy operations
     * - `object`: Specify which copy types to enable
     */
    copy?: BUFFER_COPY_OPTIONS | boolean;
    
    /**
     * Buffer binding types
     * Specify how this buffer will be bound to shaders
     */
    buffer?: BUFFER_BINDING_OPTIONS;
    
    /**
     * Map operations (CPU access)
     * - `true`: Enable read and write mapping
     * - `false`: Disable mapping
     * - `object`: Specify read/write separately
     */
    map?: BUFFER_MAP_OPTIONS | boolean;
    
    /**
     * Can be used as a query result destination
     */
    queryable?: boolean;
}

export default BUFFER_USAGE_OPTIONS;

/**
 * Converts a structured buffer usage object into native `GPUBufferUsage` bits.
 */
export function getBufferUsage(options: BUFFER_USAGE_OPTIONS={}): number {
    let usage = 0;
    let copyOptions = options.copy
    if(copyOptions){
        if(typeof copyOptions === "boolean")usage |= GPUBufferUsage.COPY_DST,usage |= GPUBufferUsage.COPY_SRC
        else {
            if(copyOptions.read) usage |= GPUBufferUsage.COPY_SRC
            if(copyOptions.write) usage |= GPUBufferUsage.COPY_DST
        }
    }
    let bufferOptions = options.buffer
    if(bufferOptions){
        if(bufferOptions.index) usage |= GPUBufferUsage.INDEX
        if(bufferOptions.indirect) usage |= GPUBufferUsage.INDIRECT
        if(bufferOptions.storage) usage |= GPUBufferUsage.STORAGE
        if(bufferOptions.uniform) usage |= GPUBufferUsage.UNIFORM
        if(bufferOptions.vertex) usage |= GPUBufferUsage.VERTEX
    }
    let mapOptions = options.map
    if(mapOptions){
        if(typeof mapOptions === "boolean") usage |= GPUBufferUsage.MAP_READ, usage |= GPUBufferUsage.MAP_WRITE
        else {
            if(mapOptions.read) usage|=GPUBufferUsage.MAP_READ
            if(mapOptions.write) usage |= GPUBufferUsage.MAP_WRITE
        }
    }
    if(options.queryable) usage |= GPUBufferUsage.QUERY_RESOLVE
    return usage;
}

/**
 * Expands native `GPUBufferUsage` bits into the structured options shape used
 * by this package.
 */
export function getOptionsFromUsage(usage: number): BUFFER_USAGE_OPTIONS {
    const options: BUFFER_USAGE_OPTIONS = {};
    const hasCopySrc = !!(usage & GPUBufferUsage.COPY_SRC);
    const hasCopyDst = !!(usage & GPUBufferUsage.COPY_DST);
    
    if (hasCopySrc && hasCopyDst) {
        options.copy = true;
    } else if (hasCopySrc || hasCopyDst) {
        options.copy = {
            read: hasCopySrc,
            write: hasCopyDst
        };
    }
    const buffer: any = {};
    if (usage & GPUBufferUsage.INDEX) buffer.index = true;
    if (usage & GPUBufferUsage.INDIRECT) buffer.indirect = true;
    if (usage & GPUBufferUsage.STORAGE) buffer.storage = true;
    if (usage & GPUBufferUsage.UNIFORM) buffer.uniform = true;
    if (usage & GPUBufferUsage.VERTEX) buffer.vertex = true;
    
    if (Object.keys(buffer).length > 0) {
        options.buffer = buffer;
    }
    const hasMapRead = !!(usage & GPUBufferUsage.MAP_READ);
    const hasMapWrite = !!(usage & GPUBufferUsage.MAP_WRITE);

    if (hasMapRead && hasMapWrite) {
        options.map = true;
    } else if (hasMapRead || hasMapWrite) {
        options.map = {
            read: hasMapRead,
            write: hasMapWrite
        };
    }
    if (usage & GPUBufferUsage.QUERY_RESOLVE) {
        options.queryable = true;
    }

    return options;
}
