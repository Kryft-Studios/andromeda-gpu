//ignore vscode ide errors here
import BindGroupLayoutCreator from "../sub/data/bindGroupLayout";
import BufferCreator, { BUFFER_CONSTRUCTION_OPTIONS } from "../sub/data/buffers";
import PipelineLayoutCreator, { PIPELINE_LAYOUT_OPTIONS } from "../sub/pipeline/pipelineLayout";
import RenderPipelineCreator, { RENDER_PIPELINE_OPTIONS } from "../sub/pipeline/renderPipeline";
import SamplerCreator from "../sub/pipeline/sampler";
import ShaderModuleCreator, { SHADER_MODULE_OPTIONS } from "../sub/data/shaderModule";
import TextureCreator, { TEXTURE_CREATOR_OPTIONS } from "../sub/data/texture";
import BindGroupCreator, { BIND_GROUP_OPTIONS } from "../sub/data/bindGroup";
import ComputePipelineCreator, { COMPUTE_PIPELINE_OPTION } from "../sub/pipeline/computePipeline";
import error from "../../helpers/errors";
import QuerySetCreator from "../sub/pipeline/querySet";
import RenderBundleEncoderCreator  from "../sub/pipeline/renderBundleEncoder";
import {brand} from "@agpu/helpers/decorators";
import { BRAND, RAW } from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import CommandBufferCreator from "../sub/data/commandbuffer";
import CommandEncoderCreator from "../sub/pipeline/commandEncoder";

// eslint-disable-next-line
export interface DeviceControls extends BRAND<"DeviceControls">,RAW<GPUDevice>{};
/**
 * Main entry point for creating high-level wrapper classes around a
 * {@link GPUDevice}.
 */
@brand("DeviceControls")
@raw("device")
export class DeviceControls {

