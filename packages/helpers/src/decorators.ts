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


export default function raw(key: string) {
    return function <T extends { new (...args: any[]): {} }>(
        target: T,
        context: ClassDecoratorContext
    ) {
        return class extends target {
            raw() {
                return (this as any)[key];
            }
        };
    };
}

type LABEL_CONFIG<T> = {
    get: (instance: T) => unknown;
    set: (instance: T, label: string) => unknown;
};

export function labeling<T>(config: LABEL_CONFIG<T>) {
    return function (target: any, context: ClassDecoratorContext) {
        target.prototype.label = function (val?: string) {
            if (typeof val === "undefined") {
                return config.get(this);
            }
            return config.set(this, val);
        };
    };
}


export function brand(str:string){
    return function (target:any,context:ClassDecoratorContext){
        target.prototype.__brand = str;
        Object.defineProperty(target, Symbol.hasInstance, {
            value: (instance: any) => instance?.__brand === str,
            configurable: true
        });
    }
}

