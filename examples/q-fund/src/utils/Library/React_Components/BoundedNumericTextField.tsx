import {
  IconButton,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { setNumberWithinBounds } from "../Utility_Functions/Numbers/Numbers";
import {
  isAllZerosNum,
  isFloatNum,
  isIntegerNum,
  removeTrailingZeros,
  sigDigitsExceeded,
  stringIsEmpty,
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

export const BoundedNumericTextField = ({
  minValue,
  maxValue,
  addIconButtons = true,
  allowDecimals = true,
  allowNegatives = false,
  onChange,
  initialValue,
  maxSigDigits = 6,
  ...props
}: BoundedNumericTextFieldProps) => {
  const [textFieldValue, setTextFieldValue] = useState<string>(
    initialValue || ""
  );
  const ref = useRef<HTMLInputElement | null>(null);

  const skipMinMaxCheck = (value: string) => {
    const lastIndexIsDecimal = value.charAt(value.length - 1) === ".";
    const isEmpty = stringIsEmpty(value);
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
    if (stringIsEmpty(value)) return "";
    value = filterTypes(value);
    if (isFloatNum.test(value)) {
      return setMinMaxValue(value);
    }
    return textFieldValue;
  };

  const listeners = (e: eventType) => {
    // console.log("changeEvent:", e);
    const newValue = filterValue(e.target.value);
    setTextFieldValue(newValue);
    e.target.value = newValue;
    if (onChange) onChange(e);
  };

  const changeValueWithIncDecButton = (e, changeAmount: number) => {
    const valueNum = Number(textFieldValue);
    const newValue = (valueNum + changeAmount).toString();

    // const newValue = setMinMaxValue((valueNum + changeAmount).toString());
    // if (e?.target?.value) e.target.value = newValue;
    // if (onChange) onChange(e);
    // setTextFieldValue(newValue);

    // if (ref.current) {
    //   ref.current.value = newValue;
    //   setTextFieldValue(newValue);
    //   const event = new Event("input", { bubbles: true });
    //   ref.current.dispatchEvent(event);
    // }
  };

  const formatValueOnBlur = (e: eventType) => {
    let value = e.target.value;
    if (stringIsEmpty(value) || value === ".") {
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
      inputRef={ref}
    />
  );
};

export default BoundedNumericTextField;
