import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React, { forwardRef, useImperativeHandle, useState } from "react";

type eventType = React.ChangeEvent<HTMLInputElement>;
type BoundedNumericTextFieldProps = {
  minValue: number;
  maxValue: number;
  addIconButtons?: boolean;
  allowDecimals?: boolean;
  allowNegatives?: boolean;
  onChange?: (e: eventType) => void;
  initialValue?: string;
  sigDigits?: number;
} & TextFieldProps;

export type NumericTextFieldRef = {
  getTextFieldValue: () => string;
};

export const BoundedNumericTextField = forwardRef(
  (
    {
      minValue,
      maxValue,
      addIconButtons = true,
      allowDecimals = true,
      allowNegatives = false,
      onChange,
      initialValue,
      sigDigits = 6,
      ...props
    }: BoundedNumericTextFieldProps,
    ref?: React.Ref<NumericTextFieldRef>
  ) => {
    const [textFieldValue, setTextFieldValue] = useState<string>(
      initialValue || ""
    );

    const isInteger = /^-?[0-9]+$/;
    const isFloatNum = /^-?[0-9]*\.?[0-9]*$/;
    const isAllZerosNum = /^0*\.?0*$/;

    useImperativeHandle(
      ref,
      () => ({
        getTextFieldValue: () => {
          return textFieldValue;
        },
      }),
      [textFieldValue]
    );

    const isEmpty = (value: string) => {
      return value === "" || value == Number.isNaN(Number(value));
    };

    const skipMinMaxCheck = (value: string) => {
      const lastIndexIsDecimal = value.charAt(value.length - 1) === ".";

      const isAllZeros = isAllZerosNum.test(value);
      // skipping minMax on all 0s allows values less than 1 to be entered

      return lastIndexIsDecimal || isEmpty(value) || isAllZeros;
    };

    const setValueInBounds = (num: number) => {
      if (num > maxValue) return maxValue;
      if (num < minValue) return minValue;
      return num;
    };

    const setMinMaxValue = (value: string): string => {
      if (skipMinMaxCheck(value)) return value;
      const valueNum = Number(value);

      const boundedNum = setValueInBounds(valueNum);

      const numberInBounds = boundedNum === valueNum;
      return numberInBounds ? value : boundedNum.toString();
    };

    const isTooManySignificantDigits = (value: string) => {
      if (isInteger.test(value)) return false;

      const decimalSplit = value.split(".");
      const decimalDigits = decimalSplit[decimalSplit.length - 1].length;
      return decimalDigits > sigDigits;
    };

    const filterTypes = (value: string) => {
      if (allowDecimals === false) value = value.replace(".", "");
      if (allowNegatives === false) value = value.replace("-", "");
      if (isTooManySignificantDigits(value)) {
        value = value.substring(0, value.length - 1);
      }
      return value;
    };
    const filterValue = (value: string) => {
      if (isEmpty(value)) return value;
      value = filterTypes(value);
      if (isFloatNum.test(value)) {
        return setMinMaxValue(value);
      }
      return textFieldValue;
    };

    const listeners = (e: eventType) => {
      const newValue = filterValue(e.target.value);
      setTextFieldValue(newValue);
      e.target.value = newValue;
      if (onChange) onChange(e);
    };
    const removeTrailingZeros = (s: string) => {
      return Number(s).toString();
    };

    const changeValueWithIncDecButton = (changeAmount: number) => {
      const valueNum = Number(textFieldValue);
      const newValue = setMinMaxValue((valueNum + changeAmount).toString());
      setTextFieldValue(newValue);
    };

    const formatValueOnBlur = (e: eventType) => {
      let value = e.target.value;
      if (isEmpty(value) || value === ".") {
        setTextFieldValue("");
        return;
      }

      value = setMinMaxValue(value);
      value = removeTrailingZeros(value);
      if (isAllZerosNum.test(value)) value = minValue.toString();
      setTextFieldValue(value);
    };
    return (
      <TextField
        {...props}
        InputProps={
          addIconButtons
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => changeValueWithIncDecButton(1)}>
                      <AddIcon />{" "}
                    </IconButton>
                    <IconButton onClick={() => changeValueWithIncDecButton(-1)}>
                      <RemoveIcon />{" "}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : {}
        }
        onChange={e => listeners(e as eventType)}
        onBlur={e => {
          formatValueOnBlur(e as eventType);
        }}
        autoComplete="off"
        value={textFieldValue}
      />
    );
  }
);

export default BoundedNumericTextField;
