type LABEL_CONFIG<T> = {
    get: (instance: T) => unknown;
    set: (instance: T, label: string) => unknown;
};

export default function labeling<T>(config: LABEL_CONFIG<T>) {
    return function (target: any, context: ClassDecoratorContext) {
        target.prototype.label = function (val?: string) {
            if (typeof val === "undefined") {
                return config.get(this);
            }
            return config.set(this, val);
        };
    };
}
