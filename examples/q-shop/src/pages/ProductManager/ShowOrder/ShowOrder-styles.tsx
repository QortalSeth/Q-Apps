import { styled } from "@mui/system";
import { Box, Typography } from "@mui/material";
import { TimesSVG } from "../../../assets/svgs/TimesSVG";

export const ShowOrderHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  alignItems: "flex-start"
}));

export const ShowOrderImages = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "5px"
}));

export const ShowOrderCol = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  flexDirection: "column",
  gap: "5px"
}));

export const ShowOrderProductImage = styled("img")(({ theme }) => ({
  width: "60px",
  height: "60px",
  borderRadius: "3px"
}));

export const ShowOrderTitle = styled("a")(({ theme }) => ({
  display: "flex",
  gap: "5px",
  alignItems: "center",
  fontFamily: "Merriweather Sans, sans-serif",
  letterSpacing: "0px",
  fontSize: "21px"
}));

export const ShowOrderDateCreated = styled(Box)(({ theme }) => ({
  fontSize: "16px",
  fontFamily: "Raleway",
  fontWeight: "400",
  lineHeight: "1.4",
  letterSpacing: "0.2px",
  color: theme.palette.text.primary,
  opacity: 0.8
}));

export const ShowOrderContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  flexDirection: "column",
  gap: 1,
  flexGrow: 1,
  overflow: "auto",
  width: "100%",
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar-track:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar": {
    width: "16px",
    height: "10px",
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.mode === "light" ? "#d3d9e1" : "#414763",
    borderRadius: "8px",
    backgroundClip: "content-box",
    border: "4px solid transparent"
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#b7bcc4" : "#40455f"
  }
}));

export const OrderStatusRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "10px 0"
}));

export const OrderStatusCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  width: "auto",
  padding: "5px 10px",
  borderRadius: "5px",
  color: "black",
  fontFamily: "Raleway",
  fontSize: "18px",
  userSelect: "none"
}));

export const OrderStatusNote = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  fontFamily: "Raleway",
  fontSize: "18px",
  maxWidth: "300px",
  maxHeight: "500px",
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar-track:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar": {
    width: "16px",
    height: "10px",
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.mode === "light" ? "#d3d9e1" : "#414763",
    borderRadius: "8px",
    backgroundClip: "content-box",
    border: "4px solid transparent"
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#b7bcc4" : "#40455f"
  }
}));

export const OrderDetails = styled(Box)(({ theme }) => ({
  margin: "20px 0",
  gap: "15px",
  width: "100%",
  "& > :not(:first-child)": {
    borderTop: `1px solid ${theme.palette.text.primary}`
  }
}));

export const OrderDetailsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "15px",
  width: "100%"
}));

export const OrderDetailsCard = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: "8px",
  width: "100%"
}));

export const OrderTitleCol = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "3px"
}));

export const OrderTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  letterSpacing: "0px",
  fontSize: "20px",
  color: theme.palette.text.primary
}));

export const OrderId = styled(Typography)(({ theme }) => ({
  fontFamily: "Raleway",
  letterSpacing: "0px",
  fontSize: "15px",
  opacity: 0.9,
  color: theme.palette.text.primary
}));

export const OrderQuantityRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px"
}));

export const TotalCostContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  gap: "25px"
}));

export const TotalCostCol = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px"
}));

export const TotalCostFont = styled(Typography)(({ theme }) => ({
  fontFamily: "Montserrat",
  fontSize: "18px",
  fontWeight: 500
}));

export const DetailsFont = styled(Typography)(({ theme }) => ({
  fontFamily: "Raleway",
  fontSize: "16px",
  fontWeight: 400
}));

export const Divider = styled("div")(({ theme }) => ({
  width: "30px",
  height: "3px",
  backgroundColor: theme.palette.text.primary,
  userSelect: "none"
}));

export const PriceRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "5px"
}));

export const DetailsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    filter:
      theme.palette.mode === "dark" ? "brightness(1.1)" : "brightness(0.9)"
  }
}));

export const DetailsCard = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "5px",
  right: "-150px",
  display: "flex",
  filter: "brightness(1.3)",
  alignItems: "center",
  flexDirection: "column",
  padding: "15px 25px",
  borderRadius: "10px",
  boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
  backgroundColor: theme.palette.background.paper,
  fontFamily: "Raleway",
  fontSize: "16px",
  color: theme.palette.text.primary,
  gap: "5px",
  maxWidth: "300px",
  maxHeight: "300px",
  "&::-webkit-scrollbar-track": {
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar-track:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar": {
    width: "16px",
    height: "10px",
    backgroundColor: theme.palette.mode === "light" ? "#f6f8fa" : "#292d3e"
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.mode === "light" ? "#d3d9e1" : "#414763",
    borderRadius: "8px",
    backgroundClip: "content-box",
    border: "4px solid transparent"
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.mode === "light" ? "#b7bcc4" : "#40455f"
  }
}));

export const CloseDetailsCardIcon = styled(TimesSVG)(({ theme }) => ({
  position: "absolute",
  top: "5px",
  right: "5px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    filter:
      theme.palette.mode === "dark" ? "brightness(1.1)" : "brightness(0.9)"
  }
}));
