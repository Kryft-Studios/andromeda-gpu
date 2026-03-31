
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