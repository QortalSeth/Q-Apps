import { styled } from "@mui/system";
import { Box, Typography, Grid } from "@mui/material";
import { PlusCircleSVG } from "../../assets/svgs/PlusCircle";
import { MinusCircleSVG } from "../../assets/svgs/MinusCircle";
import { GarbageSVG } from "../../assets/svgs/GarbageSVG";

export const CartContainer = styled(Grid)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: 1,
  flexGrow: 1,
  overflow: "auto",
  width: "100%",
  padding: "35px",
  overflowX: "hidden"
}));

export const ProductContainer = styled(Grid)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
  flexWrap: "nowrap",
  padding: "15px 25px",
  borderTop: `1px solid ${theme.palette.background.paper}`,
  borderBottom: `1px solid ${theme.palette.background.paper}`,
  justifyContent: "space-evenly",
  gap: "20px",
  width: "100%",
  height: "100%",
  maxHeight: "250px"
}));

export const ProductInfoCol = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  alignItems: "center",
  flexGrow: 1
}));

export const ProductDetailsCol = styled(Grid)(({ theme }) => ({
  boxSizing: "border-box",
  margin: "0px",
  flexBasis: "100%",
  flexGrow: 0,
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "80px",
  WebkitBoxAlign: "center",
  alignItems: "center",
  justifyContent: "flex-end",
  height: "100%"
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
  fontSize: "18px",
  color: theme.palette.text.primary
}));

export const ProductImage = styled("img")({
  height: "200px",
  width: "-webkit-fill-available",
  borderRadius: "3px",
  objectFit: "contain"
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
    transform: "scale(1.05)"
  }
}));

export const AddQuantityButton = styled(PlusCircleSVG)(({ theme }) => ({
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    transform: "scale(1.05)"
  }
}));

export const GarbageIcon = styled(GarbageSVG)(({ theme }) => ({
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    transform: "scale(1.05)"
  }
}));

export const ProductPriceFont = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "18px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const TotalSumContainer = styled(Grid)(({ theme }) => ({
  border: `1px solid ${theme.palette.background.paper}`,
  borderRadius: "3px",
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: theme.palette.background.default,
  height: "100%",
  flexGrow: 1
}));

export const TotalSumHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  fontFamily: "Karla",
  fontWeight: "bold",
  fontSize: "18px",
  userSelect: "none",
  paddingBottom: "15px"
}));

export const TotalSumItems = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
  gap: "10px",
  paddingBottom: "15px",
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
  fontSize: "18px",
  userSelect: "none",
  color: theme.palette.text.primary,
  display: "flex",
  gap: "3px"
}));

export const OrderTotalRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.primary,
  userSelect: "none",
  fontFamily: "Karla",
  fontWeight: "bold",
  borderBottom: `1px solid ${theme.palette.background.paper}`,
  padding: "15px 0px",
  gap: "3px",
  width: "100%"
}));
