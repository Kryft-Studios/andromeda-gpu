import brand from "../../../../helpers/decorators/brand";
import labeling from "../../../../helpers/decorators/labelling";
import raw from "../../../../helpers/decorators/raw";
import { BRAND, LABEL, RAW } from "../../../../helpers/types/decoratorHelpers";
// eslint-disable-next-line
export interface TextureViewCreator extends RAW<GPUTextureView>, BRAND<"TextureViewCreator">, LABEL {}
/**
 * Thin wrapper around {@link GPUTextureView}.
 */
@brand("TextureViewCreator")
@raw("view")
@labeling({
    get: (instance: TextureViewCreator) => instance.view.label,
    set: (instance: TextureViewCreator, label) => instance.view.label = label
})
export class TextureViewCreator {

    /**The raw GPUTextureView of the TextureView */
    readonly view: GPUTextureView
    constructor(view:GPUTextureView){
        this.view = view;
    }
}
export default TextureViewCreator