    /**
     *  Constructs a new DeviceControls instance.
     */
    constructor(device: GPUDevice) {
        this.#device = device;
        this.device=device;
        this.Buffer = class Buffer extends BufferCreator {
            constructor(options?: BUFFER_CONSTRUCTION_OPTIONS) {
                super(device, options)
            }
            static async from(buf: GPUBuffer) {
                if (!(buf.usage & GPUBufferUsage.MAP_READ)) {
                    throw error(18, "Buffer is not MAP_READ compatible", "Ensure GPUBufferUsage.MAP_READ was set during creation.");
                }
                await buf.mapAsync(GPUMapMode.READ);
                const arrayBuffer = buf.getMappedRange();
                const value = arrayBuffer.slice(0);
                buf.unmap();
                const creator = new BufferCreator(device, {
                    value,
                    usage:buf.usage
                });
                return creator;
            }
        };
        const self = this
        this.Texture = class Texture extends TextureCreator {
            constructor(options: TEXTURE_CREATOR_OPTIONS) {
                super(device, options)
            }
            static async fromURL(
                url: string
            ): Promise<TextureCreator> {
                const response = await fetch(url);
                const blob = await response.blob();
                const bitmap = await createImageBitmap(blob);

                const texture = new self.Texture({
                    size: [bitmap.width, bitmap.height, 1],
                    format: 'rgba8unorm',
                    usage: GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT
                });

                device.queue.copyExternalImageToTexture(
                    { source: bitmap },
                    { texture: texture.raw() },
                    [bitmap.width, bitmap.height]
                );

                return texture;
            }
            static from(gputexture: GPUTexture) {
                return new TextureCreator(device, gputexture)
            }
            static async fromBitmap(bitmap: ImageBitmap) {
                const texture = new self.Texture({
                    size: [bitmap.width, bitmap.height, 1],
                    format: 'rgba8unorm',
                    usage: GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT
                });

                device.queue.copyExternalImageToTexture(
                    { source: bitmap },
                    { texture: texture.raw() },
                    [bitmap.width, bitmap.height]
                );

                return texture;
            }
        }
        this.Sampler = class Sampler extends SamplerCreator {
            constructor(options: GPUSamplerDescriptor = {
                "magFilter": "linear",
                "minFilter": "linear"
            }) {
                super(device, options)
            }
            static from(sampler: GPUSampler) {
                return new SamplerCreator(device, sampler)
            }
        }
        this.ShaderModule = class ShaderModule extends ShaderModuleCreator {
            constructor(code: string, options?: SHADER_MODULE_OPTIONS) {
                super(device, code, options)
            }
            static from(sm: GPUShaderModule) {
                return new ShaderModuleCreator(device, sm)
            }
        }
        this.RenderPipeline = class RenderPipeline extends RenderPipelineCreator {
            constructor(options: RENDER_PIPELINE_OPTIONS) {
                super(device, options)
            }
            static from(grp: GPURenderPipeline) {
                return new RenderPipelineCreator(device, grp)
            }
        }
        this.BindGroupLayout = class BindGroupLayout extends BindGroupLayoutCreator {
            constructor(options: GPUBindGroupLayoutDescriptor) {
                super(device, options)
            }
            static from(bgl: GPUBindGroupLayout) { return new BindGroupLayoutCreator(device, bgl) }
        }
        this.PipelineLayout = class PipelineLayout extends PipelineLayoutCreator {
            constructor(options: PIPELINE_LAYOUT_OPTIONS = {}) {
                super(device, options)
            }
            static from(pl: GPUPipelineLayout) {
                return new PipelineLayoutCreator(device, pl)
            }
        }

        this.BindGroup = class BindGroup extends BindGroupCreator {
            constructor(options: BIND_GROUP_OPTIONS) {
                super(device, options)
            }
            static from(bindGroup: GPUBindGroup) {
                return new BindGroupCreator(device, bindGroup)
            }
        }
        this.ComputePipeline = class ComputePipeline extends ComputePipelineCreator {
            constructor(options: COMPUTE_PIPELINE_OPTION) {
                super(device, options)
            }
            static from(computePipeline: GPUComputePipeline) {
                return new ComputePipelineCreator(device, computePipeline)
            }
        }
        this.QuerySet = class QuerySet extends QuerySetCreator {
            constructor(options:GPUQuerySetDescriptor){
                super(device,options)
            }
        }
        this.RenderBundleEncoder = class RenderBundleEncoder extends RenderBundleEncoderCreator {
            constructor(options:GPURenderBundleEncoderDescriptor){
                super(device,device.createRenderBundleEncoder(options))
            }
        }
        this.CommandEncoder = class CommandEncoder extends CommandEncoderCreator {
            constructor(label?:string) {
                super(device,label)
            }
            static from(cmdencoder:GPUCommandEncoder) {
                return new CommandEncoderCreator(device,cmdencoder)
            }
        }
    }
    readonly queue = {
        submit:(commandBuffers:CommandBufferCreator[])=>{
            if(!Array.isArray(commandBuffers)||commandBuffers.length===0){
                throw error(34,"queue.submit requires at least one CommandBufferCreator.","Finish a command encoder first and pass the resulting command buffer(s) to queue.submit(...).");
            }
            return this.#device.queue.submit(commandBuffers.map(a=>a.raw()));
        },
        on:(event:"submittedWorkDone",fn:Function)=>{
            if(event!=="submittedWorkDone")throw error(35,`Unsupported queue event: ${String(event)}.`,"Use queue.on('submittedWorkDone', callback).");
            this.#device.queue.onSubmittedWorkDone().then(()=>fn())
        }
    }

    #device: GPUDevice;
    device:GPUDevice
    readonly Buffer;
    readonly Texture
    readonly Sampler
    readonly ShaderModule
    readonly BindGroupLayout
    readonly BindGroup
    readonly RenderPipeline
    readonly ComputePipeline
    readonly PipelineLayout
    readonly QuerySet
    readonly RenderBundleEncoder:{new(options:GPURenderBundleEncoderDescriptor):RenderBundleEncoderCreator}
    readonly CommandEncoder
}   
export default DeviceControls;

/**@type {GPUDevice["createCommandEncoder"]} */
