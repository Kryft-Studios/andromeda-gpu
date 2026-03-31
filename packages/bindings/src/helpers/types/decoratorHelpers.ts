export interface RAW<T> {
    raw():T
}
export interface BRAND<T extends string>{
    readonly __brand:T
    [Symbol.hasInstance](instance:any):boolean
}

export interface LABEL {
    label(): string;
    label<T extends string>(val: T): T;
}