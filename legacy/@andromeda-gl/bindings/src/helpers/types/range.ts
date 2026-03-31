type ENUMERATE<N extends number, ACC extends number[] = []> = 
    ACC['length'] extends N
    ? ACC[number]
    : ENUMERATE<N, [...ACC, ACC['length']]>;

 type RANGE<F extends number, T extends number> = 
    Exclude<ENUMERATE<T>,ENUMERATE<F>>;
export default RANGE