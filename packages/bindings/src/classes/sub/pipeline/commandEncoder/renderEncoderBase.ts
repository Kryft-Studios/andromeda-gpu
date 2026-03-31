import error from "../../../../helpers/errors";
import labeling from "../../../../helpers/decorators/labelling";
import raw from "../../../../helpers/decorators/raw";
import DC_MEMBER from "../../../../helpers/types/DCMember";
import UNSURE from "../../../../helpers/types/unsure";
import BindGroupCreator from "../../data/bindGroup";
import BufferCreator from "../../data/buffers";
import IndirectBufferCreator, { INDIRECT_BUFFER_BINDING_OPTIONS, INDIRECT_BUFFER_OPTIONS } from "./renderPass/indirectBuffer";
import RenderPipelineCreator from "../renderPipeline";

export interface INDIRECT_BUFFER_CONSTRUCTOR {
    new(options: INDIRECT_BUFFER_OPTIONS): IndirectBufferCreator;
    readonly len: number;
    from(buffer: BufferCreator | GPUBuffer): Promise<IndirectBufferCreator>;
}

/**
 * Helper object around the shared draw calls available on render pass and
 * render bundle encoders.
 */
export interface DRAW_MACHINE {
    (vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
    indexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
    indexedIndirect(buffer: IndirectBufferCreator, offset?: number): void;
    indirect(buffer: IndirectBufferCreator, offset?: number): void;
    IndexedIndirectBuffer: INDIRECT_BUFFER_CONSTRUCTOR;
    IndirectBuffer: INDIRECT_BUFFER_CONSTRUCTOR;
}

/**
 * Dynamic-offset window information passed to `setBindGroup`.
 */
export interface RENDER_ENCODER_BIND_GROUP_DYNAMIC_OFFSET_DATA {
    start: number;
    len: number;
}

/**
 * Structural subset shared by {@link GPURenderPassEncoder} and
 * {@link GPURenderBundleEncoder}.
 */
export interface COMMON_RENDER_ENCODER {
    label: string;
    draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
    drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void;
    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void;
    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, offset?: number, size?: number): void;
    setVertexBuffer(slot: number, buffer: GPUBuffer | null, offset?: number, size?: number): void;
    setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: Iterable<number>): void;
    setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: number, dynamicOffsetsDataLength: number): void;
    setPipeline(pipeline: GPURenderPipeline): void;
    pushDebugGroup(groupLabel: string): void;
    popDebugGroup(): void;
    insertDebugMarker(markerLabel: string): void;
}

/**
 * Shared wrapper for commands supported by both render passes and render
 * bundle encoders.
 */
@raw("encoder")
@labeling({
    get: <T_ENCODER extends COMMON_RENDER_ENCODER>(instance: RenderEncoderBase<T_ENCODER>) => instance.encoder.label,
    set: <T_ENCODER extends COMMON_RENDER_ENCODER>(instance: RenderEncoderBase<T_ENCODER>, label: string) => instance.encoder.label = label
})
export default class RenderEncoderBase<T_ENCODER extends COMMON_RENDER_ENCODER = COMMON_RENDER_ENCODER>{
    protected readonly encoder: T_ENCODER;

    /**
     * Draw helpers plus indirect-buffer helper constructors.
     */
    readonly draw: DRAW_MACHINE;

    /**
     * Vertex and index buffer binding helpers.
     */
    readonly buffer;

    /**
     * Debug-group helpers that mirror the underlying encoder.
     */
    readonly debug;
    #debugDepth = 0;
    #pipeline?: RenderPipelineCreator;

