import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { setNumberWithinBounds } from "../Utility_Functions/Numbers/Numbers";
import {
  isAllZerosNum,
  isFloatNum,
  isIntegerNum,
  removeTrailingZeros,
  sigDigitsExceeded,
  stringIsEmptyNumber,
} from "../Utility_Functions/Numbers/StringNumbers";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type eventType = React.ChangeEvent<HTMLInputElement>;
type BoundedNumericTextFieldProps = {
  minValue: number;
  maxValue: number;
  addIconButtons?: boolean;
  allowDecimals?: boolean;
  allowNegatives?: boolean;
  onChange?: (e: eventType) => void;
  initialValue?: string;
  maxSigDigits?: number;
} & TextFieldProps;

export type BoundedNumericTextFieldRef = {
  getValue: () => string;
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
      maxSigDigits = 6,
      ...props
    }: BoundedNumericTextFieldProps,
    ref?: React.Ref<BoundedNumericTextFieldRef>
  ) => {
    const [textFieldValue, setTextFieldValue] = useState<string>(
      initialValue || ""
    );

    useImperativeHandle(
      ref,
      () => ({
        getValue: () => {
          return textFieldValue;
        },
      }),
      [textFieldValue]
    );

    const skipMinMaxCheck = (value: string) => {
      const lastIndexIsDecimal = value.charAt(value.length - 1) === ".";
      const isEmpty = stringIsEmptyNumber(value);
      const isAllZeros = isAllZerosNum.test(value);
      const isInteger = isIntegerNum.test(value);
      // skipping minMax on all 0s allows values less than 1 to be entered

      return lastIndexIsDecimal || isEmpty || (isAllZeros && !isInteger);
    };

    const setMinMaxValue = (value: string): string => {
      if (skipMinMaxCheck(value)) return value;
      const valueNum = Number(value);

      const boundedNum = setNumberWithinBounds(valueNum, minValue, maxValue);

      const numberInBounds = boundedNum === valueNum;
      return numberInBounds ? value : boundedNum.toString();
    };

    const filterTypes = (value: string) => {
      if (allowDecimals === false) value = value.replace(".", "");
      if (allowNegatives === false) value = value.replace("-", "");
      if (sigDigitsExceeded(value, maxSigDigits)) {
        value = value.substring(0, value.length - 1);
      }
      return value;
    };
    const filterValue = (value: string) => {
      if (stringIsEmptyNumber(value)) return "";
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

    const changeValueWithIncDecButton = (e, changeAmount: number) => {
      const valueNum = Number(textFieldValue);
      const newValue = setMinMaxValue((valueNum + changeAmount).toString());
      if (e?.target?.value) e.target.value = newValue;
      if (onChange) onChange(e);
      setTextFieldValue(newValue);
    };

    const formatValueOnBlur = (e: eventType) => {
      let value = e.target.value;
      if (stringIsEmptyNumber(value) || value === ".") {
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
        InputProps={{
          ...props?.InputProps,
          endAdornment: addIconButtons ? (
            <InputAdornment position="end">
              <IconButton onClick={e => changeValueWithIncDecButton(e, 1)}>
                <AddIcon />{" "}
              </IconButton>
              <IconButton onClick={e => changeValueWithIncDecButton(e, -1)}>
                <RemoveIcon />{" "}
              </IconButton>
            </InputAdornment>
          ) : (
            <></>
          ),
        }}
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
