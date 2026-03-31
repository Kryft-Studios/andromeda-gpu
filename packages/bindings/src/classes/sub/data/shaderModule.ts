import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import getBindGroups from "../../../helpers/shaderRegex"
import { BRAND, LABEL, RAW } from "../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../helpers/types/unsure"

/**
 * Options used when creating a shader module from WGSL source.
 */
export interface SHADER_MODULE_OPTIONS extends GPUObjectDescriptorBase {
    hints?: Iterable<GPUShaderModuleCompilationHint>,
    entryPoint?:string
    constants?:Record<string,number>
}

/**
 * Wrapper around {@link GPUShaderModule}.
 */
// eslint-disable-next-line
export interface ShaderModuleCreator extends RAW<GPUShaderModule>, BRAND<"ShaderModuleCreator">, LABEL {}
@brand("ShaderModuleCreator")
@raw("module")
@labeling({
    get: (instance: ShaderModuleCreator) => instance.labelValue,
    set: (instance: ShaderModuleCreator, label) => instance.module.label = instance.labelValue = label
})
export class ShaderModuleCreator {
    #module: GPUShaderModule
    #code: string | undefined
    #device: GPUDevice
    #label: string
    #hints?: Iterable<GPUShaderModuleCompilationHint>
    #entryPoint?:string
    #constants?:Record<string,number>
    module: GPUShaderModule
    labelValue: string
    constructor(device: GPUDevice, codeOrModule: string | GPUShaderModule, options?: SHADER_MODULE_OPTIONS) {
        this.#device = device;
        if (typeof codeOrModule === 'string') {
            // It's code
            this.#code = codeOrModule;
            this.#entryPoint=options?.entryPoint
            this.#constants=options?.constants
            this.#label = options?.label ?? ""
            let md: GPUShaderModuleDescriptor = { code: codeOrModule, label: options?.label ?? "" }
            if (options?.hints) md.compilationHints = options.hints
            this.#module = device.createShaderModule(md)
            this.#hints = options?.hints
        } else {
            // It's a raw GPUShaderModule
            this.#module = codeOrModule;
            this.#code = undefined;
            this.#label = codeOrModule.label || "";
            this.#hints = undefined;
            this.#entryPoint = undefined;
            this.#constants = undefined;
        }
        this.module = this.#module
        this.labelValue = this.#label
    }

    /**
     * Returns the cached entry point configured on this wrapper, if any.
     */
    entryPoint():UNSURE<string>{return this.#entryPoint}

    /**
     * Returns the cached shader constants configured on this wrapper, if any.
     */
    constants():UNSURE<Record<string,number>>{return this.#constants}
    /**
     * Returns the raw code of the shader module.
     */
    code(){return this.#code}

    /**
     * Requests compilation info for the shader module.
     */
    async compilationInfo() { return this.#ciCache? this.#ciCache : this.#ciCache = await this.#module.getCompilationInfo() }
    #ciCache?:GPUCompilationInfo
    /**
     * Returns what bindGroups are used in the source code of the shader
     */
    bindGroups(){
        if(!this.#cbgCache) return this.#cbgCache = getBindGroups(this.#code ?? "")
        return this.#cbgCache;
    }
    #cbgCache?:Set<number>
}
export default ShaderModuleCreator
