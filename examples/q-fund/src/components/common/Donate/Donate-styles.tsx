import { styled } from "@mui/material/styles";
import { Box, Button, InputLabel } from "@mui/material";
import { changeLightness } from "../../../../../../Library/Utility_Functions/Numbers/Colors";

const kickstarterDonateButtonColor = "#028858";
const DonorInfoButtonColor = "#00BFFF";

const buttonStyle = {
  fontFamily: "Mulish",
  fontWeight: "800",
  fontSize: "21px",
  lineHeight: "1.75",
  textTransform: "uppercase",
  minWidth: "64px",
  padding: "15px 25px",
  color: "#ffffff",
  "&:disabled": {
    filter: "brightness(0.8)",
  },
};

export const DonateModalCol = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "400px",
  justifyContent: "center",
  gap: "20px",
}));

export const CrowdfundPageDonateButton = styled(Button)(({ theme }) => ({
  ...buttonStyle,
  backgroundColor: kickstarterDonateButtonColor,
  "&:hover": {
    backgroundColor: changeLightness(kickstarterDonateButtonColor, -10),
  },
}));

export const DonorDetailsButton = styled(Button)(({ theme }) => ({
  ...buttonStyle,
  backgroundColor: DonorInfoButtonColor,
  "&:hover": { backgroundColor: changeLightness(DonorInfoButtonColor, -10) },
}));

export const DonateModalLabel = styled(InputLabel)(({ theme }) => ({
  fontFamily: "Copse",
  fontSize: "27px",
  letterSpacing: "1px",
  color: theme.palette.text.primary,
  fontWeight: 400,
}));
