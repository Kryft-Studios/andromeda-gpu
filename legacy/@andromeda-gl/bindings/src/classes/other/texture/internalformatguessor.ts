type TEXTUREFORMATPACK = {
    internalFormat: number;
    format: number;
    type: number;
};


export function guessTextureParameters(
    gl: WebGL2RenderingContext,
    data: TexImageSource | ArrayBufferView,
    width: number,
    height: number,
    depth: number = 1
): TEXTUREFORMATPACK {
    if (!(data instanceof Int8Array || data instanceof Uint8Array || 
          data instanceof Float32Array || data instanceof Uint16Array || 
          data instanceof Uint32Array || data instanceof Int16Array || 
          data instanceof Int32Array)) {
        return {
            internalFormat: gl.RGBA8,
            format: gl.RGBA,
            type: gl.UNSIGNED_BYTE
        };
    }

    const totalPixels = width * height * depth;
    const totalElements = (data as any).length; 
    const channels = totalElements / totalPixels;

    if (data instanceof Float32Array) {
        const types = {
            1: { internalFormat: gl.R32F,    format: gl.RED,  type: gl.FLOAT },
            2: { internalFormat: gl.RG32F,   format: gl.RG,   type: gl.FLOAT },
            3: { internalFormat: gl.RGB32F,  format: gl.RGB,  type: gl.FLOAT },
            4: { internalFormat: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT }
        };
        return types[channels as keyof typeof types] || types[4];
    }

    if (data instanceof Uint8Array) {
        const types = {
            1: { internalFormat: gl.R8,    format: gl.RED,  type: gl.UNSIGNED_BYTE },
            2: { internalFormat: gl.RG8,   format: gl.RG,   type: gl.UNSIGNED_BYTE },
            3: { internalFormat: gl.RGB8,  format: gl.RGB,  type: gl.UNSIGNED_BYTE },
            4: { internalFormat: gl.RGBA8, format: gl.RGBA, type: gl.UNSIGNED_BYTE }
        };
        return types[channels as keyof typeof types] || types[4];
    }

    if (data instanceof Uint16Array) {
        const types = {
            1: { internalFormat: gl.R16UI,    format: gl.RED_INTEGER,  type: gl.UNSIGNED_SHORT },
            4: { internalFormat: gl.RGBA16UI, format: gl.RGBA_INTEGER, type: gl.UNSIGNED_SHORT }
        };
        return types[channels as keyof typeof types] || types[4];
    }

    return {
        internalFormat: gl.RGBA8,
        format: gl.RGBA,
        type: gl.UNSIGNED_BYTE
    };
}