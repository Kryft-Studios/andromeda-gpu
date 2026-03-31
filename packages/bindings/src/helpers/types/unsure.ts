import NULLISH from "./nullish";

/**
 * Convenience alias for `T | null | undefined`.
 */
type UNSURE<T> = T|NULLISH
export default UNSURE
