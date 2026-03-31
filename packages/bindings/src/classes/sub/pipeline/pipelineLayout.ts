import DeviceControls from "../../main/device"
import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../helpers/types/unsure";
import BindGroupLayoutCreator from "../data/bindGroupLayout";
// eslint-disable-next-line
export interface PipelineLayoutCreator extends RAW<GPUPipelineLayout>, BRAND<"PipelineLayoutCreator"> {
    label(): UNSURE<string>;
    label<T extends string>(label: T): T;
}
/**
 * Wrapper around {@link GPUPipelineLayout}.
 */
@brand("PipelineLayoutCreator")
@raw("pipelineLayout")
@labeling({
    get: (instance: PipelineLayoutCreator) => instance.labelValue,
    set: (instance: PipelineLayoutCreator, label) => instance.pipelineLayout.label = instance.labelValue = label
})
export class PipelineLayoutCreator {
    labelValue?: string
    pipelineLayout: GPUPipelineLayout
    constructor(device: GPUDevice, pipelineLayoutOrOptions: GPUPipelineLayout | PIPELINE_LAYOUT_OPTIONS) {
        this.#pipelineLayout = !(pipelineLayoutOrOptions instanceof GPUPipelineLayout) ? device.createPipelineLayout(this.#buildFromOptions(pipelineLayoutOrOptions)) : pipelineLayoutOrOptions;
        this.#label = pipelineLayoutOrOptions.label
        this.labelValue = this.#label
        this.pipelineLayout = this.#pipelineLayout
    }
    #label?: string
    #pipelineLayout: GPUPipelineLayout
    #buildFromOptions(options: PIPELINE_LAYOUT_OPTIONS): GPUPipelineLayoutDescriptor {
        return {
            label: options.label,
            bindGroupLayouts: options.bindGroupLayouts?.map(a => a.raw()) ?? []
        }
    }
}
export default PipelineLayoutCreator

/**
 * Options used to create a pipeline layout wrapper.
 */
export interface PIPELINE_LAYOUT_OPTIONS extends GPUObjectDescriptorBase {
    bindGroupLayouts?: (InstanceType<DeviceControls["BindGroupLayout"]> | BindGroupLayoutCreator)[]
}
