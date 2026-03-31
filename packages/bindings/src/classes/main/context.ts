import brand from "../../helpers/decorators/brand";
import error from "../../helpers/errors";
import raw from "../../helpers/decorators/raw";
import { BRAND, RAW } from "../../helpers/types/decoratorHelpers";
import TextureCreator from "../sub/data/texture";
import DeviceControls from "./device";
@raw("ctx")
@brand("ContextControls")
export class ContextControls {
    constructor(ctx:GPUCanvasContext){
        this.ctx = ctx;
        this.canvas=ctx.canvas;
    }
    configure(config:CANVAS_CONFIG){
        if(!config.device)throw error(31,"Canvas configuration requires a DeviceControls instance.","Pass the device returned by AdapterControls.device(...).");
        if(!config.format)throw error(32,"Canvas configuration requires a GPUTextureFormat.","Use WebGPUControls.preferredCanvasFormat() or another valid GPUTextureFormat.");
        let a:GPUCanvasConfiguration = {
            ...config,
            device:config.device.raw()
        }
        return this.ctx.configure(a)
    }
    unconfigure(){return this.ctx.unconfigure()}
    config(){const a = this.ctx.getConfiguration();
        if(!a)return null;
        const b:CANVAS_CONFIG = {...a,device:new DeviceControls(a.device)}
        return b;
    }

    currentTexture(device:DeviceControls){
        if(!this.ctx.getConfiguration())throw error(33,"Canvas context is not configured.","Call ContextControls.configure(...) before requesting the current texture.");
        return new TextureCreator(device.raw(),this.ctx.getCurrentTexture())
    }
    canvas:HTMLCanvasElement|OffscreenCanvas
    ctx:GPUCanvasContext
}
// eslint-disable-next-line
export interface ContextControls extends RAW<GPUCanvasContext>,BRAND<"ContextControls"> {}
export interface CANVAS_CONFIG {
    device: DeviceControls;
    format: GPUTextureFormat;
    usage?: number | undefined;
    viewFormats?: Iterable<GPUTextureFormat> | undefined;
    colorSpace?: PredefinedColorSpace | undefined;
    toneMapping?: GPUCanvasToneMapping | undefined;
    alphaMode?: GPUCanvasAlphaMode | undefined;
}
/**@type {GPUCanvasConfiguration} */
