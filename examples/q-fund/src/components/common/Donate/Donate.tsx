import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useDispatch } from "react-redux";
import Portal from "../Portal";
import { setNotification } from "../../../state/features/notificationsSlice";
import {
  CrowdfundPageDonateButton,
  DonateModalCol,
  DonateModalLabel,
} from "./Donate-styles";
import { QortalSVG } from "../../../assets/svgs/QortalSVG";
import BoundedNumericTextField from "../../../../../../Library/React_Components/BoundedNumericTextField";

interface DonateProps {
  atAddress: string;
  ATDonationPossible: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export const Donate = ({
  onSubmit,
  onClose,
  atAddress,
  ATDonationPossible,
}: DonateProps) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const resetValues = () => {
    setAmount(0);
    setIsOpen(false);
  };

  const sendCoin = async () => {
    try {
      if (!atAddress) return;

      if (isNaN(amount)) return;
      await qortalRequest({
        action: "SEND_COIN",
        coin: "QORT",
        destinationAddress: atAddress,
        amount: amount,
      });
      dispatch(
        setNotification({
          msg: "Donation successfully sent",
          alertType: "success",
        })
      );
      resetValues();
      onSubmit();
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to send coin",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to send coin",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to send coin",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Tooltip title={`Support this crowdfund`} arrow>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <CrowdfundPageDonateButton
            onClick={() => setIsOpen(prev => !prev)}
            disabled={!ATDonationPossible}
            variant="contained"
          >
            Donate Now
          </CrowdfundPageDonateButton>
        </Box>
      </Tooltip>
      {isOpen && (
        <Portal>
          <Dialog
            open={isOpen}
            onClose={() => setIsOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title"></DialogTitle>
            <DialogContent>
              <DonateModalCol>
                <DonateModalLabel htmlFor="standard-adornment-amount">
                  Amount
                </DonateModalLabel>
                <BoundedNumericTextField
                  style={{ fontFamily: "Mulish" }}
                  minValue={1}
                  maxValue={Number.MAX_SAFE_INTEGER}
                  id="standard-adornment-amount"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  variant={"standard"}
                  allowDecimals={false}
                  allowNegatives={false}
                  addIconButtons={false}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QortalSVG
                          height="20px"
                          width="20px"
                          color={theme.palette.text.primary}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </DonateModalCol>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="error"
                style={{ color: "#c92727ff" }}
                onClick={() => {
                  setIsOpen(false);
                  resetValues();
                  onClose();
                }}
              >
                Close
              </Button>
              <Button variant="contained" onClick={sendCoin}>
                Send Coin
              </Button>
            </DialogActions>
          </Dialog>
        </Portal>
      )}
    </Box>
  );
};
