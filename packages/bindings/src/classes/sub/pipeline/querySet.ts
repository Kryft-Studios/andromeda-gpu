import brand from "../../../helpers/decorators/brand";
import labeling from "../../../helpers/decorators/labelling";
import raw from "../../../helpers/decorators/raw";
import { BRAND, RAW } from "../../../helpers/types/decoratorHelpers";
// eslint-disable-next-line
export interface QuerySetCreator extends RAW<GPUQuerySet>, BRAND<"QuerySetCreator"> {
    label(): string;
    label<T extends string>(label: T): T;
}
/**
 * Wrapper around {@link GPUQuerySet}.
 */
@brand("QuerySetCreator")
@raw("querySet")
@labeling({
    get: (instance: QuerySetCreator) => instance.querySet.label,
    set: (instance: QuerySetCreator, label) => {
        instance.queryDescriptor.label = label;
        return instance.querySet.label = label;
    }
})
export class QuerySetCreator {
    #qs: GPUQuerySet;
    #device: GPUDevice;
    #descriptor: GPUQuerySetDescriptor;
    #destroyed: boolean = false;
    querySet: GPUQuerySet;
    queryDescriptor: GPUQuerySetDescriptor;

    constructor(device: GPUDevice, options: GPUQuerySetDescriptor | GPUQuerySet) {
        this.#device = device;
        
        if (options instanceof GPUQuerySet) {
            this.#qs = options;
            this.#descriptor = {
                type: options.type,
                count: options.count,
                label: options.label
            };
        } else {
            this.#descriptor = options;
            this.#qs = device.createQuerySet(options);
        }
        this.querySet = this.#qs;
        this.queryDescriptor = this.#descriptor;
    }

    /**
     * Getter / Setter for destroying the QuerySet
     */
    destroy(): boolean
    destroy<T extends boolean>(destroy: T): T
    destroy<T extends boolean>(destroy?: T): T | boolean {
        if (typeof destroy === "undefined") return this.#destroyed;

        if (this.#destroyed && destroy) return true;

        if (!this.#destroyed && destroy) {
            this.#destroyed = true;
            this.#qs.destroy();
            return true;
        }

        if (!this.#destroyed && !destroy) return false;

        if (this.#destroyed && !destroy) {
            this.#qs = this.#device.createQuerySet(this.#descriptor);
            this.#destroyed = false;
            return false;
        }

        return this.#destroyed;
    }

    [Symbol("Symbol.dispose")]() {
        this.destroy(true);
    }
}
export default QuerySetCreator
