/**
 * Utility function to filter array for unique values
 */
export function onlyUnique(
  _value: unknown,
  index: number,
  array: Array<unknown>
): boolean {
  return array.indexOf(_value) === index;
}
