import * as colorsys from "colorsys";

export const changeLightness = (hexColor: string, amount: number) => {
  const hsl = colorsys.hex2Hsl(hexColor);
  hsl.l += amount;
  return colorsys.hsl2Hex(hsl);
};
