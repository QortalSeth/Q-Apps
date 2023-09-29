import { styled } from "@mui/system";
import { Button, Typography } from "@mui/material";

export const CustomModalTitle = styled(Typography)({
  textAlign: "center",
  fontFamily: "Merriweather Sans",
  fontSize: "30px",
  fontWeight: 500,
  color: "#a01717",
  userSelect: "none"
});

export const CustomModalButton = styled(Button)(({ theme }) => ({
  alignSelf: "center",
  fontFamily: "Raleway",
  fontWeight: 400,
  width: "50%",
  backgroundColor: theme.palette.secondary.main,
  color: "#fff",
  transition: "all 0.3s ease-in-out",
  borderRadius: "5px",
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
    cursor: "pointer"
  }
}));
