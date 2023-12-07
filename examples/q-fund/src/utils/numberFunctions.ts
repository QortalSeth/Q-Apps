import * as colorsys from "colorsys";

export const truncateNumber = (value: string | number, sigDigits: number) => {
  return Number(value).toFixed(sigDigits);
};

export const changeLightness = (hexColor: string, amount: number) => {
  const hsl = colorsys.hex2Hsl(hexColor);
  hsl.l += amount;
  return colorsys.hsl2Hex(hsl);
};

export const removeTrailingZeros = (s: string) => {
  return Number(s).toString();
};

export const setNumberWithinBounds = (
  num: number,
  minValue: number,
  maxValue: number
) => {
  if (num > maxValue) return maxValue;
  if (num < minValue) return minValue;
  return num;
};
