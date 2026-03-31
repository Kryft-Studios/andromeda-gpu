import BufferCreator, { BUFFER_CONSTRUCTION_OPTIONS } from "../../../data/buffers";
import BUFFER_USAGE_OPTIONS, { BUFFER_BINDING_OPTIONS, getOptionsFromUsage } from "../../../data/buffers/bufferUsageOptions";

/**
 * Buffer wrapper specialized for indirect draw and dispatch argument payloads.
 */
export default class IndirectBufferCreator extends BufferCreator {
    constructor(device: GPUDevice, options: INDIRECT_BUFFER_OPTIONS) {
        if (typeof options.usage === "number") options.usage = getOptionsFromUsage(options.usage) as INDIRECT_BUFFER_USAGE_OPTIONS
        if (options.usage?.buffer) options.usage.buffer.indirect = true;
        super(device, options as BUFFER_CONSTRUCTION_OPTIONS)
    }
}

/**
 * Construction options for an indirect buffer.
 */
export interface INDIRECT_BUFFER_OPTIONS extends BUFFER_CONSTRUCTION_OPTIONS {
    usage?: INDIRECT_BUFFER_USAGE_OPTIONS
    value: GPUAllowSharedBufferSource
}

/**
 * Buffer usage options constrained for indirect buffers.
 */
export interface INDIRECT_BUFFER_USAGE_OPTIONS extends BUFFER_USAGE_OPTIONS {
    buffer: INDIRECT_BUFFER_BINDING_OPTIONS
}

/**
 * Binding flags constrained for indirect buffers.
 */
export interface INDIRECT_BUFFER_BINDING_OPTIONS extends BUFFER_BINDING_OPTIONS {
    indirect?: true
}
