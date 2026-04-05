import { error } from "@agpu/helpers/errors";
import MaterialDescriptor from "../materialdescriptors";
import Color from "@agpu/utils/color"
import { Vector2, Vector3, Vector4 } from "@agpu/utils";

class Material {
    #md:MaterialDescriptor
    constructor(md:MaterialDescriptor){
        this.#md=this.md=md;
    }
    readonly data = {}
    md:MaterialDescriptor
    set<T extends typeof this.md>(prop:keyof T["properties"],value:Color|Vector3|Vector2|Vector4){
        if(!(this.md as any)[prop])throw error("@agpu/material",1,"Invalid property")
        //@ts-ignore
        const propertyDescriptor:MaterialDescriptor.PROPERTY_REF = this.md[prop]
    }
}
export default Material;