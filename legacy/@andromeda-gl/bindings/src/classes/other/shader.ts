import error from "../../helpers/errors";

export class Shader {
    constructor(gl: WebGL2RenderingContext, type: "vertex" | "fragment", source: string) {
        let a = (this.#gl = gl).createShader(gl[(this.#type=((type === "vertex" ? "VERTEX" : "FRAGMENT") + "_SHADER") as "VERTEX_SHADER" | "FRAGMENT_SHADER")])
        if (!a) throw error(2, "failed to create shader")
        gl.shaderSource((this.#s = a), (this.#src = source))
    }
    #type:"VERTEX_SHADER"|"FRAGMENT_SHADER"
    #gl: WebGL2RenderingContext;
    #s: WebGLShader;
    #src: string;
    #alreadyCompiled: boolean = false;
    compile() {
        if(this.#deleted)throw error(6,"Shader is already destroyed");
        if (this.#alreadyCompiled) return;
        this.#gl.compileShader(this.#s);
        if (!this.#gl.getShaderParameter(this.#s, this.#gl.COMPILE_STATUS)) {
            const log = this.#gl.getShaderInfoLog(this.#s);
            throw error(4, `Shader Compilation Failed: ${log}`);
        }
        this.#alreadyCompiled = true;
    }
    [Symbol.dispose](){
        this.delete()
    }
    source(){
        if(this.#deleted)throw error(6,"Shader is already destroyed");
        return this.#src
    }
    raw() {if(this.#deleted)throw error(6,"Shader is already destroyed"); return this.#s; }
    #deleted:boolean=false;
    delete(){
        if(this.#deleted)return;
        this.#deleted=true;
        return this.#gl.deleteShader(this.#s)
    }

    type(){if(this.#deleted)throw error(6,"Shader is already destroyed");return this.#type}
}

export default Shader;