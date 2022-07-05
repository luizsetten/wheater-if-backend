export function convertToNumberFixed(number: any, dividerSize = 2, dividerSymbol = ',') {
  if (typeof number === 'number') return number.toFixed(dividerSize).replace('.', dividerSymbol);
  return Number(0).toFixed(dividerSize).replace('.', dividerSymbol);
}
