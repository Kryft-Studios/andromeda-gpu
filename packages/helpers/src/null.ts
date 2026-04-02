/**
 * Convenience alias for values that may be `null` or `undefined`.
 */
type NULLISH = undefined|null
export {NULLISH};

/**
 * Convenience alias for `T | null | undefined`.
 */
type UNSURE<T> = T|NULLISH
export default UNSURE
