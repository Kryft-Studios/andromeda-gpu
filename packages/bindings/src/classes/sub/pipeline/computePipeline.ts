import {brand} from "@agpu/helpers/decorators";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import { BRAND, RAW } from "@agpu/helpers/decorators";
import DC_MEMBER from "../../../helpers/types/DCMember";
import PipelineLayoutCreator from "./pipelineLayout";
import ShaderModuleCreator from "../data/shaderModule";
// eslint-disable-next-line
export interface ComputePipelineCreator extends RAW<Promise<GPUComputePipeline>>, BRAND<"ComputePipelineCreator"> {
    label(): Promise<string>;
    label<T extends string>(label: T): Promise<T>;
}
/**
 * Wrapper around {@link GPUComputePipeline}.
 */
@brand("ComputePipelineCreator")
@raw("computePipeline")
@labeling({
    get: async (instance: ComputePipelineCreator) => (await instance.computePipeline).label,
    set: async (instance: ComputePipelineCreator, label) => (await instance.computePipeline).label = label
})
export class ComputePipelineCreator {
    #device?: GPUDevice
    #options?: COMPUTE_PIPELINE_OPTION
    #initWaiters: ((bool: boolean) => void)[] = []
    #pipelineCreated: boolean = false;
    computePipeline: Promise<GPUComputePipeline>
    constructor(device: GPUDevice, sm: COMPUTE_PIPELINE_OPTION | GPUComputePipeline) {
        const asOption = (sm as COMPUTE_PIPELINE_OPTION)
        if (asOption.module) {
            this.#device = device;
            this.#options = { ...asOption };
        }
        this.computePipeline = asOption.module ? (asOption.async ?
            device.createComputePipelineAsync(this.#buildDescriptor(asOption)).then(a => {
                this.#initWaiters.forEach(a => a(true))
                this.#pipelineCreated = true;
                return a
            }) :
            new Promise(() => {
                this.#initWaiters.forEach(a => a(true))
                this.#pipelineCreated = true; return device.createComputePipeline(this.#buildDescriptor(asOption))
            })
        ) :
            new Promise(() => {
                this.#initWaiters.forEach(a => a(true))
                this.#pipelineCreated = true;
                return sm
            }
            )
    }
    #buildDescriptor(options: COMPUTE_PIPELINE_OPTION): GPUComputePipelineDescriptor {
        return {
            layout: options.layout.raw(),
            compute: {
                module: options.module.raw(),
                constants: options.module.constants() as Record<string, number> | undefined,
                entryPoint: options.module.entryPoint() as string | undefined
            },
            label: options.label
        }
    }
    /**
     * Resolves once the underlying pipeline has been created.
     */
    init(): Promise<boolean> {
        if (this.#pipelineCreated) return new Promise(() => true)
        return new Promise((resolve) => {
            this.#initWaiters.push((a) => {
                resolve(a)
            })
        })
    }
    /**
     * Recreates the compute pipeline from its original module/layout when available.
     */
    clone(): ComputePipelineCreator {
        if (!this.#device || !this.#options) {
            throw new TypeError("Cannot clone a ComputePipelineCreator created from a raw GPUComputePipeline.");
        }
        return new ComputePipelineCreator(this.#device, { ...this.#options });
    }
}
export default ComputePipelineCreator

/**
 * Options used to create a compute pipeline wrapper.
 */
export interface COMPUTE_PIPELINE_OPTION extends GPUObjectDescriptorBase {
    module: ShaderModuleCreator | DC_MEMBER<"ShaderModule">,
    async?: boolean
    layout: PipelineLayoutCreator
}
