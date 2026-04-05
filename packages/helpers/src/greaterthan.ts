type ENUMERATE<N extends number, ACC extends number[] = []> = 
    ACC['length'] extends N 
        ? ACC[number] 
        : ENUMERATE<N, [...ACC, ACC['length']]>;

type RANGE<START extends number, END extends number> = 
    Exclude<ENUMERATE<END>, ENUMERATE<START>>;

export default RANGE