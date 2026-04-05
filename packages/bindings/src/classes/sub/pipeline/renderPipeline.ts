/// <reference types="@webgpu/types" />

import {brand} from "@agpu/helpers/decorators";
import error from "../../../helpers/errors";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import { BRAND, RAW } from "@agpu/helpers/decorators";
import UNSURE from "@agpu/helpers/unsure";
import DeviceControls from "../../main/device";
import BindGroupLayoutCreator from "../data/bindGroupLayout";
import ShaderModuleCreator from "../data/shaderModule";
import PipelineLayoutCreator from "./pipelineLayout";
import "@webgpu/types";
const defaultPrimitiveState: GPUPrimitiveState = {
    topology: "triangle-list",
    frontFace: "ccw",
    cullMode: "back",
};
const defaultDepthStencil: DEPTH_STENCIL = {
    format: "depth24plus",
    depth: {
        write: true,
        compare: "less"
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
    get: async (instance: RenderPipelineCreator) => (await instance.pipeline).label,
    set: async (instance: RenderPipelineCreator, label) => (await instance.pipeline).label = label
})
export class RenderPipelineCreator {
    #device?: GPUDevice
    #options?: RENDER_PIPELINE_OPTIONS
    #gblcache: Record<number, InstanceType<DeviceControls["BindGroupLayout"]>> = {}
    #initWaiters: ((bool: boolean) => any)[] = []
    #pipelineCreated: boolean = false;
    #pipelineInitFailed: boolean = false;
    pipeline: Promise<GPURenderPipeline>
    constructor(device: GPUDevice, optionsOrPipeline: RENDER_PIPELINE_OPTIONS | GPURenderPipeline) {
        let $ = { ...{ multisample: defaultMultiSample, depthStencil: defaultDepthStencil, primitive: defaultPrimitiveState } }
        if (optionsOrPipeline instanceof GPURenderPipeline) {
            this.#pipelineCreated = true;
            this.pipeline = Promise.resolve(optionsOrPipeline);
        } else if (optionsOrPipeline?.async) {
            this.#device = device;
            this.#options = cloneRenderPipelineOptions(optionsOrPipeline);
            this.pipeline = device.createRenderPipelineAsync(this.#buildPipelineDescriptor({ ...$, ...optionsOrPipeline }))
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
            this.#device = device;
            this.#options = cloneRenderPipelineOptions(optionsOrPipeline);
            this.#pipelineCreated = true;
            this.#pipelineInitFailed = false;
            this.pipeline = Promise.resolve(device.createRenderPipeline(this.#buildPipelineDescriptor({ ...$, ...optionsOrPipeline })));
        }
        this.bindGroupLayout = async function (index: number) {
            if (this.#gblcache[index]) return this.#gblcache[index]
            return this.#gblcache[index] = new BindGroupLayoutCreator(device, (await this.pipeline).getBindGroupLayout(index)) as InstanceType<DeviceControls["BindGroupLayout"]>
        }
    }
    #flushInitWaiters(success: boolean) {
        const waiters = this.#initWaiters.splice(0);
        waiters.forEach(waiter => waiter(success));
    }
    #buildVertexState(opts: VERTEX_STATE) {

        // @ts-ignore
        let module = opts.vertex.module
        let state: GPUVertexState = {
            module: module.raw()
        }
        let entryPoint = module.entryPoint()
        if (entryPoint) state.entryPoint = entryPoint
        let constants = module.constants()
        if (constants) state.constants = constants

        // @ts-ignore
        let buffers = opts.vertex.buffers
        if (buffers) state.buffers = buffers;
        return state
    }
    #buildFragmentState(opts: FRAGMENT_STATE) {
        //@ts-ignore
        let module = opts.fragment.module
        let state: GPUFragmentState = {
            module: module.raw(),

            // @ts-ignore
            targets: opts.fragment.targets
        }
        let entryPoint = module.entryPoint()
        if (entryPoint) state.entryPoint = entryPoint
        let constants = module.constants()
        if (constants) state.constants = constants
        return state
    }
    #buildDepthStencil(depthstencil?: DEPTH_STENCIL): GPUDepthStencilState {
        if (!depthstencil) return { format: "depth24plus" }
        return {
            format: depthstencil.format,
            depthWriteEnabled: depthstencil.depth?.write,
            depthCompare: depthstencil.depth?.compare,
            stencilBack: depthstencil.stencil?.back,
            stencilFront: depthstencil.stencil?.front,
            stencilReadMask: depthstencil.stencil?.mask?.read,
            stencilWriteMask: depthstencil.stencil?.mask?.write,
            depthBias: depthstencil.depthBias?.value,
            depthBiasClamp: depthstencil.depthBias?.clamp,
            depthBiasSlopeScale: depthstencil.depthBias?.slopeScale
        }
    }
    #buildPipelineDescriptor(opts: RENDER_PIPELINE_OPTIONS) {
        if (!opts?.vertex?.module) {
            throw error(40, "RenderPipeline requires a vertex shader module.", "Pass vertex.module when constructing RenderPipelineCreator.");
        }
        if (!opts?.layout) {
            throw error(41, "RenderPipeline requires a pipeline layout or auto layout mode.", "Pass a PipelineLayout wrapper or a valid GPUAutoLayoutMode.");
        }
        let descriptor: GPURenderPipelineDescriptor = {

            // @ts-ignore
            layout: opts.layout.raw() ?? opts?.layout,
            vertex: this.#buildVertexState(opts.vertex)
        }
        // @ts-ignore
        if (opts.fragment?.module) {

            descriptor.fragment = this.#buildFragmentState(opts.fragment)
        }
        // @ts-ignore
        if (opts.depthStencil) {
            descriptor.depthStencil = this.#buildDepthStencil(opts?.depthStencil)
        }
        // @ts-ignore
        if (opts.multisample) {
            // @ts-ignore
            descriptor.multisample = opts.multisample
        }
        // @ts-ignore
        if (opts.primitive) {
            // @ts-ignore
            descriptor.primitive = opts.primitive
        }
        // @ts-ignore
        if (opts.label) {
            // @ts-ignore
            descriptor.label = opts.label
        }
        return descriptor
    }

    /**
     * Wait for the pipeline to resolve/reject
     */
    init() {
        if (this.#pipelineCreated) return Promise.resolve(true)
        if (this.#pipelineInitFailed) return Promise.reject(error(42, "RenderPipeline initialization failed.", "Inspect the pipeline descriptor, shader entry points, and GPU validation messages for the original failure."));
        return new Promise((resolve, reject) => {
            this.#initWaiters.push(a => {
                if (a) resolve(a)
                else reject(a)
            })
        })
    }
    /**
     * Represents {@link GPUPipelineBase.getBindGroupLayout}
     */
    bindGroupLayout

    /**
     * Recreates the render pipeline from its original descriptor when available.
     */
    clone(): RenderPipelineCreator {
        if (!this.#device || !this.#options) {
            throw new TypeError("Cannot clone a RenderPipelineCreator created from a raw GPURenderPipeline.");
        }
        return new RenderPipelineCreator(this.#device, cloneRenderPipelineOptions(this.#options));
    }
}

