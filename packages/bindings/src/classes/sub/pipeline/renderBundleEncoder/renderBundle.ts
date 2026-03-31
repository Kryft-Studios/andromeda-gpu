import brand from "../../../../helpers/decorators/brand";
import labeling from "../../../../helpers/decorators/labelling";
import raw from "../../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../../helpers/types/unsure";
// eslint-disable-next-line
export interface RenderBundleCreator extends RAW<GPURenderBundle>, BRAND<"RenderBundleCreator"> {
    label(): UNSURE<string>;
    label<T extends string>(label: T): T;
}
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
    #renbun:GPURenderBundle
    renderBundle: GPURenderBundle
    constructor(renbun:GPURenderBundle){
        this.#renbun=renbun
        this.renderBundle = this.#renbun
    }
}
export default RenderBundleCreator
