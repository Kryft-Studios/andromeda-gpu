import error from "../../../helpers/errors"
import brand from "../../../helpers/decorators/brand"
import labeling from "../../../helpers/decorators/labelling"
import DC_MEMBER from "../../../helpers/types/DCMember"
import { BRAND, LABEL } from "../../../helpers/types/decoratorHelpers"
import UNSURE from "../../../helpers/types/unsure"
import BufferCreator from "../data/buffers"
import CommandBufferCreator from "../data/commandbuffer"
import ComputePassCreator, { COMPUTE_PASS_OPTIONS } from "./commandEncoder/computepass"
import RenderPassCreator, { RENDER_PASS_OPTIONS } from "./commandEncoder/renderPass"
import TextureCreator from "../data/texture"
// eslint-disable-next-line
export interface CommandEncoderCreator extends BRAND<"CommandEncoderCreator">,LABEL {}
/**
 * Wrapper around {@link GPUCommandEncoder}.
 */
@brand("CommandEncoderCreator")
@labeling({
    get: (instance: CommandEncoderCreator) => instance.cmdencoder.label,
    set: (instance: CommandEncoderCreator, label) => instance.cmdencoder.label = label
})
export class CommandEncoderCreator {
    cmdencoder: GPUCommandEncoder
    readonly RenderPass:typeof RenderPassCreator
    readonly ComputePass
    readonly debug
    readonly copy;
    #debugDepth:number=0
    constructor(device:GPUDevice,labelOrCommandEncoder:UNSURE<string>|GPUCommandEncoder){
        this.cmdencoder=labelOrCommandEncoder instanceof GPUCommandEncoder?labelOrCommandEncoder:device.createCommandEncoder({label:labelOrCommandEncoder as string | undefined})
        this.cmdencoder = this.cmdencoder
        const self = this;
        this.RenderPass = class extends RenderPassCreator {
        constructor(options: RENDER_PASS_OPTIONS){
                super(device,self.cmdencoder,options)
            }
        }
        this.ComputePass = class extends ComputePassCreator {
            constructor(options: COMPUTE_PASS_OPTIONS){
                super(device,self.cmdencoder,options)
            }
        }
        this.debug = {
                    push: (label: string) => {
                        this.#debugDepth++;
                        this.cmdencoder.pushDebugGroup(label)
                    },
                    pop: () => {
                        if (this.#debugDepth <= 0) throw error(17, "debug.pop used before init")
                        this.cmdencoder.popDebugGroup()
                        this.#debugDepth--
                    },
                    insertMarker: (label: string) => {
                        this.cmdencoder.insertDebugMarker(label)
                    }
        }
        this.copy = {

            /**
             * Does not update the cached value in the buffer
             */
            textureToTexture:(texture:CommandEncoderCreator.copy.TEXEL_COPY_TEXTURE,des:CommandEncoderCreator.copy.TEXEL_COPY_TEXTURE,copySize:GPUExtent3DStrict)=>{
                return this.cmdencoder.copyTextureToTexture({
                    texture:texture.texture.raw(),
                    mipLevel:texture.mipLevel,
                    aspect:texture.aspect,
                    origin:texture.origin,
                },{
                    texture:des.texture.raw(),
                    mipLevel:des.mipLevel,
                    aspect:des.aspect,
                    origin:des.origin,
                },copySize)
            },
            /**
             * Does not update the cached value in the buffer
             */
            textureToBuffer:(texture:CommandEncoderCreator.copy.TEXEL_COPY_TEXTURE,des:CommandEncoderCreator.copy.TEXEL_COPY_BUFFER,copySize:GPUExtent3DStrict)=>{
                return this.cmdencoder.copyTextureToBuffer({
                    texture:texture.texture.raw(),
                    mipLevel:texture.mipLevel,
                    aspect:texture.aspect,
                    origin:texture.origin,
                },{
                    buffer:des.buffer.raw(),
                    "bytesPerRow":des.bytesPerRow,
                    offset:des.offset,
                    "rowsPerImage":des.rowsPerImage
                },copySize)
            },
            /**
             * Does not update the cached value in the buffer
             */
            bufferToTexture:(buf:CommandEncoderCreator.copy.TEXEL_COPY_BUFFER,des:CommandEncoderCreator.copy.TEXEL_COPY_TEXTURE,copySize:GPUExtent3DStrict)=>{
                return this.cmdencoder.copyBufferToTexture({
                    buffer:buf.buffer.raw(),
                    "bytesPerRow":buf.bytesPerRow,
                    offset:buf.offset,
                    "rowsPerImage":buf.rowsPerImage
                },{
                    texture:des.texture.raw(),
                    mipLevel:des.mipLevel,
                    aspect:des.aspect,
                    origin:des.origin,
            },copySize)
            },
            /**
             * Does not update the cached value in the buffer
             */
            bufferToBuffer:(buf:BufferCreator,des:BufferCreator,copySize:number)=>{
                return this.cmdencoder.copyBufferToBuffer(buf.raw(),des.raw(),copySize)
            },
        }
    }
    /**
     * Finishes recording and returns a wrapped command buffer.
     */
    finish(des:GPUObjectDescriptorBase){
        return new CommandBufferCreator(this.cmdencoder.finish(des))
    }
}
export namespace CommandEncoderCreator {
    export namespace copy {
            /**
             * Texture copy source/destination metadata used by the copy helpers.
             */
            export interface TEXEL_COPY_TEXTURE {
                texture:TextureCreator|DC_MEMBER<"Texture">
                origin?:GPUOrigin3D
                aspect?:GPUTextureAspect
                mipLevel?:number                
            }

            /**
             * Buffer copy source/destination metadata used by the copy helpers.
             */
            export interface TEXEL_COPY_BUFFER extends GPUTexelCopyBufferLayout {
                buffer:BufferCreator|DC_MEMBER<"Buffer">
            }
    }
}

export default CommandEncoderCreator
