import { IconButton, InputAdornment, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React, { useImperativeHandle, useState } from "react";

export enum Variant {
  filled = "filled",
  standard = "standard",
  outlined = "outlined"
}
interface TextFieldProps {
  name: string;
  label: string;
  required: boolean;
  minValue: number;
  maxValue: number;
  variant?: Variant;
  addIconButtons?: boolean;
  allowDecimals?: boolean;
  onChange?: (e: string) => void;
  initialValue?: string;
  style?: object;
}

export type NumericTextFieldRef = {
  getTextFieldValue: () => string;
};

const NumericTextField = React.forwardRef<NumericTextFieldRef, TextFieldProps>(
  (
    {
      name,
      label,
      variant,
      required,
      style,
      minValue,
      maxValue,
      addIconButtons = true,
      allowDecimals = true,
      onChange,
      initialValue
    }: TextFieldProps,
    ref
  ) => {
    const [textFieldValue, setTextFieldValue] = useState<string>(
      initialValue || ""
    );
    const [isDecimalError, setIsDecimalError] = useState<boolean>(false);
    const [helperText, setHelperText] = useState<string>("");

    const invalidNumberError = "Entered value is not a number";

    useImperativeHandle(
      ref,
      () => ({
        getTextFieldValue: () => {
          return textFieldValue;
        }
      }),
      [textFieldValue]
    );

    const checkDecimalErrors = (value: string) => {
      let decCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (value.charAt(i) === ".") decCount++;
      }
      const hasTrailingDecimal = value.charAt(value.length - 1) === ".";
      if (decCount > 1 || hasTrailingDecimal) {
        setIsDecimalError(true);
        setHelperText(invalidNumberError);
        return true;
      }
      setIsDecimalError(false);
      setHelperText("");
      return false;
    };

    const setMinMaxValue = (value: string): string => {
      const lastIndexIsDecimal = value.charAt(value.length - 1) === ".";
      if (lastIndexIsDecimal) return value;

      let valueNum = Number(value);

      // Bounds checking on valueNum
      valueNum = Math.min(valueNum, maxValue);
      valueNum = Math.max(valueNum, minValue);
      return valueNum.toString();
    };

    const filterValue = (value: string, emptyReturn = "") => {
      if (allowDecimals === false) value = value.replace(".", "");
      if (value === "-1") return emptyReturn;

      const isPositiveNum = /[0-9.]+/;
      const isNotNum = /[^0-9.]/;

      isPositiveNum.test(value);

      const decimalError = checkDecimalErrors(value);

      if (isPositiveNum && !decimalError) {
        const minMaxCheck = setMinMaxValue(value);
        return minMaxCheck;
      }
      const newString: string = value.replace(isNotNum, "");
      return newString;
    };

    const changeValueWithButton = (changeAmount: number) => {
      const valueNum = Number(textFieldValue);
      const newValue = setMinMaxValue((valueNum + changeAmount).toString());
      setTextFieldValue(newValue);
    };

    const listeners = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = filterValue(e.target.value || "-1");
      setTextFieldValue(newValue);
      if (onChange) onChange(newValue);
    };

    return (
      <TextField
        {{...style}}
        name={name}
        label={label}
        required={required}
        variant={variant}
        error={isDecimalError}
        helperText={helperText}
        InputProps={
          addIconButtons
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={(e) => changeValueWithButton(1)}>
                      <AddIcon />{" "}
                    </IconButton>
                    <IconButton onClick={(e) => changeValueWithButton(-1)}>
                      <RemoveIcon />{" "}
                    </IconButton>
                  </InputAdornment>
                )
              }
            : {}
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => listeners(e)}
        autoComplete="off"
        value={textFieldValue}
      />
    );
  }
);

export default NumericTextField;
