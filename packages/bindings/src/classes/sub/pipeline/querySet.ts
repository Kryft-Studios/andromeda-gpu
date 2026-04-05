/// <reference types="@webgpu/types" />

import {brand} from "@agpu/helpers/decorators";
import {labeling} from "@agpu/helpers/decorators";
import {raw} from "@agpu/helpers/decorators";
import error from "../../../helpers/errors";
import { BRAND, RAW } from "@agpu/helpers/decorators";
import "@webgpu/types";
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
    set: (instance: QuerySetCreator, label) => {        return instance.querySet.label = label; }
})
export class QuerySetCreator {
    #device: GPUDevice;
    #destroyed: boolean = false;
    querySet: GPUQuerySet;
    queryDescriptor: GPUQuerySetDescriptor;

    constructor(device: GPUDevice, options: GPUQuerySetDescriptor | GPUQuerySet) {
        this.#device = device;
        if (options instanceof GPUQuerySet) {
            this.querySet = options;
            this.queryDescriptor = {
                type: options.type,
                count: options.count,
                label: options.label
            };
        } else {
            this.queryDescriptor = options;
            this.querySet = device.createQuerySet(options);
        }
    }
    /**
     * Creates a new query set wrapper from the cached descriptor.
     */
    clone(): QuerySetCreator {
        if (this.#destroyed) throw error(52, "Cannot clone a destroyed QuerySet.", "Clone the query set before destroying it.");
        return new QuerySetCreator(this.#device, { ...this.queryDescriptor });
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
            this.querySet.destroy();
            return true;
        }

        if (!this.#destroyed && !destroy) return false;

        if (this.#destroyed && !destroy) {
            throw error(51,"Resurrecting a query set is not allowed. This feature is deprecated")
            /*this.#qs = this.#device.createQuerySet(this.#descriptor);
            this.#destroyed = false;
            return false;*/
        }

        return this.#destroyed;
    }

    [Symbol("Symbol.dispose")]() {
        this.destroy(true);
    }
}
export default QuerySetCreator
