import { styled } from "@mui/system";
import { Box, Button } from "@mui/material";

export const ProductTitle = styled(Box)(({ theme }) => ({
  displayq: "flex",
  alignItems: "center",
  gap: "5px",
  fontFamily: "Merriweather Sans",
  fontSize: "18px",
  wordBreak: "break-word",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const ProductDescription = styled(Box)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "16px",
  color: theme.palette.text.primary,
  opacity: 0.95,
  wordBreak: "break-word",
  maxHeight: "75px",
  userSelect: "none"
}));

export const AddToCartButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.palette.background.paper}`,
  borderRadius: "7px",
  padding: "5px 10px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    filter:
      theme.palette.mode === "dark" ? "brightness(1.1)" : "brightness(0.9)"
  }
}));
