/**
 * Default usage flags used when explicit options are omitted.
 */
const defaults = {
    bufferUsage: GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,
    textureUsage:GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
}
export default defaults
