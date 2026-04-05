/// <reference types="@webgpu/types" />

import {brand} from "@agpu/helpers/decorators";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import DC_MEMBER from "../../../helpers/types/DCMember";
import { BRAND, LABEL, RAW } from "@agpu/helpers/decorators";
import BindGroupLayoutCreator from "./bindGroupLayout";
import BufferCreator from "./buffers";
import SamplerCreator from "../pipeline/sampler";
import TextureCreator from "./texture";
import "@webgpu/types";
// eslint-disable-next-line
export interface BindGroupCreator extends RAW<GPUBindGroup>, BRAND<"BindGroupCreator">,LABEL {}
/**
 * Wrapper around {@link GPUBindGroup}.
 */
@brand("BindGroupCreator")
@raw("bindGroup")
@labeling({
    get: (instance: BindGroupCreator) => instance.bindGroup.label,
    set: (instance: BindGroupCreator, label) => instance.bindGroup.label = label
})
export class BindGroupCreator {
    #device?: GPUDevice
    #options?: BIND_GROUP_OPTIONS
    #layout:BindGroupLayoutCreator|DC_MEMBER<"BindGroupLayout">
    readonly bindGroup: GPUBindGroup
    constructor(device:GPUDevice,options:BIND_GROUP_OPTIONS|GPUBindGroup){
        this.#layout = (options as BIND_GROUP_OPTIONS).layout
        if ((options as BIND_GROUP_OPTIONS).layout) {
            this.#device = device;
            this.#options = {
                ...(options as BIND_GROUP_OPTIONS),
                entries: (options as BIND_GROUP_OPTIONS).entries.map(entry => ({ ...entry })),
            };
            this.bindGroup = device.createBindGroup(this.#buildOptions(options as BIND_GROUP_OPTIONS));
        } else {
            this.bindGroup = options as GPUBindGroup;
        }
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
     * Returns the layout wrapper used to create this bind group
     */
    layout(){
        return this.#layout;
    }
    /**
     * Recreates the bind group from its original layout and entries when available.
     */
    clone(): BindGroupCreator {
        if (!this.#device || !this.#options) {
            throw new TypeError("Cannot clone a BindGroupCreator created from a raw GPUBindGroup.");
        }
        return new BindGroupCreator(this.#device, {
            ...this.#options,
            label: this.bindGroup.label || this.#options.label,
            entries: this.#options.entries.map(entry => ({ ...entry })),
        });
    }
}

export default BindGroupCreator

/**
 * Options used to create a bind group wrapper.
 */
export interface BIND_GROUP_OPTIONS extends GPUObjectDescriptorBase {
    /**The layout of the bind group.*/
    layout:BindGroupLayoutCreator|DC_MEMBER<"BindGroupLayout">
    /**entries in the bind group. */
    entries: {
        /**The @binding(n) of the entry.*/
        binding:number,

        /**The resource.*/
        resource:TextureCreator|DC_MEMBER<"Texture">   |
                 BufferCreator |DC_MEMBER<"Buffer">    |
                 SamplerCreator|DC_MEMBER<"Sampler">
        }[]
}
