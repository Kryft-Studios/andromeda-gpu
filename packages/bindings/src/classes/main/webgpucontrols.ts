/// <reference types="@webgpu/types" />

import {brand}from "@agpu/helpers/decorators";
import error from "../../helpers/errors";
import { BRAND } from "@agpu/helpers/decorators";
import AdapterControls from "./adapter";
import { ContextControls } from "./context";
import "@webgpu/types";
// eslint-disable-next-line
interface WebGPUControls extends BRAND<"WebGPUControls"> {};

@brand("WebGPUControls") class WebGPUControls {
    constructor(canvas:HTMLCanvasElement){
        if(!navigator.gpu)throw error(24,"WebGPU not supported!")
        if(!(canvas instanceof HTMLCanvasElement))throw error(26,"WebGPUControls requires a HTMLCanvasElement.","Pass a real <canvas> element when constructing WebGPUControls.")
        this.#pcfCached = navigator.gpu.getPreferredCanvasFormat()
    this.cv=canvas;
    }
    readonly cv
    #pcfCached:GPUTextureFormat
    preferredCanvasFormat(){return this.#pcfCached}
    context(){
        let ctx = this.cv.getContext("webgpu")
        if(!ctx)throw error(27,"Failed to acquire a WebGPU canvas context.","Ensure the canvas supports getContext('webgpu') and has not been initialized with a different context type.");
        else return new ContextControls(ctx);
    };
    get Context(){
        return this.context()
    }
    #adCached?:AdapterControls
    get Adapter():Promise<AdapterControls>{
        if(this.#adCached)return Promise.resolve(this.#adCached);
        return navigator.gpu.requestAdapter().then(a=>{
            if(!a)throw error(25,"navigator.gpu.requestAdapter returned null")
            return this.#adCached=new AdapterControls(a)
        }).catch((cause)=>{
            if(cause instanceof Error&&"code"in cause)throw cause;
            throw error(28,"Failed to acquire a GPU adapter.","Ensure a compatible WebGPU adapter is available and the browser has permission to use it.");
        })
    }
}
export default WebGPUControls
