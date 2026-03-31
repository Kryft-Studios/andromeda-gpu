
export default function brand(str:string){
    return function (target:any,context:ClassDecoratorContext){
        target.prototype.__brand = str;
        Object.defineProperty(target, Symbol.hasInstance, {
            value: (instance: any) => instance?.__brand === str,
            configurable: true
        });
    }
}