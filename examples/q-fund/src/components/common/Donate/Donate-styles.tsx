import { styled } from "@mui/material/styles";
import { Button, Box, InputLabel } from "@mui/material";

export const CrowdfundPageDonateButton = styled(Button)(({ theme }) => ({
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
}));

export const DonateModalCol = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "400px",
  justifyContent: "center",
  gap: "20px",
}));

export const DonateModalLabel = styled(InputLabel)(({ theme }) => ({
  fontFamily: "Copse",
  fontSize: "27px",
  letterSpacing: "1px",
  color: theme.palette.text.primary,
  fontWeight: 400,
}));
