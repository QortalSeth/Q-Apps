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
      const duration = moment.duration(endDate.diff(now));

      if (duration.asSeconds() <= 0) {
        setTimeRemaining('Crowdfunding has ended.');
        return;
      }

      const hours = String(duration.hours()).padStart(2, '0');
      const minutes = String(duration.minutes()).padStart(2, '0');
      const seconds = String(duration.seconds()).padStart(2, '0');
      setTimeRemaining(`${hours}:${minutes}:${seconds}`);
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
