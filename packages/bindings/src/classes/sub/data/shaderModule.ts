import {brand} from "@agpu/helpers/decorators";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import getBindGroups from "../../../helpers/shaderRegex"
import { BRAND, LABEL, RAW } from "@agpu/helpers/decorators";
import UNSURE from "@agpu/helpers/unsure"

/**
 * Options used when creating a shader module from WGSL source.
 */
export interface SHADER_MODULE_OPTIONS extends GPUObjectDescriptorBase {
    /**Hints for the compiler.*/
    hints?: Iterable<GPUShaderModuleCompilationHint>,
    /**The entry point of the shader module.*/
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
    get: (instance: ShaderModuleCreator) => instance.module.label,
    set: (instance: ShaderModuleCreator, label) => instance.module.label = label 
})
export class ShaderModuleCreator {
    #device?: GPUDevice
    #code?: string
    #entryPoint?:string
    #constants?:Record<string,number>
    #label?: string
    #hints?: Iterable<GPUShaderModuleCompilationHint>
    readonly module: GPUShaderModule
    constructor(device: GPUDevice, codeOrModule: string | GPUShaderModule, options?: SHADER_MODULE_OPTIONS) {
        if (typeof codeOrModule === 'string') {
            // It's code
            this.#device = device;
            this.#code = codeOrModule;
            this.#entryPoint=options?.entryPoint
            this.#constants=options?.constants
            this.#label = options?.label ?? ""
            this.#hints = options?.hints
            let md: GPUShaderModuleDescriptor = { code: codeOrModule, label: options?.label ?? "" }
            if (options?.hints) md.compilationHints = options.hints
            this.module = device.createShaderModule(md)
        } else {
            // It's a raw GPUShaderModule
            this.module = codeOrModule;
            this.#code = undefined;
            this.#entryPoint = undefined;
            this.#constants = undefined;
        }
    }
    /**
     * Recreates the shader module from its original WGSL source when available.
     */
    clone(): ShaderModuleCreator {
        if (!this.#device || typeof this.#code !== "string") {
            throw new TypeError("Cannot clone a ShaderModuleCreator created from a raw GPUShaderModule.");
        }
        return new ShaderModuleCreator(this.#device, this.#code, {
            label: this.module.label || this.#label,
            hints: this.#hints,
            entryPoint: this.#entryPoint,
            constants: this.#constants ? { ...this.#constants } : undefined,
        });
    }

    /**
     * Returns the cached entry point configured on this wrapper, if any.
     * 
     * This will be undefined if either:
     * 
     * - It was not provided in the options
     * 
     * - A GPUShaderModule was passed instead of a options object.
     */
    entryPoint():UNSURE<string>{return this.#entryPoint}

    /**
     * Returns the cached shader constants configured on this wrapper, if any.
     * This will be undefined if either:
     * 
     * - It was not provided in the options
     * 
     * - A GPUShaderModule was passed instead of a options object.
     */
    constants():UNSURE<Record<string,number>>{return this.#constants}
    /**
     * Returns the raw code of the shader module.
     * 
     * This will be undefined if a GPUShaderModule was passed instead of a options object.
     */
    code(){return this.#code}

    /**
     * Requests compilation info for the shader module.
     */
    async compilationInfo() { return this.#ciCache? this.#ciCache : this.#ciCache = await this.module.getCompilationInfo() }
    #ciCache?:GPUCompilationInfo
    /**
     * Returns what bindGroups are used in the source code of the shader
     * 
     * Always Set<undefined> if a GPUShaderModule was passed instead of a options object.
     */
    bindGroups(){
        if(!this.#cbgCache) return this.#cbgCache = getBindGroups(this.#code ?? "")
        return this.#cbgCache;
    }
    #cbgCache?:Set<number>
}
export default ShaderModuleCreator
