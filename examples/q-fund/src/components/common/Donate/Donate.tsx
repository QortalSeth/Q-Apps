import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  InputAdornment,
  InputLabel,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useCallback, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import Portal from '../Portal';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
interface DonateProps {
  atAddress: string;
  onSubmit: () => void;
  onClose: () => void;
}
import QORT from '../../../assets/img/qort.png';
import { setNotification } from '../../../state/features/notificationsSlice';

export const Donate = ({ onSubmit, onClose, atAddress }: DonateProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  const dispatch = useDispatch();

  const resetValues = () => {
    setAmount(0);
    setIsOpen(false);
  };

  const sendCoin = async () => {
    try {
      if (!atAddress) return;

      if (isNaN(amount)) return;
      await qortalRequest({
        action: 'SEND_COIN',
        coin: 'QORT',
        destinationAddress: atAddress,
        amount: amount,
      });
      dispatch(
        setNotification({
          msg: 'Donation successfully sent',
          alertType: 'success',
        })
      );
      resetValues();
      onSubmit();
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === 'string') {
        notificationObj = {
          msg: error || 'Failed to send coin',
          alertType: 'error',
        };
      } else if (typeof error?.error === 'string') {
        notificationObj = {
          msg: error?.error || 'Failed to send coin',
          alertType: 'error',
        };
      } else {
        notificationObj = {
          msg: error?.message || 'Failed to send coin',
          alertType: 'error',
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));
    }
  };

  const getLogo = (coin: string) => {
    switch (coin) {
      case 'QORT':
        return QORT;
      default:
        '';
      // code block
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Tooltip title={`Support this crowdfund`} arrow>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen(prev => !prev)}
        >
          <Button variant="contained">Donate Now</Button>
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
              <Box
                sx={{
                  width: '300px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Box>
                  <InputLabel htmlFor="standard-adornment-amount">
                    Amount
                  </InputLabel>
                  <Input
                    id="standard-adornment-amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(+e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <img
                          style={{
                            height: '15px',
                            width: '15px',
                          }}
                          src={getLogo('QORT')}
                        />
                      </InputAdornment>
                    }
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
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
