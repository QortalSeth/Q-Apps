import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
  TextFieldVariants,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React, { forwardRef, useImperativeHandle, useState } from "react";

type eventType = React.ChangeEvent<HTMLInputElement>;
interface NumericTextFieldProps<T extends TextFieldVariants>
  extends TextFieldProps<T> {
  minValue: number;
  maxValue: number;
  addIconButtons?: boolean;
  allowDecimals?: boolean;
  allowNegatives?: boolean;
  onChange?: (e: eventType) => void;
  initialValue?: string;
  variant?: T;
  // variant error is caused by Typescript not knowing variant's value at compile time
  // it doesn't cause issues at runtime
}

export type NumericTextFieldRef = {
  getTextFieldValue: () => string;
};

export const NumericTextField = forwardRef(
  <T extends TextFieldVariants>(
    {
      minValue,
      maxValue,
      addIconButtons = true,
      allowDecimals = true,
      allowNegatives = false,
      onChange,
      initialValue,
      variant = "standard",
      ...props
    }: NumericTextFieldProps<T>,
    ref?: React.Ref<NumericTextFieldRef>,
  ) => {
    const [textFieldValue, setTextFieldValue] = useState<string>(
      initialValue || "",
    );
    useImperativeHandle(
      ref,
      () => ({
        getTextFieldValue: () => {
          return textFieldValue;
        },
      }),
      [textFieldValue],
    );
    const skipMinMaxCheck = (value: string) => {
      const lastIndexIsDecimal = value.charAt(value.length - 1) === ".";
      const isEmpty = value === "";
      const allZerosRegex = /^0*\.?0*$/;
      const isAllZeros = allZerosRegex.test(value);
      // skipping minMax on all 0s allows values less than 1 to be entered
      const skipCheck = lastIndexIsDecimal || isEmpty || isAllZeros;
      return skipCheck;
    };
    const setMinMaxValue = (value: string): string => {
      if (skipMinMaxCheck(value)) return value;

      const valueNum = Number(value);
      // Bounds checking on valueNum
      let minMaxNum = valueNum;
      minMaxNum = Math.min(minMaxNum, maxValue);
      minMaxNum = Math.max(minMaxNum, minValue);
      const numberInBounds = minMaxNum === valueNum;
      return numberInBounds ? value : minMaxNum.toString();
    };

    const filterValue = (value: string, emptyReturn = "") => {
      if (allowDecimals === false) value = value.replace(".", "");
      if (allowNegatives === false) value = value.replace("-", "");
      if (value === "") return emptyReturn;

      const isNum = /^-?[0-9]*\.?[0-9]*$/;

      if (isNum.test(value)) {
        return setMinMaxValue(value);
      }
      return textFieldValue;
    };

    const changeValueWithIncDecButton = (changeAmount: number) => {
      const valueNum = Number(textFieldValue);
      const newValue = setMinMaxValue((valueNum + changeAmount).toString());
      setTextFieldValue(newValue);
    };

    const listeners = (e: eventType) => {
      const newValue = filterValue(e.target.value);
      setTextFieldValue(newValue);
      if (onChange) onChange(e);
    };
    const removeTrailingZeros = (s: string) => {
      return Number(s).toString();
    };
    return (
      <TextField
        {...props}
        variant={variant}
        InputProps={
          addIconButtons
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={(e) => changeValueWithIncDecButton(1)}>
                      <AddIcon />{" "}
                    </IconButton>
                    <IconButton
                      onClick={(e) => changeValueWithIncDecButton(-1)}
                    >
                      <RemoveIcon />{" "}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : {}
        }
        onChange={(e) => listeners(e as eventType)}
        onBlur={(e) => {
          const value = setMinMaxValue(e.target.value || minValue);
          setTextFieldValue(removeTrailingZeros(value));
        }}
        autoComplete="off"
        value={textFieldValue}
      />
    );
  },
);

export default NumericTextField;
