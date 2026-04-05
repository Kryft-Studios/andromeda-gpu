/// <reference types="@webgpu/types" />
/**
 * **@agpu/bindings**
 * @packageDocumentation
 * The main bindings package for andromedagp
 */

import BufferUsage from "./constants/bufferusage";
import TextureUsage from "./constants/textureusage";
import WebGPUControls from "./classes/main/webgpucontrols";
import DeviceControls from "./classes/main/device";
import AdapterControls from "./classes/main/adapter";
import { ContextControls } from "./classes/main/context";
import CommandBufferCreator from "./classes/sub/data/commandbuffer";
import BufferCreator from "./classes/sub/data/buffers";
import SamplerCreator from "./classes/sub/pipeline/sampler";
import TextureCreator from "./classes/sub/data/texture";
import QuerySetCreator from "./classes/sub/pipeline/querySet";
import BindGroupCreator from "./classes/sub/data/bindGroup";
import RenderPassCreator from "./classes/sub/pipeline/commandEncoder/renderPass";
import ComputePassCreator from "./classes/sub/pipeline/commandEncoder/computepass";
import TextureViewCreator from "./classes/sub/data/texture/textureView";
import RenderBundleCreator from "./classes/sub/pipeline/renderBundleEncoder/renderBundle";
import ShaderModuleCreator from "./classes/sub/data/shaderModule";
import CommandEncoderCreator from "./classes/sub/pipeline/commandEncoder";
import IndirectBufferCreator from "./classes/sub/pipeline/commandEncoder/renderPass/indirectBuffer";
import PipelineLayoutCreator from "./classes/sub/pipeline/pipelineLayout";
import RenderPipelineCreator from "./classes/sub/pipeline/renderPipeline";
import BindGroupLayoutCreator from "./classes/sub/data/bindGroupLayout";
import ComputePipelineCreator from "./classes/sub/pipeline/computePipeline";
type ADAPTER = Awaited<WebGPUControls["Adapter"]>
type DEVICE = Awaited<ADAPTER["Device"]>
type CONTEXT = WebGPUControls["Context"]
type TEXTURE = InstanceType<DEVICE["Texture"]>
type QUERY_SET = InstanceType<DEVICE["QuerySet"]>
type COMMAND_ENCODER = InstanceType<DEVICE["CommandEncoder"]>
type BUFFER = InstanceType<DEVICE["Buffer"]>
type BIND_GROUP = InstanceType<DEVICE["BindGroup"]>
type BIND_GROUP_LAYOUT = InstanceType<DEVICE["BindGroupLayout"]>
type SAMPLER = InstanceType<DEVICE["Sampler"]>
type RENDER_PIPELINE = InstanceType<DEVICE["RenderPipeline"]>
type COMPUTE_PIPELINE = InstanceType<DEVICE["ComputePipeline"]>
type SHADER_MODULE = InstanceType<DEVICE["ShaderModule"]>
type PIPELINE_LAYOUT = InstanceType<DEVICE["PipelineLayout"]>
export {
    SAMPLER,RENDER_PIPELINE,COMPUTE_PIPELINE,SHADER_MODULE,PIPELINE_LAYOUT,
    TEXTURE, BUFFER, BIND_GROUP, BIND_GROUP_LAYOUT, QUERY_SET, COMMAND_ENCODER,
    WebGPUControls,
    BufferUsage,
    TextureUsage,
    DeviceControls,
    AdapterControls,
    ADAPTER,
    DEVICE,
    ContextControls,
    CONTEXT,
    /**Internal class. exported for types */
    TextureCreator,
    /**Internal class. exported for types */
    QuerySetCreator,
    /**Internal class. exported for types */
    CommandBufferCreator,
    /**Internal class. exported for types */
    CommandEncoderCreator,
    /**Internal class. exported for types */
    BufferCreator,
    /**Internal class. exported for types */
    SamplerCreator,
    /**Internal class. exported for types */
    BindGroupCreator,
    /**Internal class. exported for types */
    BindGroupLayoutCreator,
    /**Internal class. exported for types */
    RenderPassCreator,
    /**Internal class. exported for types */
    RenderPipelineCreator,
    /**Internal class. exported for types */
    ComputePassCreator,
    /**Internal class. exported for types */
    ComputePipelineCreator,
    /**Internal class. exported for types */
    TextureViewCreator,
    /**Internal class. exported for types */
    RenderBundleCreator,
    /**Internal class. exported for types */
    ShaderModuleCreator,
    /**Internal class. exported for types */
    IndirectBufferCreator,
    /**Internal class. exported for types */
    PipelineLayoutCreator
}
