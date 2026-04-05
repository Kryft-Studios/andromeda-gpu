/// <reference types="@webgpu/types" />

import {brand} from "@agpu/helpers/decorators";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import { BRAND, LABEL, RAW } from "@agpu/helpers/decorators";
import "@webgpu/types";
// eslint-disable-next-line
export interface RenderBundleCreator extends RAW<GPURenderBundle>, BRAND<"RenderBundleCreator">,LABEL {}
/**
 * Wrapper around a finished {@link GPURenderBundle}.
 */
@brand("RenderBundleCreator")
@raw("renderBundle")
@labeling({
    get: (instance: RenderBundleCreator) => instance.renderBundle.label,
    set: (instance: RenderBundleCreator, label) => instance.renderBundle.label = label
})
export class RenderBundleCreator {
    renderBundle: GPURenderBundle
    constructor(renbun:GPURenderBundle){
        this.renderBundle = renbun
    }
}
export default RenderBundleCreator
