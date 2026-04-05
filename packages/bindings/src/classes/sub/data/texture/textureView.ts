/// <reference types="@webgpu/types" />

import {brand} from "@agpu/helpers/decorators";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import { BRAND, LABEL, RAW } from "@agpu/helpers/decorators";
import "@webgpu/types";
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
