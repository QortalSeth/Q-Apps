import { useEffect, useState } from "react";
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
  donateButtonColor,
  DonateModalCol,
  DonateModalLabel,
} from "./Donate-styles";
import { QortalSVG } from "../../../assets/svgs/QortalSVG";
import BoundedNumericTextField from "../../../utils/BoundedNumericTextField";
import {
  getUserAccount,
  getUserBalance,
  searchTransactions,
} from "../../../utils/qortalRequestFunctions.ts";
import {
  changeLightness,
  truncateNumber,
} from "../../../utils/numberFunctions.ts";

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
  const [currentBalance, setCurrentBalance] = useState<string>("");
  const [disableDonation, setDisableDonation] = useState<boolean>(true);

  const unsafeDonationHelperText =
    "You have a previous donation with this amount, please choose a different value.";
  const emptyDonationHelperText = "Donation amount must not be empty";

  const [helperText, setHelperText] = useState<string>(emptyDonationHelperText);
  const resetValues = () => {
    setAmount(0);
    setIsOpen(false);
  };

  const getPastDonations = async () => {
    const userAccountInfo = await getUserAccount();
    const donorResponse = await searchTransactions({
      txType: ["PAYMENT"],
      address: atAddress,
      confirmationStatus: "BOTH",
    });

    const pastDonations = donorResponse.filter(searchResponse => {
      return searchResponse.creatorAddress === userAccountInfo.address;
    });

    return pastDonations.map(donation => +donation.amount);
  };

  const sendCoin = async () => {
    try {
      if (!atAddress) return;
      if (isNaN(amount)) return;

      // Check one last time if the AT has finished and if so, don't send the coin
      const url = `/at/${atAddress}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();
      if (response.status !== 200 || responseDataSearch?.isFinished) {
        dispatch(
          setNotification({
            msg: "This crowdfund has ended",
            alertType: "error",
          })
        );
        resetValues();
        return;
      }
      // Prevent them from sending a coin if there's 4 blocks left or less to avoid timing issues
      const url2 = `/blocks/height`;
      const blockHeightResponse = await fetch(url2, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const blockHeight = await blockHeightResponse.json();
      const diff = +responseDataSearch?.sleepUntilHeight - +blockHeight;
      if (diff <= 4) {
        dispatch(
          setNotification({
            msg: "This crowdfund has ended",
            alertType: "error",
          })
        );
        resetValues();
        return;
      }
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

  const allowDonationIfSafe = async (value: number) => {
    const pastDonationAmounts = await getPastDonations();
    const unsafeDonation = pastDonationAmounts.includes(value);
    if (unsafeDonation) {
      setDisableDonation(true);
      setHelperText(unsafeDonationHelperText);
    } else if (isNaN(value) || value === 0) {
      setDisableDonation(true);
      setHelperText(emptyDonationHelperText);
    } else {
      setDisableDonation(false);
      setHelperText("");
    }
    setAmount(value);
  };

  useEffect(() => {
    getUserBalance().then(foundBalance => {
      setCurrentBalance(truncateNumber(foundBalance, 2));
    });
  }, []);
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Tooltip
        title={`Support this crowdfund`}
        arrow
        disableHoverListener={!ATDonationPossible}
      >
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
                  onChange={value => allowDonationIfSafe(+value)}
                  variant={"standard"}
                  allowDecimals={false}
                  allowNegatives={false}
                  addIconButtons={true}
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
                  error={disableDonation}
                  helperText={helperText}
                  FormHelperTextProps={{ sx: { fontSize: 20 } }}
                />
              </DonateModalCol>
              {currentBalance ? (
                <div>You have {currentBalance} QORT</div>
              ) : (
                <></>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setIsOpen(false);
                  resetValues();
                  onClose();
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={sendCoin}
                sx={{
                  color: "white",
                  backgroundColor: donateButtonColor,
                  "&:hover": {
                    backgroundColor: changeLightness(donateButtonColor, -10),
                  },
                }}
                disabled={disableDonation}
              >
                Send Coin
              </Button>
            </DialogActions>
          </Dialog>
        </Portal>
      )}
    </Box>
  );
};
