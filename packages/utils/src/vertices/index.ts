
function vertices(arr:number[][][],layout:Attribute.OPTIONS[]){
    // check all arrays according to layout
    const expectedArrayLen = layout.reduce((sum, attr) => sum + attr.size, 0)
    if(!arr.every(a=>a.length===expectedArrayLen))throw new TypeError("Invalid tuples passed",{"cause":"Expected length is "+expectedArrayLen})
    const data = new Float32Array(arr.flat(2))
    const stride = expectedArrayLen * 4;
    let attributes = []
    let currOffset = 0;
    for(let i=0;i<layout.length;i++){
        attributes.push({
            name:layout[i].name,
            size:layout[i].size,
            offset:currOffset,
            location:i,
            type: Object.assign("float32",{
                webgpu:"float32x"+layout[i].size,
                webgl:{
                    enum:5126 as WebGL2RenderingContext["FLOAT"]
                }
            })
        })
        currOffset += layout[i].size * 4;
    }
    return {data,stride,attributes}
}

// #region Attributes
type TUPLE_OF<N extends number, T = number> = 
    number extends N ? T[] : TUPLE_OF_HELPER<N, T, []>;

type TUPLE_OF_HELPER<N extends number, T, R extends readonly any[]> = 
    R['length'] extends N ? R : TUPLE_OF_HELPER<N, T, [...R, T]>;

type ATTRIBUTE<T extends Attribute.OPTIONS> = {
    <R extends TUPLE_OF<T["size"]>>(...values: R): R;
    layout: T;
};
namespace Attribute {
    export interface OPTIONS {
        size: number;
        name:string;
        type?:"f32"
        //normalized?: boolean;
    }

    export function create<const T extends OPTIONS>(options: T): ATTRIBUTE<T> {
        const fn = ((...values: number[]) => {
            if (values.length !== options.size) {
                throw new Error(`Expected ${options.size} values, got ${values.length}`);
            }
            return values;
        })

        return Object.assign(fn, { layout: options }) as ATTRIBUTE<T>
    }
}

export const color = Attribute.create({size:3,name:"color"})
export const pos = Attribute.create({size:3,name:"pos"})
//#endregion Attributes
export { Attribute, ATTRIBUTE };
export default vertices;