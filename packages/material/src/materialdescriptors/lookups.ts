export const VertexFormatOffsetLookup: Record<GPUVertexFormat, number> = {
    "float16": 2,
    "float16x2": 4,
    "float16x4": 8,

    "float32": 4,
    "float32x2": 8,
    "float32x3": 12,
    "float32x4": 16, 

    "sint16": 2,   
    "sint16x2": 4, 
    "sint16x4": 8, 
    "uint16": 2,
    "uint16x2": 4,
    "uint16x4": 8,

    "sint32": 4,
    "sint32x2": 8,
    "sint32x3": 12,
    "sint32x4": 16,
    "uint32": 4,
    "uint32x2": 8,
    "uint32x3": 12,
    "uint32x4": 16,

    "sint8": 1,
    "sint8x2": 2,
    "sint8x4": 4,
    "uint8": 1,
    "uint8x2": 2,
    "uint8x4": 4,

    "snorm8": 1,
    "snorm8x2": 2,
    "snorm8x4": 4,
    "unorm8": 1,
    "unorm8x2": 2,
    "unorm8x4": 4,
    "unorm8x4-bgra": 4,

    "snorm16": 2,    
    "snorm16x2": 4,
    "snorm16x4": 8,  
    "unorm16": 2,  
    "unorm16x2": 4, 
    "unorm16x4": 8,  
    "unorm10-10-10-2": 4,
    
}

function vec<T extends `${"f"|"u"|"i"}${32|16}`,S extends 2|3|4>(type:T,size:S):{type:T,size:S}{
    return {type,size}
}
export const VecLookup = {
    vec2f:vec("f32",2), 
    vec3f:vec("f32",3),
    vec4f:vec("f32",4),
    vec2h:vec("f16",2),
    vec3h:vec("f16",3),
    vec4h:vec("f16",4),
    vec2i:vec("i32",2),
    vec3i:vec("i32",3),
    vec4i:vec("i32",4),
    vec2u:vec("u32",2),
    vec3u:vec("u32",3),
    vec4u:vec("u32",4)
} as const;