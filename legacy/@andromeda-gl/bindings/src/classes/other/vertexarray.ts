import error from "../../helpers/errors";
import UNSURE from "../../helpers/types/unsure";
import { Buffer } from "./buffer";
import VertexArrayLayout from "./vertexarraylayout";

export class VertexArray {
    #gl: WebGL2RenderingContext;
    #vao: WebGLVertexArrayObject;
    constructor(gl: WebGL2RenderingContext, buffers?: Buffer[]) {
        this.#gl = gl;
        this.#vao = gl.createVertexArray()
        if (!this.#vao) error(1, "Failed to create the vertex array.")
        this.buffers = buffers ?? [];
    }
    #layout?: VertexArrayLayout
    layout(): UNSURE<VertexArrayLayout>
    layout<T extends VertexArrayLayout>(layout: T): T
    layout<T extends VertexArrayLayout>(layout?: T): T | UNSURE<VertexArrayLayout> {
        if(this.#deleted)throw error(7,"VertexArray is already deleted");
        if (typeof layout === "undefined") return this.#layout;
        return this.#layout = layout;
    }
    [Symbol.dispose](){
        this.delete()
    }
    bind() {
        if(this.#deleted)throw error(7,"VertexArray is already deleted");
        return this.#gl.bindVertexArray(this.#vao);
    }
    #buffers: Buffer[] = []

    /**
     * Set or get the value of the buffers in the vertex array easily.
     * - Array access: vao.buffers[0] = buf;
     * - Setter: vao.buffers = [b1, b2]; 
     * - Function Call (Set): vao.buffers([b1, b2]);
     * - Function Call (Get): const raw = vao.buffers();
     */
    get buffers(): Buffer[] & VertexArray.BUFFERS_FN {
        const proxy = new Proxy(this.#buffers, {
            set: (target, prop, value: Buffer) => {
                if(this.#deleted)throw error(7,"VertexArray is already deleted");
                (target as any)[prop] = value;
                const index = Number(prop);

                if (!isNaN(index) && typeof prop !== 'symbol') {
                    const buffer = value;
                    const layout = this.layout();

                    if (!layout) {
                        error(2, "Cannot bind buffer without a VertexArrayLayout.");
                        return false;
                    }

                    this.bind();
                    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buffer.raw());

                    const data = buffer.value();
                    const bytesPerElement = data.BYTES_PER_ELEMENT;

                    const typeName = data.constructor.name;

                    const glType = VertexArray.TYPE_MAP[typeName] ?? 5126;

                    const attrs = layout.attributes();

                    const totalComponents = attrs.reduce((sum, a) => sum + a.size, 0);
                    const stride = totalComponents * bytesPerElement;

                    let offset = 0;
                    for (let i = 0; i < attrs.length; i++) {
                        const attr = attrs[i];
                        const attrLocation = index + i;

                        this.#gl.enableVertexAttribArray(attrLocation);
                        this.#gl.vertexAttribPointer(
                            attrLocation,
                            attr.size,
                            glType,
                            attr.normalized || false,
                            stride,
                            offset
                        );

                        offset += attr.size * bytesPerElement;
                    }
                }
                return true;
            }
        });

        const handler = (value?: Buffer[]) => {
            if(this.#deleted)throw error(7,"VertexArray is already deleted");
            if (typeof value === "undefined") return this.#buffers;
            value.forEach((b, i) => (proxy[i] = b));
        };

        return Object.assign(proxy, handler) as any;
    }

    set buffers(value: Buffer[]) {
        if(this.#deleted)throw error(7,"VertexArray is already deleted");
        this.buffers.push(...value);
    }
    #deleted:boolean=false;
    delete(){
        if(this.#deleted)return;
        this.#deleted=true;
        return this.#gl.deleteVertexArray
    }
}
export namespace VertexArray {
    export type BUFFERS_FN = {
        (): Buffer[];
        (value: Buffer[]): void;
    };
    export const TYPE_MAP: Record<string, number> = {
        "Float32Array": 5126,
        "Int32Array": 5124,
        "Uint32Array": 5125,
        "Int16Array": 5122,
        "Uint16Array": 5123,
        "Int8Array": 5120,
        "Uint8Array": 5121
    };
}
