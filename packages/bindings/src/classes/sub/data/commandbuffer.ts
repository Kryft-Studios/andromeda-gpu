import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, LABEL, RAW } from "../../../helpers/types/decoratorHelpers";
// eslint-disable-next-line
export interface CommandBufferCreator extends BRAND<"CommandBufferCreator">, LABEL, RAW<GPUCommandBuffer> {}
/**
 * Wrapper around {@link GPUCommandBuffer}.
 */
@brand("CommandBufferCreator")
@labeling({
    get: (instance: CommandBufferCreator) => instance.commandBuffer.label,
    set: (instance: CommandBufferCreator, label) => instance.commandBuffer.label = label
})
@raw("commandBuffer")
export class CommandBufferCreator {
    #cmdbuf:GPUCommandBuffer
    commandBuffer: GPUCommandBuffer
    constructor(cmdbuf:GPUCommandBuffer){
        this.#cmdbuf=cmdbuf
        this.commandBuffer = this.#cmdbuf
    }
}
export default CommandBufferCreator
