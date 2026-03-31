import brand from "../../../helpers/decorators/brand";
import error from "../../../helpers/errors";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../helpers/types/unsure";
import DeviceControls from "../../main/device";
import BindGroupLayoutCreator from "../data/bindGroupLayout";
import ShaderModuleCreator from "../data/shaderModule";
import PipelineLayoutCreator from "./pipelineLayout";

const defaultPrimitiveState: GPUPrimitiveState = {
    topology: "triangle-list",
    frontFace: "ccw", 
    cullMode: "back", 
};
const defaultDepthStencil: DEPTH_STENCIL = {
    format: "depth24plus",
    depth: {
        write:true,
        compare:"less"
    }
};
const defaultMultiSample: GPUMultisampleState = {
    count: 4,
    alphaToCoverageEnabled: false,
};
// eslint-disable-next-line
export interface RenderPipelineCreator extends RAW<Promise<GPURenderPipeline>>, BRAND<"RenderPipelineCreator"> {
    label(): Promise<UNSURE<string>>;
    label<T extends string>(label: T): Promise<T>;
}
/**
 * Wrapper around {@link GPURenderPipeline}.
 */
@brand("RenderPipelineCreator")
@raw("pipeline")
@labeling({
    get: (instance: RenderPipelineCreator) => Promise.resolve(instance.labelValue),
    set: async (instance: RenderPipelineCreator, label) => (await instance.pipeline).label = instance.labelValue = label
})
export class RenderPipelineCreator {
    #device:GPUDevice
    #options?:RENDER_PIPELINE_OPTIONS
    #pipeline:Promise<GPURenderPipeline>
    #label?:string
    #gblcache:Record<number,InstanceType<DeviceControls["BindGroupLayout"]>>={}
    #initWaiters:((bool:boolean)=>any)[]=[]
    #pipelineCreated:boolean=false;
    #pipelineInitFailed:boolean=false;
    pipeline: Promise<GPURenderPipeline>
    labelValue?: string
    constructor(device: GPUDevice, optionsOrPipeline: RENDER_PIPELINE_OPTIONS | GPURenderPipeline) {
        this.#device = device
        let $ = { ...{ multisample: defaultMultiSample, depthStencil: defaultDepthStencil, primitive: defaultPrimitiveState } }
        if(!(optionsOrPipeline instanceof GPURenderPipeline)){this.#options=$={...$,...optionsOrPipeline}}
        this.#label=optionsOrPipeline.label

        if (optionsOrPipeline instanceof GPURenderPipeline) {
            this.#pipelineCreated = true;
            this.#pipeline = Promise.resolve(optionsOrPipeline);
        } else if (optionsOrPipeline?.async) {
            this.#pipeline = device.createRenderPipelineAsync(this.#buildPipelineDescriptor())
                .then((pipeline) => {
                    this.#pipelineCreated = true;
                    this.#pipelineInitFailed = false;
                    this.#flushInitWaiters(true);
                    return pipeline;
                })
                .catch((cause) => {
                    this.#pipelineCreated = false;
                    this.#pipelineInitFailed = true;
                    this.#flushInitWaiters(false);
                    throw cause;
                });
        } else {
            this.#pipelineCreated = true;
            this.#pipelineInitFailed = false;
            this.#pipeline = Promise.resolve(device.createRenderPipeline(this.#buildPipelineDescriptor()));
        }
        this.pipeline = this.#pipeline
        this.labelValue = this.#label
    }
    #flushInitWaiters(success:boolean){
        const waiters = this.#initWaiters.splice(0);
        waiters.forEach(waiter=>waiter(success));
    }
    #buildVertexState(){

        // @ts-ignore
        let module = this.#options.vertex.module
        let state:GPUVertexState = {
            module:module.raw()
        }
        let entryPoint = module.entryPoint()
        if(entryPoint)state.entryPoint=entryPoint
        let constants = module.constants()
        if(constants)state.constants=constants

