import { useTheme } from "@mui/material";
import {
  CustomCircularProgress,
  FundAmount,
  FundAmountNumber,
  FundAmountsCol,
  FundAmountsRow,
  ProgressRow,
} from "./Progress-styles";
import { QortalSVG } from "../../../assets/svgs/QortalSVG";
interface CrowdfundProgressProps {
  raised: number;
  goal: number;
}

export const CrowdfundProgress: React.FC<CrowdfundProgressProps> = ({
  raised,
  goal,
}) => {
  const theme = useTheme();
  const progress = (+raised / +goal) * 100;

  return (
    <ProgressRow>
      <FundAmountsCol>
        <FundAmountsRow>
          <FundAmount>Raised:</FundAmount>
          <FundAmountNumber>
            <QortalSVG
              height={"22"}
              width={"22"}
              color={theme.palette.text.primary}
            />
            <span>{+raised}</span>
          </FundAmountNumber>
        </FundAmountsRow>
        <FundAmountsRow>
          <FundAmount>Goal:</FundAmount>
          <FundAmountNumber>
            <QortalSVG
              height={"22"}
              width={"22"}
              color={theme.palette.text.primary}
            />
            <span>{+goal}</span>
          </FundAmountNumber>
        </FundAmountsRow>
      </FundAmountsCol>
      <CustomCircularProgress
        size={115}
        thickness={12}
        variant="determinate"
        // value less than 1 and greater than 0, dispaly 1, else display progress
        value={progress < 1 && progress > 0 ? 1 : progress}
      />
    </ProgressRow>
  );
};
