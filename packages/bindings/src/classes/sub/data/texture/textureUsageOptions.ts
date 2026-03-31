/**
 * Structured texture usage flags used by this package.
 */
interface TEXTURE_COPY_OPTIONS {
    read?: boolean
    write?:boolean
}

interface TEXTURE_BINDING_OPTIONS {
    storage?:boolean;
    texture?:boolean;
}

/**
 * Structured texture usage flags used by this package.
 */
interface TEXTURE_USAGE_OPTIONS {
    /**
     * Copy operations
     * - `true`: Enable both texture and buffer copy (COPY_SRC | COPY_DST)
     * - `false`: Disable copy operations
     * - `object`: Specify which copy types to enable
     * 
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUTexture/usage Read about GPUTextureUsage-s here}
     */
    copy?:TEXTURE_COPY_OPTIONS|boolean;

    /**
     * The texture can be used as a color or depth/stencil attachment in a render pass, for example as the view property of the descriptor object in a beginRenderPass() call.
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/GPUTexture/usage Read about GPUTextureUsage-s here}
     */
    renderAttachment?:boolean

    /**
     * Texture binding types
     * Specify how this texture will be bound to shaders
     */
    binding?:TEXTURE_BINDING_OPTIONS
}
export default TEXTURE_USAGE_OPTIONS

/**
 * Expands native `GPUTextureUsage` bits into structured texture options.
 */
export function getOptionsFromTextureUsage(usage: number): TEXTURE_USAGE_OPTIONS {
    const hasCopyRead = !!(usage & GPUTextureUsage.COPY_SRC);
    const hasCopyWrite = !!(usage & GPUTextureUsage.COPY_DST);

    return {
        copy: (hasCopyRead && hasCopyWrite) ? true : {
            read: hasCopyRead,
            write: hasCopyWrite
        },
        renderAttachment: !!(usage & GPUTextureUsage.RENDER_ATTACHMENT),
        binding: {
            texture: !!(usage & GPUTextureUsage.TEXTURE_BINDING),
            storage: !!(usage & GPUTextureUsage.STORAGE_BINDING),
        }
    };
}

/**
 * Converts structured texture options into native `GPUTextureUsage` bits.
 */
export function getTextureUsage(options: TEXTURE_USAGE_OPTIONS): number {
    let usage = 0;

    if (options.copy === true) {
        usage |= (GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST);
    } else if (typeof options.copy === "object") {
        if (options.copy.read) usage |= GPUTextureUsage.COPY_SRC;
        if (options.copy.write) usage |= GPUTextureUsage.COPY_DST;
    }

    if (options.renderAttachment) usage |= GPUTextureUsage.RENDER_ATTACHMENT;

    if (options.binding) {
        if (options.binding.texture) usage |= GPUTextureUsage.TEXTURE_BINDING;
        if (options.binding.storage) usage |= GPUTextureUsage.STORAGE_BINDING;
    }

    return usage;
}
