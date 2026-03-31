/**
 * Rounds `n` up to the next multiple of `alignment`.
 */
export const align = (n:number, alignment:number) => Math.ceil(n / alignment) * alignment;
export default align
