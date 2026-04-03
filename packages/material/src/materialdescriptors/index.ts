import { getGBMetadata, getLocationsMetadata } from "./shaderparse";
import { WebGPUControls } from "@agpu/bindings";
type DEVICE = Awaited<ReturnType<Awaited<WebGPUControls["Adapter"]>["device"]>>
class MaterialDescriptors {
    readonly bindings
    readonly locations
    readonly code
    #pipeline?:InstanceType<DEVICE["RenderPipeline"]>
    constructor(controls:DEVICE,code: string, options: MaterialDescriptors.OPTIONS = { bindings: getGBMetadata(code), locations: getLocationsMetadata(code) }) {
        if (!options.bindings) options.bindings = getGBMetadata(code);
        if (!options.locations) options.locations = getLocationsMetadata(code);
        this.bindings=options.bindings;
        this.locations=options.locations;
        this.code=code;
        this.#device = controls;
    }
    #device:DEVICE
    get pipeline(){
        if(this.#pipeline)return this.#pipeline;
        else return this.#pipeline = new this.#device.RenderPipeline(
            {
                "vertex":{
                    "module": new this.#device.ShaderModule(this.code),
                },
                "layout": "auto"
            }
        )
    }
}
type SHADER_MODULE_OPTIONS = ConstructorParameters<DEVICE["ShaderModule"]>[0]
namespace MaterialDescriptors {
    export interface SHADER_LOCATION {
        location: number;
        type: GPUVertexFormat;
    }
    export interface BINDING {
        binding: number;
        group: number;
        type: `vec${2 | 3 | 4}${"f" | "h" | "i" | "u"}`;
    }
    export interface OPTIONS {
        bindings: BINDING[],
        locations: SHADER_LOCATION[]
    }
}

export default MaterialDescriptors;