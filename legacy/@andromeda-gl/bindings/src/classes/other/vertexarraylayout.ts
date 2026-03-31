import RANGE from "../../helpers/types/range";

export class VertexArrayLayout {
    constructor(opts:VertexArrayLayout.OPTIONS){
        this.#attr = opts.attributes;
    }
    attributes(){return this.#attr}
    readonly #attr:VertexArrayLayout.ATTRIBUTE[]
}
export namespace VertexArrayLayout {
    export interface OPTIONS {
        attributes: ATTRIBUTE[]
    }
    export interface ATTRIBUTE {
        name:string;
        normalized?:boolean;
        size:RANGE<1,5>;
    }
    
}
export default VertexArrayLayout;