    constructor(device: GPUDevice, encoder: T_ENCODER) {
        this.encoder = encoder;

        class IndirectBufferBase extends IndirectBufferCreator {
            static readonly len: number = 1;

            constructor(options: INDIRECT_BUFFER_OPTIONS) {
                super(device, options);
            }

            static async from(buffer: BufferCreator | GPUBuffer) {
                const bufCreator = buffer instanceof BufferCreator
                    ? buffer
                    : new BufferCreator(device, buffer);

                const can = bufCreator.can;
                const val = await bufCreator.value();

                can.beBoundAs.indirect = true;

                return new IndirectBufferCreator(device, {
                    value: val ?? new Uint32Array(this.len),
                    usage: {
                        copy: can.copy,
                        map: can.map,
                        buffer: can.beBoundAs as INDIRECT_BUFFER_BINDING_OPTIONS,
                        queryable: can.query
                    }
                });
            }
        }
        class IndexedIndirectBuffer extends IndirectBufferBase {
            static readonly len = 5;
        }
        class IndirectBuffer extends IndirectBufferBase {
            static readonly len = 4;
        }

        const baseDraw = this.encoder.draw.bind(this.encoder);
        this.draw = Object.assign(baseDraw, {
            indexed: this.encoder.drawIndexed.bind(this.encoder),
            indexedIndirect: (buffer: IndirectBufferCreator, offset = 0) => {
                this.encoder.drawIndexedIndirect(buffer.raw(), offset);
            },
            indirect: (buffer: IndirectBufferCreator, offset = 0) => {
                this.encoder.drawIndirect(buffer.raw(), offset);
            },
            IndirectBuffer,
            IndexedIndirectBuffer
        });

        this.buffer = {
            index: (buffer: BufferCreator | DC_MEMBER<"Buffer">) => {
                if (!buffer.can.beBoundAs.index) throw error(22, "A buffer that does not support the GPUBufferUsage.INDEX flag was passed into buffer.index.");
                this.encoder.setIndexBuffer(buffer.raw(), buffer.value() instanceof Uint32Array ? "uint32" : "uint16");
            },
            vertex: (slot: number, buffer: BufferCreator | DC_MEMBER<"Buffer">) => {
                if (!buffer.can.beBoundAs.vertex) throw error(22, "A buffer that does not support the GPUBufferUsage.VERTEX flag was passed into buffer.vertex.");
                this.encoder.setVertexBuffer(slot, buffer.raw());
            }
        };

        this.debug = {
            push: (label: string) => {
                this.#debugDepth++;
                this.encoder.pushDebugGroup(label);
            },
            pop: () => {
                if (this.#debugDepth <= 0) throw error(17, "debug.pop used before init");
                this.encoder.popDebugGroup();
                this.#debugDepth--;
            },
            insertMarker: (label: string) => {
                this.encoder.insertDebugMarker(label);
            }
        };
    }
    /**
     * Mirrors `setBindGroup` and supports both direct dynamic offsets and
     * typed-array window arguments.
     */
    bindGroup(
        index: number,
        bindGroup: BindGroupCreator | DC_MEMBER<"BindGroup">,
        dynamicOffsets?: number[] | Uint32Array,
        dynamicOffsetData?: RENDER_ENCODER_BIND_GROUP_DYNAMIC_OFFSET_DATA
    ) {
        if (dynamicOffsetData) {
            this.encoder.setBindGroup(index, bindGroup.raw(), dynamicOffsets as Uint32Array, dynamicOffsetData.start, dynamicOffsetData.len);
        } else {
            this.encoder.setBindGroup(index, bindGroup.raw());
        }
    }

    /**
     * Getter/Setter for the current render pipeline wrapper.
     *
     * Returns the cached pipeline wrapper when called without arguments.
     */
    async pipeline(): Promise<UNSURE<RenderPipelineCreator>>;
    async pipeline<T extends RenderPipelineCreator | DC_MEMBER<"RenderPipeline">>(pipeline: T): Promise<T>;
    async pipeline<T extends RenderPipelineCreator | DC_MEMBER<"RenderPipeline">>(pipeline?: T): Promise<T | UNSURE<RenderPipelineCreator>> {
        if (typeof pipeline === "undefined") return this.#pipeline;
        this.encoder.setPipeline(await pipeline.raw());
        return this.#pipeline = pipeline;
    }
}
