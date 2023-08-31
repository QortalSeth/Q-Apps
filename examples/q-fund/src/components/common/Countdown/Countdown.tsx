import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import moment from 'moment';

interface CountdownProps {
  endDate: moment.Moment;
  blocksRemaning: number;
}

export const Countdown: React.FC<CountdownProps> = ({
  endDate,
  blocksRemaning,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = moment();
      console.log({ endDate });
      const duration = moment.duration(endDate.diff(now));
      console.log({ duration });
      if (duration.asSeconds() <= 0) {
        setTimeRemaining('Crowdfunding has ended.');
        return;
      }

      const totalMinutes = duration.asMinutes();
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = Math.floor(totalMinutes % 60);

      setTimeRemaining(`${days} days, ${hours} hours, ${minutes} minutes`);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [endDate]);

  return (
    <Box>
      <Typography variant="h6">
        Estimated Time Remaining: {timeRemaining}
      </Typography>
      <Typography variant="h6">
        Blocks Remaining: {blocksRemaning} - updated every 30 seconds
      </Typography>
    </Box>
  );
};
