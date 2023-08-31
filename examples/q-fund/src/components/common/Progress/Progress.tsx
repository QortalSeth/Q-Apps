import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CrowdfundProgressProps {
  raised: number;
  goal: number;
}

export const CrowdfundProgress: React.FC<CrowdfundProgressProps> = ({
  raised,
  goal,
}) => {
  const progress = (+raised / +goal) * 100;

  return (
    <Box>
      <Typography variant="h6">
        Raised: ${+raised} / ${+goal}
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
};
