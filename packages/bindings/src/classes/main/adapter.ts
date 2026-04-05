/// <reference types="@webgpu/types" />

import {brand} from "@agpu/helpers/decorators";
import error from "../../helpers/errors";
import {raw} from "@agpu/helpers/decorators";
import { BRAND, RAW } from "@agpu/helpers/decorators";
import DeviceControls from "./device"
import "@webgpu/types";
//eslint-disable-next-line
export interface AdapterControls extends BRAND<"AdapterControls">,RAW<"adapter"> {}
@brand("AdapterControls")
@raw("adapter")
export class AdapterControls {
    constructor(adapter:GPUAdapter){
        this.info = {
            subgroup: {
                max: adapter.info.subgroupMaxSize,
                min: adapter.info.subgroupMinSize
            },
            ...adapter.info
        }
        this.device = async (options?: DEVICE_REQUEST)=>{
            if(this.#dvCached)return this.#dvCached;
            const unsupportedFeatures = options?.required?.features?.filter(feature=>!adapter.features.has(feature)) ?? [];
            if(unsupportedFeatures.length){
                throw error(29,`Adapter does not support required feature(s): ${unsupportedFeatures.join(", ")}.`,"Check adapter.features before requesting the device or remove unsupported required features.");
            }
            return this.#dvCached = new DeviceControls(await adapter.requestDevice({
                requiredFeatures: options?.required?.features,
                requiredLimits: options?.required?.limits,
                defaultQueue: options?.defaultQueue
            }).catch(()=>{
                throw error(30,"Failed to request a GPU device from the adapter.","Verify the required features and limits are valid for the selected adapter.");
            }))
        }
        this.features = adapter.features
        this.limits = adapter.limits
        this.adapter=adapter;
    }
    #dvCached?:DeviceControls
    readonly info
    readonly features
    readonly limits
    adapter
    device
    get Device(){
        return this.device()
    }
}
export default AdapterControls
interface DEVICE_REQUEST {
    required?: {
        features?: GPUFeatureName[],
        limits?: Record<string,GPUSize64|undefined>
    },
    defaultQueue?: GPUQueueDescriptor
}
