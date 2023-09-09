import { Typography } from "@mui/material";
import { CustomCircularProgress, ProgressRow } from "./Progress-styles";
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
    <ProgressRow>
      <Typography variant="h6">
        Raised: ${+raised} / ${+goal}
      </Typography>
      <CustomCircularProgress
        size={115}
        thickness={13}
        variant="determinate"
        value={50}
      />
    </ProgressRow>
  );
};
