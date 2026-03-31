import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
import DC_MEMBER from "../../../helpers/types/DCMember";
import UNSURE from "../../../helpers/types/unsure";
import PipelineLayoutCreator from "./pipelineLayout";
import ShaderModuleCreator from "../data/shaderModule";
// eslint-disable-next-line
export interface ComputePipelineCreator extends RAW<Promise<GPUComputePipeline>>, BRAND<"ComputePipelineCreator"> {
    label(): Promise<UNSURE<string>>;
    label<T extends string>(label: T): Promise<T>;
}
/**
 * Wrapper around {@link GPUComputePipeline}.
 */
@brand("ComputePipelineCreator")
@raw("computePipeline")
@labeling({
    get: (instance: ComputePipelineCreator) => Promise.resolve(instance.labelValue),
    set: async (instance: ComputePipelineCreator, label) => (await instance.computePipeline).label = instance.labelValue = label
})
export class ComputePipelineCreator {
    #computePipeline: Promise<GPUComputePipeline>
    #label?: string
    #initWaiters: ((bool: boolean) => void)[] = []
    #pipelineCreated: boolean = false;
    computePipeline: Promise<GPUComputePipeline>
    labelValue?: string
    constructor(device: GPUDevice, sm: COMPUTE_PIPELINE_OPTION | GPUComputePipeline) {
        const asOption = (sm as COMPUTE_PIPELINE_OPTION)
        this.#computePipeline = asOption.module ? (asOption.async ?
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
        this.#label = sm.label
        this.computePipeline = this.#computePipeline
        this.labelValue = this.#label
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
        if (this.#pipelineCreated) return new Promise(_ => true)
        return new Promise((resolve) => {
            this.#initWaiters.push((a) => {
                resolve(a)
            })
        })
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
