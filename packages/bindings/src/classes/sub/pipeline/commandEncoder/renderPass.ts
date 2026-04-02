import error from "../../../../helpers/errors";
import DC_MEMBER from "../../../../helpers/types/DCMember";
import UNSURE from "@agpu/helpers/unsure";
import QuerySetCreator from "../querySet";
import TextureCreator from "../../data/texture";
import TextureViewCreator from "../../data/texture/textureView";
import RenderEncoderBase, { RENDER_ENCODER_BIND_GROUP_DYNAMIC_OFFSET_DATA } from "./renderEncoderBase";
import RenderBundleCreator from "../renderBundleEncoder/renderBundle";
import {brand} from "@agpu/helpers/decorators";
/**
 * Wrapper around {@link GPURenderPassEncoder} with cached state helpers and a
 * higher-level API consistent with the rest of the bindings package.
 */
@brand("RenderPassCreator")
export class RenderPassCreator extends RenderEncoderBase<GPURenderPassEncoder> {
    #currentOcclusionQueryIndex?: number;
    #endCurrOcculsionQuery?: () => any;
    #blendConstant: GPUColor = [0, 0, 0, 0];
    #scissorRect: [number, number, number?, number?] = [0, 0, undefined, undefined];
    #viewport: [number, number, UNSURE<number>, UNSURE<number>, number, number] = [0, 0, undefined, undefined, 0, 1];
    readonly OcclusionQuery;

    constructor(device: GPUDevice, cmdEncoder: GPUCommandEncoder, options: RENDER_PASS_OPTIONS) {
        const renderPass = cmdEncoder.beginRenderPass(RenderPassCreator.buildDescriptor(options));
        super(device, renderPass);

        const self = this;

        // define occlusion query
        this.OcclusionQuery = class {
            #ended = false;

            constructor(queryIndex: number) {
                if (!options.occlusionQuerySet) {
                    throw error(14, "Occlusion Query Set Not Provided!");
                }

                if (self.#currentOcclusionQueryIndex !== undefined) {
                    self.encoder.endOcclusionQuery();
                    self.#endCurrOcculsionQuery?.();
                }

                self.#currentOcclusionQueryIndex = queryIndex;
                self.encoder.beginOcclusionQuery(queryIndex);
                self.#endCurrOcculsionQuery = () => { this.#ended = true; this.end(); };
            }

            end() {
                if (this.#ended) return;
                this.#ended = true;
                self.#currentOcclusionQueryIndex = undefined;
                self.encoder.endOcclusionQuery();
            }
        };
    }

    /**
     * Builds the native WebGPU descriptor consumed by `beginRenderPass`.
     */
    static buildDescriptor(options: RENDER_PASS_OPTIONS): GPURenderPassDescriptor {
        const descriptor: GPURenderPassDescriptor = {
            colorAttachments: [],
            label: options.label
        };

        if (options.attachment?.color) {
            descriptor.colorAttachments = options.attachment.color.map(a => ({
                view: a.texture.view.raw(),
                resolveTarget: a.texture.resolve?.raw(),
                depthSlice: a.depthSlice,
                loadOp: a.operations.load,
                storeOp: a.operations.store,
                clearValue: a.color ?? { r: 0, g: 0, b: 0, a: 1 }
            }));
        }

        if (options.attachment?.depthStencil) {
            const ds = options.attachment.depthStencil;
            const depthStencilAttachment: GPURenderPassDepthStencilAttachment = {
                view: ds.view.raw(),
                depthClearValue: ds.depth.clear ?? 1.0,
                depthLoadOp: ds.depth.operations?.load ?? 'clear',
                depthStoreOp: ds.depth.operations?.store ?? 'store',
                depthReadOnly: ds.depth.readonly ?? false,
            };
            const hasStencilConfig =
                typeof ds.stencil?.clear !== "undefined" ||
                typeof ds.stencil?.readonly !== "undefined" ||
                typeof ds.stencil?.operations?.load !== "undefined" ||
                typeof ds.stencil?.operations?.store !== "undefined";
            if (hasStencilConfig) {
                depthStencilAttachment.stencilClearValue = ds.stencil.clear ?? 0;
                depthStencilAttachment.stencilLoadOp = ds.stencil.operations?.load ?? 'clear';
                depthStencilAttachment.stencilStoreOp = ds.stencil.operations?.store ?? 'store';
                depthStencilAttachment.stencilReadOnly = ds.stencil.readonly ?? false;
            }
            descriptor.depthStencilAttachment = depthStencilAttachment;
        }

        if (options.occlusionQuerySet) {
            descriptor.occlusionQuerySet = options.occlusionQuerySet.raw();
        }

        if (options.timestampRewrites) {
            descriptor.timestampWrites = {
                querySet: options.timestampRewrites.querySet.raw(),
                beginningOfPassWriteIndex: options.timestampRewrites.passWriteIndex.beginning,
                endOfPassWriteIndex: options.timestampRewrites.passWriteIndex.end,
            };
        }

        if (options.maxDrawCount) {
            descriptor.maxDrawCount = options.maxDrawCount;
        }

        return descriptor;
    }

    /**
     * Ends the underlying render pass encoder.
     */
    end() {
        this.encoder.end();
    }

    /**
     * Getter/Setter for the blend constant cached by this wrapper.
     */
    blendConstant(): GPUColor;
    blendConstant<T extends GPUColor>(color: T): T;
    blendConstant<T extends GPUColor>(color?: T): T | GPUColor {
        if (typeof color === "undefined") return this.#blendConstant;
        this.encoder.setBlendConstant(color);
        return this.#blendConstant = color;
    }

    /**
     * Getter/Setter for the current scissor rectangle.
     */
    scissorRect(): [number, number, number?, number?];
    scissorRect<T extends [number, number, number, number]>(x: T[0], y: T[1], width: T[2], height: T[3]): T;
    scissorRect<T extends [number, number, number, number]>(
        x?: T[0],
        y?: T[1],
        width?: T[2],
        height?: T[3]
    ): T | [number, number, number?, number?] {
        if (x === undefined) return this.#scissorRect;
        if (y === undefined || width === undefined || height === undefined) {
            throw error(20, "scissorRect requires (x, y, width, height) to set.");
        }
        this.encoder.setScissorRect(x, y, width, height);
        const newRect: T = [x, y, width, height] as T;
        this.#scissorRect = newRect;
        return newRect;
    }

    /**
     * Getter/Setter for the current viewport transform.
     */
    viewport(): [number, number, UNSURE<number>, UNSURE<number>, number, number];
    viewport<T extends [number, number, number, number, number, number]>(
        x: T[0], y: T[1], width: T[2], height: T[3], minDepth: T[4], maxDepth: T[5]
    ): T;
    viewport<T extends [number, number, number, number, number, number]>(
        x?: T[0],
        y?: T[1],
        width?: T[2],
        height?: T[3],
        minDepth?: T[4],
        maxDepth?: T[5]
    ): T | [number, number, UNSURE<number>, UNSURE<number>, number, number] {
        if (x === undefined) return this.#viewport;

        if (y === undefined || width === undefined || height === undefined || minDepth === undefined || maxDepth === undefined) {
            throw error(21, "viewport requires 6 arguments (x, y, width, height, minDepth, maxDepth) to set.");
        }

        this.encoder.setViewport(x, y, width, height, minDepth, maxDepth);

        const newViewport: T = [x, y, width, height, minDepth, maxDepth] as T;
        this.#viewport = newViewport;
        return newViewport;
    }

    /**
     * Executes pre-recorded render bundles inside this render pass.
     */
    executeBundles(bundles: RenderBundleCreator[]) {
        return this.encoder.executeBundles(bundles.map(a => a.raw()));
    }
}
export namespace RenderPassCreator {
    export namespace bindGroup {
        export interface DYNAMIC_OFFSET_DATA extends RENDER_ENCODER_BIND_GROUP_DYNAMIC_OFFSET_DATA {}
    }
}
export default RenderPassCreator;

/**
 * Options used to construct a render pass descriptor.
 */
export interface RENDER_PASS_OPTIONS extends GPUObjectDescriptorBase {
    attachment?: RENDER_PASS_OPTIONS.ATTACHMENT
    occlusionQuerySet?: QuerySetCreator
    timestampRewrites?: RENDER_PASS_OPTIONS.TIMESTAMP_REWRITES
    maxDrawCount?: number
}
export namespace RENDER_PASS_OPTIONS {
    /**
     * Attachment configuration passed to the render pass.
     */
    export interface ATTACHMENT {
        depthStencil: ATTACHMENT.DEPTH_STENCIL
        color: ATTACHMENT.COLOR[]
    }

