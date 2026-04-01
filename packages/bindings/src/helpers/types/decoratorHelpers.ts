export interface RAW<T> {
    /**Get the raw source of the specific class. */
    raw():T
}
export interface BRAND<T extends string>{
    readonly __brand:T
    [Symbol.hasInstance](instance:any):boolean
}

export interface LABEL {
    /**GET the label of the specific class*/
    label(): string;
    /**SET the label of the specific class*/
    label<T extends string>(val: T): T;
}