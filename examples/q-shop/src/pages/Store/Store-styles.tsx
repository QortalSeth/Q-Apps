import { styled } from "@mui/system";
import { Box, Button, Typography, Grid } from "@mui/material";

export const ProductManagerRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "5px"
}));

export const ProductManagerButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "20px 10px 10px 20px",
  fontFamily: "Raleway",
  fontSize: "16px",
  color: "#ffffff",
  backgroundColor: theme.palette.secondary.main,
  border: "none",
  borderRadius: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: theme.palette.secondary.dark
  }
}));

export const BackToStorefrontButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "3px 12px",
  fontFamily: "Raleway",
  fontSize: "15px",
  color: "#ffffff",
  backgroundColor: "#bdba02",
  border: "none",
  borderRadius: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#a5a201"
  }
}));

export const ProductsContainer = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: "25px",
  padding: "15px 25px"
}));

export const NoProductsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "40%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%"
}));

export const NoProductsText = styled(Typography)(({ theme }) => ({
  fontFamily: "Merriweather Sans",
  fontSize: "24px",
  letterSpacing: "0.7px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));
