
import {AndromedaError, error as err} from "@agpu/helpers/errors";
/**
 * Creates an {@link AndromedaError} with a standardized message format.
 */
export default function error(code: number, message: string, hint?: string): AndromedaError {
    return err("@agpu/bindings",code, message, hint);
}