        // @ts-ignore
        let buffers = this.#options.vertex.buffers
        if(buffers)state.buffers=buffers;
        return state
    }
    #buildFragmentState(){
        //@ts-ignore
        let module = this.#options.fragment.module
        let state:GPUFragmentState = {
            module:module.raw(),

            // @ts-ignore
            targets:this.#options.fragment.targets
        }
        let entryPoint = module.entryPoint()
        if(entryPoint)state.entryPoint=entryPoint
        let constants = module.constants()
        if(constants)state.constants=constants
        return state
    }
    #buildDepthStencil(depthstencil?:DEPTH_STENCIL):GPUDepthStencilState{
        if(!depthstencil)return {format:"depth24plus"}
        return {
            format:depthstencil.format,
            depthWriteEnabled:depthstencil.depth?.write,
            depthCompare:depthstencil.depth?.compare,
            stencilBack:depthstencil.stencil?.back,
            stencilFront:depthstencil.stencil?.front,
            stencilReadMask:depthstencil.stencil?.mask?.read,
            stencilWriteMask:depthstencil.stencil?.mask?.write,
            depthBias:depthstencil.depthBias?.value,
            depthBiasClamp:depthstencil.depthBias?.clamp,
            depthBiasSlopeScale:depthstencil.depthBias?.slopeScale
        }
    }
    #buildPipelineDescriptor(){
        if(!this.#options?.vertex?.module){
            throw error(40,"RenderPipeline requires a vertex shader module.","Pass vertex.module when constructing RenderPipelineCreator.");
        }
        if(!this.#options?.layout){
            throw error(41,"RenderPipeline requires a pipeline layout or auto layout mode.","Pass a PipelineLayout wrapper or a valid GPUAutoLayoutMode.");
        }
        let descriptor: GPURenderPipelineDescriptor = {

            // @ts-ignore
            layout:this.#options.layout.raw()??this.#options?.layout,
            vertex:this.#buildVertexState()
        }
        // @ts-ignore
        if(this.#options.fragment?.module){
            descriptor.fragment=this.#buildFragmentState()
        }
        // @ts-ignore
        if(this.#options.depthStencil){
            descriptor.depthStencil=this.#buildDepthStencil(this.#options?.depthStencil)
        }
        // @ts-ignore
        if(this.#options.multisample){
            // @ts-ignore
            descriptor.multisample = this.#options.multisample
        }
        // @ts-ignore
        if(this.#options.primitive){
            // @ts-ignore
            descriptor.primitive=this.#options.primitive
        }
        // @ts-ignore
        if(this.#options.label){
            // @ts-ignore
            descriptor.label=this.#options.label
        }
        return descriptor
    }

    /**
     * Wait for the pipeline to resolve/reject
     */
    init(){
        if(this.#pipelineCreated)return Promise.resolve(true)
        if(this.#pipelineInitFailed)return Promise.reject(error(42,"RenderPipeline initialization failed.","Inspect the pipeline descriptor, shader entry points, and GPU validation messages for the original failure."));
        return new Promise((resolve,reject)=>{
            this.#initWaiters.push(a=>{
                if(a)resolve(a)
                else reject(a)
            })
        })
    }
    /**
     * Represents {@link GPUPipelineBase.getBindGroupLayout}
     */
    async bindGroupLayout(index:number) {
        if(this.#gblcache[index])return this.#gblcache[index] 
        return this.#gblcache[index] = new BindGroupLayoutCreator(this.#device,(await this.#pipeline).getBindGroupLayout(index)) as InstanceType<DeviceControls["BindGroupLayout"]>
    }

}

export interface RENDER_PIPELINE_OPTIONS extends GPUObjectDescriptorBase {

    /** {@link GPURenderPipelineDescriptor.vertex} */
    vertex: VERTEX_STATE

    /** {@link GPURenderPipelineDescriptor.primitive} */
    primitive?:GPUPrimitiveState

    /** {@link GPURenderPipelineDescriptor.depthStencil} */
    depthStencil?:DEPTH_STENCIL

    /** {@link GPURenderPipelineDescriptor.multisample} */
    multisample?: GPUMultisampleState

    /** {@link GPURenderPipelineDescriptor.fragment} */
    fragment?:FRAGMENT_STATE

    /**{@link GPUPipelineDescriptorBase.layout} */
    layout:  InstanceType<DeviceControls["PipelineLayout"]>|PipelineLayoutCreator| GPUAutoLayoutMode;

    /**Whether to create the pipeline async */
    async?:boolean
}

/**
 * Depth/stencil configuration used when creating render pipelines.
 */
export interface DEPTH_STENCIL {
    format:GPUTextureFormat
    depth?: {
        write?:boolean
        compare?:GPUCompareFunction
    }
    stencil?:{
        front?:STENCIL_FACE_STATE
        back?:STENCIL_FACE_STATE
        mask?:{
            read?:GPUStencilValue
            write?:GPUStencilValue
        }
    }
    depthBias?: {
        value?:GPUDepthBias
        slopeScale?:number;
        clamp?:number;
    }
}

/**
 * Stencil-face state used by {@link DEPTH_STENCIL}.
 */
export interface STENCIL_FACE_STATE {
    compare?:GPUCompareFunction
    operation?: {
        fail?:GPUStencilOperation
        depthFail?:GPUStencilOperation
        pass?:GPUStencilOperation
    }
}

/**
 * Vertex stage configuration used by {@link RENDER_PIPELINE_OPTIONS}.
 */
export interface VERTEX_STATE extends PROGRAMMABLE_STAGE {

    /**{@link GPUVertexState.buffers} */
    buffers?: Iterable<UNSURE<GPUVertexBufferLayout>>;
}

/**
 * Shared programmable stage configuration.
 */
export interface PROGRAMMABLE_STAGE {

    /**{@link DeviceControls.ShaderModule} */
    module: InstanceType<DeviceControls["ShaderModule"]>|ShaderModuleCreator
}

/**
 * Fragment stage configuration used by {@link RENDER_PIPELINE_OPTIONS}.
 */
export interface FRAGMENT_STATE extends PROGRAMMABLE_STAGE {
    /**{@link GPUFragmentState.targets} */
    targets: Iterable<GPUColorTargetState>;
}
export default RenderPipelineCreator
