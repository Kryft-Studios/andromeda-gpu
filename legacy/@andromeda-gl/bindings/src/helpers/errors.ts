/**
 * Custom error type used throughout the bindings package.
 */
export class AndromedaError extends Error {
    readonly code: `AGPU_${number}`;
    
    constructor(code: number, message: string, hint?: string) {
        const fullMessage = `${message}\nHint: ${hint ?? "No Hint"}\nVisit docs at https://briklab-docs.pages.dev/packages/@andromeda-gl/bindings/ecodes/introduction.html`;
        super(fullMessage);
        
        this.name = `AGPU_${code}`;
        this.code = `AGPU_${code}`;
        
        Object.setPrototypeOf(this, AndromedaError.prototype);
    }
}

/**
 * Creates an {@link AndromedaError} with a standardized message format.
 */
export default function error(code: number, message: string, hint?: string): AndromedaError {
    return new AndromedaError(code, message, hint);
}
