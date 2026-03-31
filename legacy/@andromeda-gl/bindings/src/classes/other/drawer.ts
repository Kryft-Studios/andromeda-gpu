import { VertexArray } from "./vertexarray";

export class Drawer {
    #gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.#gl = gl;
    }

    /**
     * Draw multiple vertex arrays
     */
    arrays(vaos: VertexArray[], mode: Drawer.MODE = "triangles") {
        const m = Drawer.modeLookup[mode]
        for (const vao of vaos) {
            vao.bind();

            const buffers = vao.buffers();
            const indexBuffer = buffers.find(b => b.usage.value() === this.#gl.ELEMENT_ARRAY_BUFFER);

            if (indexBuffer) {
                this.#gl.drawElements(
                    m,
                    indexBuffer.count(),
                    indexBuffer.value().BYTES_PER_ELEMENT === 4 ? this.#gl.UNSIGNED_INT : this.#gl.UNSIGNED_SHORT,
                    indexBuffer.value().byteOffset??0
                );
            } else {
                const vertexCount = buffers[0].count() || 0;
                this.#gl.drawArrays(m, 0, vertexCount);
            }
        }
    }
}
export namespace Drawer {
    /**
     * MODE to draw the given arrays.
     * 
     * "points": Draws a single dot.
     * "linestrip": Draws a straight line to the next vertex.
     * "lineloop": Draws a straight line to the next vertex, and connects the last vertex back to the first.
     * "lines": Draws a line between a pair of vertices.
     * "trianglestrip": Draws a series of triangles (three-sided polygons) using vertices v0, v1, v2, then v2, v1, v3 (note the order), then v2, v3, v4, and so on
     * "trianglefan": 
     * "triangle": Draws a triangle for a group of three vertices.
     */
    export type MODE = "points" | "linestrip" | "lineloop" | "lines" | "trianglefan" | "trianglestrip" | "triangles"

    export const modeLookup = {
        "points": WebGL2RenderingContext.POINTS,
        "linestrip": WebGL2RenderingContext.LINE_STRIP,
        "lineloop": WebGL2RenderingContext.LINE_LOOP,
        "lines": WebGL2RenderingContext.LINES,
        "triangles": WebGL2RenderingContext.TRIANGLES,
        "trianglefan": WebGL2RenderingContext.TRIANGLE_FAN,
        "trianglestrip": WebGL2RenderingContext.TRIANGLE_STRIP
    }
}