export interface RENDER_PIPELINE_OPTIONS extends GPUObjectDescriptorBase {

    /** {@link GPURenderPipelineDescriptor.vertex} */
    vertex: VERTEX_STATE

    /** {@link GPURenderPipelineDescriptor.primitive} */
    primitive?: GPUPrimitiveState

    /** {@link GPURenderPipelineDescriptor.depthStencil} */
    depthStencil?: DEPTH_STENCIL

    /** {@link GPURenderPipelineDescriptor.multisample} */
    multisample?: GPUMultisampleState

    /** {@link GPURenderPipelineDescriptor.fragment} */
    fragment?: FRAGMENT_STATE

    /**{@link GPUPipelineDescriptorBase.layout} */
    layout: InstanceType<DeviceControls["PipelineLayout"]> | PipelineLayoutCreator | GPUAutoLayoutMode;

    /**Whether to create the pipeline async */
    async?: boolean
}

/**
 * Depth/stencil configuration used when creating render pipelines.
 */
export interface DEPTH_STENCIL {
    format: GPUTextureFormat
    depth?: {
        write?: boolean
        compare?: GPUCompareFunction
    }
    stencil?: {
        front?: STENCIL_FACE_STATE
        back?: STENCIL_FACE_STATE
        mask?: {
            read?: GPUStencilValue
            write?: GPUStencilValue
        }
    }
    depthBias?: {
        value?: GPUDepthBias
        slopeScale?: number;
        clamp?: number;
    }
}

/**
 * Stencil-face state used by {@link DEPTH_STENCIL}.
 */
export interface STENCIL_FACE_STATE {
    compare?: GPUCompareFunction
    operation?: {
        fail?: GPUStencilOperation
        depthFail?: GPUStencilOperation
        pass?: GPUStencilOperation
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
    module: InstanceType<DeviceControls["ShaderModule"]> | ShaderModuleCreator
}

/**
 * Fragment stage configuration used by {@link RENDER_PIPELINE_OPTIONS}.
 */
export interface FRAGMENT_STATE extends PROGRAMMABLE_STAGE {
    /**{@link GPUFragmentState.targets} */
    targets: Iterable<GPUColorTargetState>;
}
export default RenderPipelineCreator
function cloneRenderPipelineOptions(options: RENDER_PIPELINE_OPTIONS): RENDER_PIPELINE_OPTIONS {
    return {
        ...options,
        vertex: {
            ...options.vertex,
            buffers: options.vertex.buffers ? Array.from(options.vertex.buffers) : undefined,
        },
        primitive: options.primitive ? { ...options.primitive } : undefined,
        depthStencil: cloneDepthStencil(options.depthStencil),
        multisample: options.multisample ? { ...options.multisample } : undefined,
        fragment: options.fragment ? {
            ...options.fragment,
            targets: Array.from(options.fragment.targets),
        } : undefined,
    };
}
function cloneDepthStencil(depthStencil?: DEPTH_STENCIL): DEPTH_STENCIL | undefined {
    if (!depthStencil) return undefined;
    return {
        ...depthStencil,
        depth: depthStencil.depth ? { ...depthStencil.depth } : undefined,
        stencil: depthStencil.stencil ? {
            front: depthStencil.stencil.front ? { ...depthStencil.stencil.front } : undefined,
            back: depthStencil.stencil.back ? { ...depthStencil.stencil.back } : undefined,
            mask: depthStencil.stencil.mask ? { ...depthStencil.stencil.mask } : undefined,
        } : undefined,
        depthBias: depthStencil.depthBias ? { ...depthStencil.depthBias } : undefined,
    };
}
