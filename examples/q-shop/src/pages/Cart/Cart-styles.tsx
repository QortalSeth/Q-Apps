import { styled } from "@mui/system";
import { Box, Typography, Grid } from "@mui/material";
import { PlusCircleSVG } from "../../assets/svgs/PlusCircle";
import { MinusCircleSVG } from "../../assets/svgs/MinusCircle";

export const CartContainer = styled(Grid)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: 1,
  flexGrow: 1,
  overflow: "auto",
  width: "100%",
  backgroundColor: theme.palette.mode === "light" ? "#e8e8e8" : "#32333c"
}));

export const ProductContainer = styled(Grid)(({ theme }) => ({
  padding: "10px 25px",
  borderTop: `1px solid ${theme.palette.background.paper}`,
  borderBottom: `1px solid ${theme.palette.background.paper}`,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "space-evenly",
  gap: "15px"
}));

export const ProductInfoCol = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  alignItems: "flex-start",
  flexGrow: 1
}));

export const ProductDetailsCol = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  alignItems: "center",
  justifyContent: "space-evenly"
}));

export const ProductTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Merriweather Sans",
  fontSize: "22px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const QuantityRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontFamily: "Karla",
  fontSize: "17px",
  color: theme.palette.text.primary
}));

export const ProductImage = styled("img")({
  width: "100px",
  height: "100px",
  borderRadius: "3px",
  objectFit: "cover"
});

export const ProductDetailsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%"
}));

export const IconsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "20px"
}));

export const RemoveQuantityButton = styled(MinusCircleSVG)(({ theme }) => ({
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    transform: "scale(1.1)"
  }
}));

export const AddQuantityButton = styled(PlusCircleSVG)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer"
  }
}));

export const ProductPriceFont = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "17px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const TotalSumContainer = styled(Grid)(({ theme }) => ({
  border: `1px solid ${theme.palette.background.paper}`,
  borderRadius: "3px",
  padding: "10px 5px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.primary,
  height: "100%",
  flexGrow: 1
}));

export const TotalSumHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  fontFamily: "Karla",
  fontWeight: "bold",
  fontSize: "17px",
  userSelect: "none",
  padding: "5px 0px"
}));

export const TotalSumItems = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
  gap: "5px",
  paddingBottom: "5px",
  borderBottom: `1px solid ${theme.palette.background.paper}`
}));

export const TotalSumItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: "3px"
}));

export const TotalSumItemTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "17px",
  userSelect: "none",
  color: theme.palette.text.primary
}));

export const OrderTotalRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.text.primary,
  userSelect: "none",
  fontFamily: "Karla",
  fontWeight: "bold",
  borderBottom: `1px solid ${theme.palette.background.paper}`,
  padding: "5px 0px"
}));
