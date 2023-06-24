import { styled } from "@mui/system";
import { Box, Grid, Typography, Checkbox } from "@mui/material";

export const StoresContainer = styled(Grid)(({ theme }) => ({
  position: "relative",
  padding: "30px 55px",
  flexDirection: "column",
  gap: "20px"
}));

export const StoresRow = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "15px",
  width: "auto",
  position: "relative",
  "@media (max-width: 450px)": {
    width: "100%"
  }
}));

export const StoreCard = styled(Grid)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  width: "100%",
  height: "auto",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "8px",
  padding: "10px 15px",
  gap: "20px",
  border:
    theme.palette.mode === "dark"
      ? "none"
      : `1px solid ${theme.palette.primary.light}`,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0px 4px 5px 0px hsla(0,0%,0%,0.14),  0px 1px 10px 0px hsla(0,0%,0%,0.12),  0px 2px 4px -1px hsla(0,0%,0%,0.2)"
      : "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0px 8px 10px 1px hsla(0,0%,0%,0.14), 0px 3px 14px 2px hsla(0,0%,0%,0.12), 0px 5px 5px -3px hsla(0,0%,0%,0.2)"
        : "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;"
  }
}));

export const StoreCardInfo = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "5px",
  marginTop: "15px"
}));

export const StoreCardImageContainer = styled(Grid)(({ theme }) => ({}));

export const StoreCardImage = styled("img")(({ theme }) => ({
  maxWidth: "300px",
  width: "auto",
  minWidth: "150px",
  height: "fit-content",
  borderRadius: "5px"
}));

export const StoreCardTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Cairo",
  fontSize: "26px",
  letterSpacing: "0.4px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const StoreCardDescription = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "20px",
  letterSpacing: "0px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const StoreCardOwner = styled(Typography)(({ theme }) => ({
  fontFamily: "Livvic",
  color: theme.palette.text.primary,
  fontSize: "17px",
  position: "absolute",
  bottom: "5px",
  right: "10px",
  userSelect: "none"
}));

export const StoreCardYouOwn = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "5px",
  right: "10px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontFamily: "Livvic",
  fontSize: "15px",
  color: theme.palette.text.primary
}));

export const MyStoresRow = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  padding: "5px",
  width: "100%"
}));

export const MyStoresCard = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "auto",
  borderRadius: "4px",
  backgroundColor: theme.palette.background.paper,
  padding: "5px 10px",
  fontFamily: "Raleway",
  fontSize: "18px",
  color: theme.palette.text.primary
}));

export const MyStoresCheckbox = styled(Checkbox)(({ theme }) => ({
  color: "#c0d4ff",
  "&.Mui-checked": {
    color: "#6596ff"
  }
}));