    /**
     * Shared load/store operations used by color, depth, and stencil state.
     */
    export interface OPERATIONS {
        load: GPULoadOp
        store: GPUStoreOp
    }

    /**
     * Timestamp query writes emitted at the start and/or end of the pass.
     */
    export interface TIMESTAMP_REWRITES {
        querySet: QuerySetCreator | DC_MEMBER<"QuerySet">
        passWriteIndex: {
            beginning?: number
            end?: number
        }
    }
}
export namespace RENDER_PASS_OPTIONS.ATTACHMENT {
    /**
     * Configuration for one color attachment in the pass.
     */
    export interface COLOR {
        depthSlice?: number
        operations: RENDER_PASS_OPTIONS.OPERATIONS
        color: GPUColor
        texture: RENDER_PASS_OPTIONS.ATTACHMENT.COLOR.TEXTURE
    }

    /**
     * Combined depth/stencil attachment configuration.
     */
    export interface DEPTH_STENCIL {
        view: TextureCreator | DC_MEMBER<"Texture"> | TextureViewCreator
        depth: RENDER_PASS_OPTIONS.ATTACHMENT.DEPTH_STENCIL.COMMON
        stencil: RENDER_PASS_OPTIONS.ATTACHMENT.DEPTH_STENCIL.COMMON
    }

}
export namespace RENDER_PASS_OPTIONS.ATTACHMENT.DEPTH_STENCIL {
    /**
     * Shared options for either the depth or stencil half of the attachment.
     */
    export interface COMMON {
        clear?: number
        operations?: RENDER_PASS_OPTIONS.OPERATIONS
        readonly?: boolean
    }
}
export namespace RENDER_PASS_OPTIONS.ATTACHMENT.COLOR {
    /**
     * Texture views used by a color attachment and its optional resolve target.
     */
    export interface TEXTURE {
        view: TextureCreator | DC_MEMBER<"Texture"> | TextureViewCreator
        resolve?: TextureCreator | DC_MEMBER<"Texture"> | TextureViewCreator
    }
}
