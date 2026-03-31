
const STORE = {
    boundbuf: {
        onunbound:((()=>{}) as (()=>any)),
        curBufDrawUsage: 0 as number,
        curBound:null as WebGLBuffer|null
    },
    boundvao: {
        onunbound:((()=>{}) as (()=>any)),
        curBound:null as WebGLVertexArrayObject|null
    },
    boundtex: {
        onunbound:((()=>{}) as (()=>any)),
        curBound:null as WebGLTexture|null,
        texUsage: 0 as number
    }
}
export default STORE;