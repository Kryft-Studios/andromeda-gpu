import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import DC_MEMBER from "../../../helpers/types/DCMember";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../helpers/types/unsure";
import BindGroupLayoutCreator from "./bindGroupLayout";
import BufferCreator from "./buffers";
import SamplerCreator from "../pipeline/sampler";
import TextureCreator from "./texture";
// eslint-disable-next-line
export interface BindGroupCreator extends RAW<GPUBindGroup>, BRAND<"BindGroupCreator"> {
    label(): UNSURE<string>;
    label<T extends string>(label: T): T;
}
/**
 * Wrapper around {@link GPUBindGroup}.
 */
@brand("BindGroupCreator")
@raw("bindGroup")
@labeling({
    get: (instance: BindGroupCreator) => instance.labelValue,
    set: (instance: BindGroupCreator, label) => instance.bindGroup.label = instance.labelValue = label
})
export class BindGroupCreator {
    #bindGroup:GPUBindGroup
    #label?:string
    #layout:UNSURE<BindGroupLayoutCreator|DC_MEMBER<"BindGroupLayout">>
    bindGroup: GPUBindGroup
    labelValue?: string
    constructor(device:GPUDevice,options:BIND_GROUP_OPTIONS|GPUBindGroup){
        this.#bindGroup=(options as BIND_GROUP_OPTIONS).layout?device.createBindGroup(this.#buildOptions(options as BIND_GROUP_OPTIONS)):options as GPUBindGroup
        this.#label=options.label
        this.#layout = (options as BIND_GROUP_OPTIONS).layout
        this.bindGroup = this.#bindGroup
        this.labelValue = this.#label
    }
    #buildOptions(options:BIND_GROUP_OPTIONS):GPUBindGroupDescriptor {
        return {
            layout: options.layout.raw(),
            entries: options.entries.map(a=>{
                return {binding:a.binding,
                resource:a.resource.raw()}
            }),
            label:options.label
        }
    }
    /**
     * Returns the layout wrapper used to create this bind group, if known.
     */
    layout(){
        return this.#layout;
    }
}

export default BindGroupCreator

/**
 * Options used to create a bind group wrapper.
 */
export interface BIND_GROUP_OPTIONS extends GPUObjectDescriptorBase {
    layout:BindGroupLayoutCreator|DC_MEMBER<"BindGroupLayout">
    entries: {
        binding:number,
        resource:TextureCreator|DC_MEMBER<"Texture">   |
                 BufferCreator |DC_MEMBER<"Buffer">    |
                 SamplerCreator|DC_MEMBER<"Sampler">
        }[]
}

/**@type {GPUBindGroupDescriptor} */
/**@type {GPUBindGroupLayoutDescriptor} */
