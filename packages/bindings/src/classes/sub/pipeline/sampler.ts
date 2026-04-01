import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, LABEL, RAW } from "../../../helpers/types/decoratorHelpers";

// eslint-disable-next-line
export interface SamplerCreator extends RAW<GPUSampler>, BRAND<"SamplerCreator">,LABEL {}
/**
 * Wrapper around {@link GPUSampler}.
 */
@brand("SamplerCreator")
@raw("sampler")
@labeling({
    get: (instance: SamplerCreator) => instance.sampler.label,
    set: (instance: SamplerCreator, label) => instance.sampler.label = label
})
export class SamplerCreator {
    #device?: GPUDevice
    #descriptor?: GPUSamplerDescriptor
    sampler: GPUSampler
    constructor(device:GPUDevice,optionsOrSampler:GPUSamplerDescriptor|GPUSampler){
        if (optionsOrSampler instanceof GPUSampler) {
            this.sampler = optionsOrSampler;
        } else {
            this.#device = device;
            this.#descriptor = { ...optionsOrSampler };
            this.sampler = device.createSampler(optionsOrSampler);
        }
        if(optionsOrSampler?.label)this.sampler.label = optionsOrSampler.label
    }
    /**
     * Recreates the sampler from its original descriptor when available.
     */
    clone(): SamplerCreator {
        if (!this.#device || !this.#descriptor) {
            throw new TypeError("Cannot clone a SamplerCreator created from a raw GPUSampler.");
        }
        return new SamplerCreator(this.#device, {
            ...this.#descriptor,
            label: this.sampler.label || this.#descriptor.label,
        });
    }
}
export default SamplerCreator
