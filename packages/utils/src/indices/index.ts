export default function indices(arr: number[]) {
    const max = Math.max(...arr)
    
    if (max > 65535) {
        return new Uint32Array(arr)
    }

    return new Uint16Array(arr)
}