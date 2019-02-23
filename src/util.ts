export function* range(start: number, end: number): Iterable<number> {
  for (let n = start; n < end; n++) {
    yield n;
  }
}

export function assignArray<Elem, Arr extends Array<Elem> | ReadonlyArray<Elem>>(
  array: Arr,
  index: number,
  value: Elem,
): Arr {
  const newArray = array.slice();
  newArray[index] = value;
  return newArray as Arr;
}
