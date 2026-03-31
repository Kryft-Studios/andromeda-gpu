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
    #view:GPUTextureView
    view: GPUTextureView
    constructor(view:GPUTextureView){
        this.#view=view;
        this.view = this.#view
    }
}
export default TextureViewCreator
