import brand from "../../../../helpers/decorators/brand";
import labeling from "../../../../helpers/decorators/labelling";
import raw from "../../../../helpers/decorators/raw";
import { BRAND, LABEL, RAW } from "../../../../helpers/types/decoratorHelpers";
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
