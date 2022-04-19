const onlyUnique = (value: unknown, index: number, array: unknown[]) => {
  return array.indexOf(value) === index;
}

export { onlyUnique }