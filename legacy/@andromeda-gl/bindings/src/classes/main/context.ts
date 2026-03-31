import brand from "../../helpers/decorators/brand";
import raw from "../../helpers/decorators/raw";
import STORE from "../../helpers/store";
import { BRAND, RAW } from "../../helpers/types/decoratorHelpers";
import { Buffer } from "../other/buffer";
import { Drawer } from "../other/drawer";
import { Texture2D } from "../other/texture/texture2d";
import { Texture3D } from "../other/texture/texture3d";
import { TextureBase } from "../other/texture/texturebase";
import { VertexArray } from "../other/vertexarray";
import VertexArrayLayout from "../other/vertexarraylayout";

export class MonkeyPatchedBuffer extends WebGLBuffer {
    imbound = false;
    currusage: number = WebGL2RenderingContext.ARRAY_BUFFER
}
export class MonkeyPatchedTex extends MonkeyPatchedBuffer{}
export class MonkeyPatchedVAO extends WebGLVertexArrayObject {
    imbound = false;
}
@raw("context")
@brand("ContextControls")
export class ContextControls {
    /**
     * WebGL2 Context Controls.
     * 
     * **Warning:** this also monkey patches your `gl` context for optimization.
     * 
     * tho, usage remains the same.
     */
    constructor(gl: WebGL2RenderingContext) {
        this.canvas = gl.canvas
        // monkey patch
        const originalCreate = gl.createBuffer.bind(gl)
const originalBind = gl.bindBuffer.bind(gl)
const originalVAOCreate = gl.createVertexArray.bind(gl)
const originalVAOBind = gl.bindVertexArray.bind(gl)
const originalTexCreate = gl.createTexture.bind(gl)
const originalTexBind = gl.bindTexture.bind(gl)

        gl.createBuffer = (): WebGLBuffer => {
            let bufe: WebGLBuffer = originalCreate();
            (bufe as MonkeyPatchedBuffer).imbound = false;
            (bufe as MonkeyPatchedBuffer).currusage = 0;
            return bufe;
        }
        gl.bindBuffer = (target, buffer): void => {
            if (buffer == null) {
                originalBind(gl.ARRAY_BUFFER, null)
                STORE.boundbuf.curBound = null;
                STORE.boundbuf.onunbound();
                STORE.boundbuf.curBufDrawUsage = 0;
                return;
            }
            const patched = buffer as MonkeyPatchedBuffer;
            if (patched.imbound !== undefined && patched.imbound && patched.currusage === target) {
                return;
            }
            originalBind(target, buffer)
            patched.currusage = target;
            patched.imbound = true;
            STORE.boundbuf.curBound = patched;
            STORE.boundbuf.onunbound()
            STORE.boundbuf.onunbound = () => {
                patched.imbound = false;
            }
            STORE.boundbuf.curBufDrawUsage = target;
        }
        gl.createTexture = (): WebGLTexture => {
            let bufe: WebGLTexture = originalTexCreate();
            (bufe as MonkeyPatchedTex).imbound = false;
            (bufe as MonkeyPatchedTex).currusage = 0;
            return bufe;
        }
        gl.bindTexture = (target, tex): void => {
            if (tex == null) {
                originalBind(gl.ARRAY_BUFFER, null)
                STORE.boundtex.curBound = null;
                STORE.boundtex.onunbound();
                STORE.boundtex.texUsage = 0;
                return;
            }
            const patched = tex as MonkeyPatchedTex;
            if (patched.imbound !== undefined && patched.imbound && patched.currusage === target) {
                return;
            }
            originalTexBind(target, tex)
            patched.currusage = target;
            patched.imbound = true;
            STORE.boundtex.curBound = patched;
            STORE.boundtex.onunbound()
            STORE.boundtex.onunbound = () => {
                patched.imbound = false;
            }
            STORE.boundtex.texUsage = target;
        }
        gl.createVertexArray = (): WebGLVertexArrayObject => {
            let vaoe= originalVAOCreate();
            (vaoe as MonkeyPatchedVAO).imbound = false;
            return vaoe;
        }
        gl.bindVertexArray = (vao: WebGLVertexArrayObject | null) => {
            if (vao == null) {
                originalVAOBind(null)
                STORE.boundvao.curBound = null;
                STORE.boundvao.onunbound();
                return;
            }
            const patched = vao as MonkeyPatchedVAO;
            if (patched.imbound !== undefined && patched.imbound) {
                return;
            }
            originalVAOBind(vao);
            patched.imbound = true;
            STORE.boundvao.onunbound();
            STORE.boundvao.onunbound = () => {
                patched.imbound = false;
            }
            STORE.boundvao.curBound = vao;
            return;
        }
        this.Buffer = class extends Buffer {
            constructor(options: Buffer.OPTIONS) {
                super(gl, options)
            }
        }
        this.VertexArray = class extends VertexArray {
            constructor(...buffers:Buffer[]){
                super(gl,buffers)
            }
        }
        this.VertexArrayLayout = class extends VertexArrayLayout {
            constructor(options:VertexArrayLayout.OPTIONS){
                super(options)
            }
        }
        this.Drawer = class extends Drawer {
            constructor(){
                super(gl)
            }
        }
        this.Texture2D = class extends Texture2D {
            constructor(config?:Texture2D.CONFIG){
                super(gl,config)
            }
        }
        this.Texture3D = class extends Texture3D {
            constructor(config?:Texture3D.CONFIG){
                super(gl,config)
            }
        }
        this.TextureBase = class extends TextureBase {
            constructor(target:TextureBase.TARGET){
                super(gl,target)
            }
        }
        gl.samplerParameteri
        this.#gl = gl;
        this.context = gl;
    }
    readonly canvas: HTMLCanvasElement | OffscreenCanvas
    #gl: WebGL2RenderingContext;
    context:WebGL2RenderingContext;

    /**
     * A easy-to-use wrapper for WebGL2 Buffers.
     * 
     * - Offers **async** support for almost all functions.
     * 
     * - Allows batching via **.sync()**
     */
    readonly Buffer;

    /**
     * A easy-to-use wrapper for WebGL2 Vertex Arrays.
     * 
     * - Lets you easily add buffers to the vertex array.
     */
    readonly VertexArray;

    /**
     * Layout for a VertexArray.
     * 
     * Defines how a vertex array looks like.
     */
    readonly VertexArrayLayout;

    /**
     * A class to make drawing in webgl easy
     */
    readonly Drawer;

    /**
     * 2D texture support in WebGL2
     */
    readonly Texture2D;

    /**
     * 3D texture support in WebGL2
     */
    readonly Texture3D;

    /**
     * A helper to make Textures easily.
     * 
     * Use this if Texture3D or Texture2D dont work properly
     */
    readonly TextureBase;
}
//eslint-disable-next-line
export interface ContextControls extends RAW<WebGL2RenderingContext>, BRAND<"ContextControls"> { }

export default ContextControls;