import { styled } from "@mui/system";
import { Box, Button, Typography, Grid } from "@mui/material";

export const ProductManagerRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "15px 18px"
}));

export const StoreControlsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px"
}));

export const EditStoreButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "3px 12px",
  fontFamily: "Raleway",
  fontSize: "15px",
  color: "#ffffff",
  backgroundColor: "#D4417E",
  border: "none",
  borderRadius: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#a13562"
  }
}));

export const ProductManagerButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "3px 12px",
  fontFamily: "Raleway",
  fontSize: "15px",
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
  backgroundColor: theme.palette.mode === "dark" ? "#bdba02" : "#e1dd04",
  border: "none",
  borderRadius: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: theme.palette.mode === "dark" ? "#a5a201" : "#c7c402"
  }
}));

export const ProductsContainer = styled(Grid)({
  display: "flex",
  flexWrap: "wrap",
  gap: "25px",
  padding: "15px 25px"
});

export const NoProductsContainer = styled(Box)({
  textAlign: "center",
  width: "100%",
  marginTop: "70px"
});

export const NoProductsText = styled(Typography)(({ theme }) => ({
  fontFamily: "Merriweather Sans",
  fontSize: "24px",
  letterSpacing: "0.7px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));