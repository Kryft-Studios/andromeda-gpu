import DeviceControls from "../../main/device"
import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, LABEL, RAW } from "../../../helpers/types/decoratorHelpers";
import BindGroupLayoutCreator from "../data/bindGroupLayout";
// eslint-disable-next-line
export interface PipelineLayoutCreator extends RAW<GPUPipelineLayout>, BRAND<"PipelineLayoutCreator">,LABEL {}
/**
 * Wrapper around {@link GPUPipelineLayout}.
 */
@brand("PipelineLayoutCreator")
@raw("pipelineLayout")
@labeling({
    get: (instance: PipelineLayoutCreator) => instance.pipelineLayout.label,
    set: (instance: PipelineLayoutCreator, label) => instance.pipelineLayout.label = label
})
export class PipelineLayoutCreator {
    #device?: GPUDevice
    #options?: PIPELINE_LAYOUT_OPTIONS
    pipelineLayout: GPUPipelineLayout
    constructor(device: GPUDevice, pipelineLayoutOrOptions: GPUPipelineLayout | PIPELINE_LAYOUT_OPTIONS) {
        if (!(pipelineLayoutOrOptions instanceof GPUPipelineLayout)) {
            this.#device = device;
            this.#options = {
                ...pipelineLayoutOrOptions,
                bindGroupLayouts: pipelineLayoutOrOptions.bindGroupLayouts ? [...pipelineLayoutOrOptions.bindGroupLayouts] : undefined,
            };
            this.#pipelineLayout = device.createPipelineLayout(this.#buildFromOptions(pipelineLayoutOrOptions));
        } else {
            this.#pipelineLayout = pipelineLayoutOrOptions;
        }
        this.pipelineLayout = this.#pipelineLayout
    }
    #pipelineLayout: GPUPipelineLayout
    #buildFromOptions(options: PIPELINE_LAYOUT_OPTIONS): GPUPipelineLayoutDescriptor {
        return {
            label: options.label,
            bindGroupLayouts: options.bindGroupLayouts?.map(a => a.raw()) ?? []
        }
    }
    /**
     * Recreates the pipeline layout from its original bind group layouts when available.
     */
    clone(): PipelineLayoutCreator {
        if (!this.#device || !this.#options) {
            throw new TypeError("Cannot clone a PipelineLayoutCreator created from a raw GPUPipelineLayout.");
        }
        return new PipelineLayoutCreator(this.#device, {
            ...this.#options,
            label: this.pipelineLayout.label || this.#options.label,
            bindGroupLayouts: this.#options.bindGroupLayouts ? [...this.#options.bindGroupLayouts] : undefined,
        });
    }
}
export default PipelineLayoutCreator

/**
 * Options used to create a pipeline layout wrapper.
 */
export interface PIPELINE_LAYOUT_OPTIONS extends GPUObjectDescriptorBase {
    bindGroupLayouts?: (InstanceType<DeviceControls["BindGroupLayout"]> | BindGroupLayoutCreator)[]
}
