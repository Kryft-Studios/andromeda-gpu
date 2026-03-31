import brand from "../../../../helpers/decorators/brand";
import raw from "../../../../helpers/decorators/raw";
import labeling from "../../../../helpers/decorators/labelling";
import error from "../../../../helpers/errors";
import { BRAND, LABEL, RAW } from "../../../../helpers/types/decoratorHelpers";
import DC_MEMBER from "../../../../helpers/types/DCMember";
import UNSURE from "../../../../helpers/types/unsure";
import BindGroupCreator from "../../data/bindGroup";
import BufferCreator from "../../data/buffers";
import ComputePipelineCreator from "../computePipeline";
import QuerySetCreator from "../querySet";
import IndirectBufferCreator, { INDIRECT_BUFFER_BINDING_OPTIONS, INDIRECT_BUFFER_OPTIONS } from "./renderPass/indirectBuffer";
// eslint-disable-next-line
export interface ComputePassCreator extends RAW<GPUComputePassEncoder>, BRAND<"ComputePassCreator">,LABEL{};
/**
 * Wrapper around {@link GPUComputePassEncoder}.
 */
@brand("ComputePassCreator")
@raw("cppass")
@labeling({
    get: (i: ComputePassCreator) => i.cppass.label,
    set: (i, label) => i.cppass.label = label
})
export class ComputePassCreator {
    #cppass
    cppass: GPUComputePassEncoder
    constructor(device:GPUDevice,cmdencoder:GPUCommandEncoder,options?:COMPUTE_PASS_OPTIONS){
        this.#cppass = cmdencoder.beginComputePass(this.#buildOptions(options))
        this.cppass=this.#cppass
        class IndirectBufferBase extends IndirectBufferCreator {
                    static readonly len: number = 1;
        
                    constructor(options: INDIRECT_BUFFER_OPTIONS) {
                        super(device, options);
                    }
        
                    static async from(buffer: BufferCreator | GPUBuffer) {
                        const bufCreator = buffer instanceof BufferCreator
                            ? buffer
                            : new BufferCreator(device, buffer);
        
                        const can = bufCreator.can;
                        const val = await bufCreator.value();
        
                        can.beBoundAs.indirect = true;
        
                        return new IndirectBufferCreator(device, {
                            value: val ?? new Uint32Array(this.len),
                            usage: {
                                copy: can.copy,
                                map: can.map,
                                buffer: can.beBoundAs as INDIRECT_BUFFER_BINDING_OPTIONS,
                                queryable: can.query
                            }
                        });
                    }
        }
        class DispatchWorkgroupIndirectBuffer extends IndirectBufferBase {
            static readonly len = 3
        }
        this.dispatchWorkgroup = Object.assign((x:number,y:number,z:number)=>{
            this.#cppass.dispatchWorkgroups(x,y,z)
        },{
            IndirectBuffer:DispatchWorkgroupIndirectBuffer,
            indirect:(buffer:DispatchWorkgroupIndirectBuffer,offset:number)=>{
                this.#cppass.dispatchWorkgroupsIndirect(buffer.raw(),offset)
            }
        })
        this.debug = {
                    push: (label: string) => {
                        this.#debugDepth++;
                        this.#cppass.pushDebugGroup(label)
                    },
                    pop: () => {
                        if (this.#debugDepth <= 0) throw error(17, "debug.pop used before init")
                        this.#cppass.popDebugGroup()
                        this.#debugDepth--
                    },
                    insertMarker: (label: string) => {
                        this.#cppass.insertDebugMarker(label)
                    }
        }
    }
    #debugDepth:number=0
    #buildOptions(options?:COMPUTE_PASS_OPTIONS):GPUComputePassDescriptor{
        if(!options)return {}
        
        let a:{timestampRewrites?:GPUComputePassDescriptor["timestampWrites"],label?:string} = {
            label:options.label
        }
        if(options.timestampRewrites){
            a.timestampRewrites = {
                querySet:options.timestampRewrites.querySet.raw(),
                beginningOfPassWriteIndex:options.timestampRewrites.passWriteIndex?.beginning,
                endOfPassWriteIndex:options.timestampRewrites.passWriteIndex?.end
            }
        }
        return a;
    }
    /**
     * Mirrors `setBindGroup` for the compute pass.
     */
    bindGroup(
        index: number,
        bindGroup: BindGroupCreator | DC_MEMBER<"BindGroup">,
        dynamicOffsets?: number[] | Uint32Array,
        dynamicOffsetData?: ComputePassCreator.bindGroup.DYNAMIC_OFFSET_DATA
    ) {
        if (dynamicOffsetData) {
            this.#cppass.setBindGroup(index, bindGroup.raw(), dynamicOffsets as Uint32Array, dynamicOffsetData.start, dynamicOffsetData.len);
        } else {
            this.#cppass.setBindGroup(index, bindGroup.raw());
        }
    }
    #pipeline?:ComputePipelineCreator
    /**
     * Getter/Setter for the current compute pipeline wrapper.
     */
    async pipeline():Promise<UNSURE<ComputePipelineCreator>>
    async pipeline<T extends ComputePipelineCreator|DC_MEMBER<"ComputePipeline">>(pipeline:T):Promise<T>
    async pipeline<T extends ComputePipelineCreator|DC_MEMBER<"ComputePipeline">>(pipeline?:T):Promise<T|UNSURE<ComputePipelineCreator>>{
        if(typeof pipeline === "undefined")return this.#pipeline
        this.#cppass.setPipeline(await pipeline.raw())
        return this.#pipeline = pipeline;
    }
    dispatchWorkgroup
    /**
     * Ends the underlying compute pass encoder.
     */
    end(){
        this.#cppass.end()
    }
    readonly debug
}
export namespace ComputePassCreator {
    export namespace bindGroup {
        export interface DYNAMIC_OFFSET_DATA {
            start: number,
            len: number
        }
    }
}
export default ComputePassCreator;

/**
 * Options used to configure a compute pass.
 */
export interface COMPUTE_PASS_OPTIONS extends GPUObjectDescriptorBase {
    timestampRewrites?:TIMESTAMP_REWRITES
}

/**
 * Timestamp query writes emitted at the start and/or end of a compute pass.
 */
export interface TIMESTAMP_REWRITES {
    querySet:QuerySetCreator|DC_MEMBER<"QuerySet">,
    passWriteIndex?: {
        beginning?:number,
        end?:number
    }
}
