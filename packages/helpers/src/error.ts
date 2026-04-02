/**
 * Custom error type used throughout the bindings package.
 */
export class AndromedaError extends Error {
    readonly code: `AGPU_${number}`;
    readonly name: typeof this.code;
    readonly message: `${string}\nHint: ${string}\nVisit docs at https://briklab-docs.pages.dev/packages/${string}/ecodes/introduction.html`
    readonly pkg:string
    constructor(pkg:string,code: number, message: string, hint?: string) {
        const fullMessage = `${message}\nHint: ${hint ?? "No Hint"}\nVisit docs at https://briklab-docs.pages.dev/packages/${pkg}/ecodes/introduction.html`;
        super(fullMessage);
        const a:typeof this.message = fullMessage as typeof this.message
        this.pkg = pkg;        
        this.message = a;
        this.name = `AGPU_${code}`;
        this.code = `AGPU_${code}`;
        
        Object.setPrototypeOf(this, AndromedaError.prototype);
    }
}

/**
 * Creates an {@link AndromedaError} with a standardized message format.
 */
export function error(pkg:string,code: number, message: string, hint?: string): AndromedaError {
    return new AndromedaError(pkg, code, message, hint);
}
