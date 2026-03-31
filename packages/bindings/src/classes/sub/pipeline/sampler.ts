import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../helpers/types/unsure"
// eslint-disable-next-line
export interface SamplerCreator extends RAW<GPUSampler>, BRAND<"SamplerCreator"> {
    label(): UNSURE<string>;
    label<T extends string>(label: T): T;
}
/**
 * Wrapper around {@link GPUSampler}.
 */
@brand("SamplerCreator")
@raw("sampler")
@labeling({
    get: (instance: SamplerCreator) => instance.labelValue,
    set: (instance: SamplerCreator, label) => instance.sampler.label = instance.labelValue = label
})
export class SamplerCreator {
    #sampler:GPUSampler
    #label?:string
    sampler: GPUSampler
    labelValue?: string
    constructor(device:GPUDevice,optionsOrSampler:GPUSamplerDescriptor|GPUSampler){
        this.#sampler=optionsOrSampler instanceof GPUSampler ? optionsOrSampler : device.createSampler(optionsOrSampler)
        if(optionsOrSampler?.label)this.#sampler.label = this.#label = optionsOrSampler.label
        this.sampler = this.#sampler
        this.labelValue = this.#label
    }
}
export default SamplerCreator
