export const isIntegerNum = /^-?[0-9]+$/;
export const isFloatNum = /^-?[0-9]*\.?[0-9]*$/;
export const isAllZerosNum = /^0*\.?0*$/;

export const getSigDigits = (number: string) => {
  if (isIntegerNum.test(number)) return 0;
  const decimalSplit = number.split(".");
  return decimalSplit[decimalSplit.length - 1].length;
};

export const sigDigitsExceeded = (number: string, sigDigits: number) => {
  return getSigDigits(number) > sigDigits;
};

export const removeTrailingZeros = (s: string) => {
  return Number(s).toString();
};

export const mathOnStringNumbers = (
  s1: string,
  s2: string,
  operation: (n1: number, n2: number) => number
) => {
  const n1 = Number(s1);
  const n2 = Number(s2);
  if (isNaN(n1) || isNaN(n2)) throw TypeError("String is not a Number!");
  return operation(n1, n2).toString();
};
export const addStringNumbers = (s1: string, s2: string) => {
  return mathOnStringNumbers(s1, s2, (n1, n2) => {
    return n1 + n2;
  });
};

export const stringIsEmpty = (value: string) => {
  return value === "";
};

export const stringIsNaN = (value: string) => {
  return Number.isNaN(Number(value));
};

export const stringIsNumber = (value: string) => {
  return !stringIsNaN(value);
};

export const toNumber = (value: string | number) => {
  return Number(value);
};
export const toString = (value: string | number) => {
  return value.toString();
};
export const truncateNumber = (value: string | number, sigDigits: number) => {
  const valueNum = toNumber(value);
  return valueNum.toFixed(sigDigits);
};
