/** Always return a real array for .map() safety. */
export function asArray(value) {
  return Array.isArray(value) ? value : [];
}
