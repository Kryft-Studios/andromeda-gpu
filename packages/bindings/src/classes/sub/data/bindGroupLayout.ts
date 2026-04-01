import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, LABEL, RAW } from "../../../helpers/types/decoratorHelpers";


// eslint-disable-next-line
export interface BindGroupLayoutCreator extends RAW<GPUBindGroupLayout>, BRAND<"BindGroupLayoutCreator">,LABEL {}
/**
 * Wrapper around {@link GPUBindGroupLayout}.
 */
@brand("BindGroupLayoutCreator")
@raw("bindGroupLayoutDescriptor")
@labeling({
    get: (instance: BindGroupLayoutCreator) => instance.bindGroupLayout.label,
    set: (instance: BindGroupLayoutCreator, label) => instance.bindGroupLayout.label = label
})
export class BindGroupLayoutCreator {
    #device?: GPUDevice
    #descriptor?: GPUBindGroupLayoutDescriptor
    readonly bindGroupLayout: GPUBindGroupLayout
    constructor(device:GPUDevice,bgldOrBgl:GPUBindGroupLayoutDescriptor|GPUBindGroupLayout){
        if (bgldOrBgl instanceof GPUBindGroupLayout) {
            this.bindGroupLayout = bgldOrBgl;
        } else {
            this.#device = device;
            this.#descriptor = { ...bgldOrBgl, entries: Array.from(bgldOrBgl.entries, entry => ({ ...entry })) };
            this.bindGroupLayout = device.createBindGroupLayout(bgldOrBgl);
        }
    }
    /**
     * Recreates the bind group layout from its original descriptor when available.
     */
    clone(): BindGroupLayoutCreator {
        if (!this.#device || !this.#descriptor) {
            throw new TypeError("Cannot clone a BindGroupLayoutCreator created from a raw GPUBindGroupLayout.");
        }
        return new BindGroupLayoutCreator(this.#device, {
            ...this.#descriptor,
            entries: Array.from(this.#descriptor.entries, entry => ({ ...entry })),
            label: this.bindGroupLayout.label || this.#descriptor.label,
        });
    }
}
export default BindGroupLayoutCreator
