import {brand} from "@agpu/helpers/decorators";
import { BRAND, LABEL, RAW } from "@agpu/helpers/decorators";
import RenderEncoderBase from "./commandEncoder/renderEncoderBase";
import RenderBundleCreator from "./renderBundleEncoder/renderBundle";

// eslint-disable-next-line
export interface RenderBundleEncoderCreator extends RAW<GPURenderBundleEncoder>, BRAND<"RenderBundleEncoderCreator">, LABEL {}
/**
 * Wrapper around {@link GPURenderBundleEncoder}.
 */
@brand("RenderBundleEncoderCreator")
export class RenderBundleEncoderCreator extends RenderEncoderBase<GPURenderBundleEncoder> {
    constructor(device: GPUDevice, renBun:GPURenderBundleEncoder) {
        const renderPass = renBun;
        super(device, renderPass);
    }

    /**
     * Finishes recording and returns a wrapped render bundle.
     */
    finish({label}:{label?:string}={}) {
        new RenderBundleCreator(this.encoder.finish({label}));
    }
}
export default RenderBundleEncoderCreator
