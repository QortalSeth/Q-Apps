import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

export const CrowdfundPageDonateButton = styled(Button)(({ theme }) => ({
  fontFamily: "Mulish",
  fontWeight: "800",
  fontSize: "21px",
  lineHeight: "1.75",
  textTransform: "uppercase",
  minWidth: "64px",
  padding: "15px 25px",
}));
