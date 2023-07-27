import { styled } from "@mui/system";
import { Box, Button, Typography } from "@mui/material";

export const ProductLayout = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  padding: "70px 45px 45px 45px",
  gap: "60px"
}));

export const CartBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "15px",
  right: "35px",
  display: "flex",
  justifyContent: "end"
}));

export const ProductNotFound = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50px",
  left: "50%",
  transform: "translateX(-50%)",
  fontFamily: "Raleway",
  fontSize: "22px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const ProductDetailsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: "30px"
}));

export const ProductTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Merriweather Sans, sans-serif",
  color: theme.palette.text.primary
}));

export const ProductDescription = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  letterSpacing: 0,
  color: theme.palette.text.primary,
  fontWeight: 400
}));

export const ProductPrice = styled(Typography)(({ theme }) => ({
  display: "flex",
  gap: "5px",
  fontFamily: "Karla",
  letterSpacing: 0,
  color: theme.palette.text.primary,
  fontWeight: 400
}));

export const AddToCartButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "4px 12px",
  width: "300px",
  fontFamily: "Raleway",
  fontSize: "18px",
  color: "#ffffff",
  backgroundColor: theme.palette.secondary.main,
  border: "none",
  borderRadius: "5px",
  gap: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: theme.palette.secondary.dark
  }
}));

export const UnavailableButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "4px 12px",
  width: "300px",
  fontFamily: "Raleway",
  fontSize: "18px",
  color: "#ffffff",
  backgroundColor: "#da2d2d",
  border: "none",
  borderRadius: "5px",
  gap: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#b82525"
  }
}));

export const BackToStoreButton = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: "15px",
  left: "35px",
  display: "flex",
  alignItems: "center",
  padding: "2px 12px",
  fontFamily: "Raleway",
  fontSize: "15px",
  gap: "3px",
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
