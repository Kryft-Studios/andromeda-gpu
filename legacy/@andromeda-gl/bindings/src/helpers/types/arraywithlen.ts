type ARRAY_WITH_LENGTH<
    L extends number, 
    T = any, 
    R extends any[] = []
> = (R['length'] extends L 
    ? R 
    : ARRAY_WITH_LENGTH<L, T, [T, ...R]>)&Array<T>;

export default ARRAY_WITH_LENGTH