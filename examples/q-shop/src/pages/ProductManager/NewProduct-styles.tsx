import { styled } from "@mui/system";
import { Button } from "@mui/material";

export const CreateProductButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  textTransform: "none",
  fontFamily: "Merriweather Sans",
  gap: "5px",
  fontSize: "15px",
  borderRadius: "5px",
  border: "none",
  color: "white",
  padding: "5px 15px",
  transition: "all 0.3s ease-in-out",
  boxShadow:
    "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: theme.palette.secondary.dark,
    boxShadow:
      "rgba(50, 50, 93, 0.35) 0px 3px 5px -1px, rgba(0, 0, 0, 0.4) 0px 2px 3px -1px;"
  }
}));
