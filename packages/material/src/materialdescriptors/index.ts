import getBlendOptions from "./blendoptions";
import { VertexFormatOffsetLookup } from "./lookups";
import { getGBMetadata, getLocationsMetadata, getStructs } from "./shaderparse";
import { WebGPUControls } from "@agpu/bindings";
type DEVICE = Awaited<ReturnType<Awaited<WebGPUControls["Adapter"]>["device"]>>
class MaterialDescriptor {
    /**Given bindings in the shader.*/
    readonly bindings
    /**Shader locations in the shader.*/
    readonly locations
    /**Source code of the material descriptor*/
    readonly code
    /**Label of the material descriptor*/
    readonly label
    /**Properties of the material descriptor*/
    readonly properties
    /**Structs in the material descriptor*/
    readonly structs:MaterialDescriptor.STRUCTS[]
    /**Blend options for the shader of the material descriptor */
    readonly blend
    #pipeline?: InstanceType<DEVICE["RenderPipeline"]>
    /**Constructs a new MaterialDescriptor in AGPU. Most of the options are handled automatically via parsing|defaulting.*/
    constructor(controls: DEVICE, code: string, options: MaterialDescriptor.OPTIONS) {
        if (!options.bindings) this.bindings = getGBMetadata(code);
        else this.bindings = options.bindings
        if (!options.locations) this.locations = getLocationsMetadata(code);
        else this.locations = options.locations
        if (!options.label) this.label = "Unknown"
        else this.label = options.label
        if (!options.structs) this.structs = getStructs(code)
        else this.structs = options.structs
        if(!options.blend)this.blend = [MaterialDescriptor.DEFAULT_FRAGMENT_TARGET]
        else this.blend = getBlendOptions(options.blend)
        this.properties = options.properties
        this.code = code;
        this.#device = controls;
    }
    searchPropertyType(){}
    /**THE DEVICE */
    #device: DEVICE
    /**Returns the pipeline of the material descriptor.*/
    get pipeline(): InstanceType<DEVICE["RenderPipeline"]> {
        if (this.#pipeline) return this.#pipeline;

        let currentOffset = 0;
        const attributes = this.locations.map(a => {
            const attribute = {
                format: a.type,
                shaderLocation: a.location,
                offset: currentOffset
            };
            currentOffset += VertexFormatOffsetLookup[a.type];
            return attribute;
        });

        const totalStride = currentOffset;

        return this.#pipeline = new this.#device.RenderPipeline({
            "vertex": {
                "module": this.shaderModule,
                buffers: [{
                    arrayStride: totalStride,
                    "attributes": attributes
                }]
            },
            "fragment": {
                "module": this.shaderModule,
                targets: this.blend
            },
            "layout": "auto",
        });
    }
    #sm?: InstanceType<DEVICE["ShaderModule"]>
    /**The shader module of the material descriptor.*/
    get shaderModule(): InstanceType<DEVICE["ShaderModule"]> {
        if (this.#sm) return this.#sm;
        else {
            this.#device.device.pushErrorScope("validation")
            this.#sm = new this.#device.ShaderModule(this.code, { "label": this.label })
            this.#device.device.popErrorScope().then(e=>{
                if(e)console.error("Error while creating shader module for the material descriptor"+this.label)
            })
            return this.#sm
        }}
}
namespace MaterialDescriptor {
    export interface SHADER_LOCATION {
        location: number;
        type: GPUVertexFormat;
    }
    export interface BINDING {
        binding: number;
        group: number;
        type: `vec${2 | 3 | 4}${"f" | "h" | "i" | "u"}`;
    }
    export interface OPTIONS extends GPUObjectDescriptorBase {
        bindings?: BINDING[],
        locations?: SHADER_LOCATION[],
        properties: Record<string, PROPERTY_REF>,
        structs?: STRUCTS[],
        blend?:BLEND_TARGET[]
    }
    export type INT_BLEND_TARGET =  {
        state?: {
            color?: BLEND_STATE.COLOR,
            alpha?:BLEND_STATE.ALPHA
        },
        format?:"default"|GPUTextureFormat,
        mask: keyof typeof MASKS
    }
    export type BLEND_TARGET =INT_BLEND_TARGET | GPUColorTargetState
    export namespace BLEND_STATE {
        export interface ALPHA {
            source?: BLEND_FACTOR.ALPHA,
            destination?:BLEND_FACTOR.ALPHA,
            operation?: GPUBlendOperation
        }
        export interface COLOR {
            source?: BLEND_FACTOR.COLOR,
            destination?: BLEND_FACTOR.COLOR,
            operation?: GPUBlendOperation
        }
    }
    export type PROPERTY_REF =
        | { group: number; binding: number; type: "uniform" | "storage" | "texture" | "sampler" }
        | { location: number; type: "vertex" };
    export interface STRUCTS {
        name: string,
        fields: { tag: undefined | string, name: string, type: `vec${2 | 3 | 4}${"f" | "h" | "i" | "u"}` }[]
    }
    export const MASKS = {all:GPUColorWrite.ALL,red:GPUColorWrite.RED,blue:GPUColorWrite.BLUE,green:GPUColorWrite.GREEN,alpha:GPUColorWrite.ALPHA} as const;
    export namespace BLEND_FACTOR {
        export type ALPHA = {
            use: "blend-constant" | "previous-alpha", 
            operation?: "one-minus"|"none"
        } | {
            use: "zero" | "one";
            operation?: "none";
        } | {
            use: "fragment-shader-alpha";
            operation?: "one-minus" | "saturate" | "none";
        }
        export type COLOR = ALPHA | {
            use: "previous-full" | "fragment-shader-full",
            operation?: "one-minus"|"none"; 
        }
    }
    export const DEFAULT_FRAGMENT_TARGET: GPUColorTargetState = {
    format: navigator.gpu.getPreferredCanvasFormat(),
    blend: {
        color: {
            operation: "add",          
            srcFactor: "src-alpha",         
            dstFactor: "one-minus-src-alpha" 
        },
        alpha: {
            operation: "add",
            srcFactor: "one",         
            dstFactor: "one-minus-src-alpha"
        }
    },
    writeMask: GPUColorWrite.ALL
};
}

export default MaterialDescriptor;

/*
        Use this in renderer logic if wanted
        I accidently created this:
        
        if(this.#bg)return this.#bg;
        const group:number[] = [];
        const done:Record<number,boolean> = {};
        [...this.bindings].map(a=>{
            if(done[a.group])return;
            done[a.group]=true;
            group.push(a.group)
        })
        const bg:Record<number,number[]> = {}
        for(let i = 0 ; i < group.length; i++){
            bg[group[i]] = this.bindings.filter(a=>{
                if(a.group===group[i])return true;
            }).map(a=>a.binding)
        }
        const bindgroups = []
        for(const [key,value] of Object.entries(bg)){
            for (let i=0;i<value.length;i++){
                bindgroups.push(new this.#device.BindGroup())
            }
        }*/
       