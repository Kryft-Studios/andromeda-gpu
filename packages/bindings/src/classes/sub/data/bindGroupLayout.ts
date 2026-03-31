import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
import UNSURE from "../../../helpers/types/unsure"


// eslint-disable-next-line
export interface BindGroupLayoutCreator extends RAW<GPUBindGroupLayout>, BRAND<"BindGroupLayoutCreator"> {
    label(): UNSURE<string>;
    label<T extends string>(label: T): T;
}
/**
 * Wrapper around {@link GPUBindGroupLayout}.
 */
@brand("BindGroupLayoutCreator")
@raw("bindGroupLayoutDescriptor")
@labeling({
    get: (instance: BindGroupLayoutCreator) => instance.labelValue,
    set: (instance: BindGroupLayoutCreator, label) => instance.bindGroupLayoutDescriptor.label = instance.labelValue = label
})
export class BindGroupLayoutCreator {
    #bindGroupLayoutDescriptor:GPUBindGroupLayout
    #label?:string
    bindGroupLayoutDescriptor: GPUBindGroupLayout
    labelValue?: string
    constructor(device:GPUDevice,bgldOrBgl:GPUBindGroupLayoutDescriptor|GPUBindGroupLayout){
        this.#bindGroupLayoutDescriptor=bgldOrBgl instanceof GPUBindGroupLayout ? bgldOrBgl : device.createBindGroupLayout(bgldOrBgl)
        this.#label = bgldOrBgl.label
        this.bindGroupLayoutDescriptor = this.#bindGroupLayoutDescriptor
        this.labelValue = this.#label
    }
}
export default BindGroupLayoutCreator
