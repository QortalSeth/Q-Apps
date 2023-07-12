import { styled } from "@mui/system";
import {
  Box,
  Button,
  Typography,
  Grid,
  Checkbox,
  InputLabel,
  Autocomplete,
  TextField
} from "@mui/material";

export const FiltersCol = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  padding: "20px 15px",
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.background.paper}`,
  borderRight: `1px solid ${theme.palette.background.paper}`
}));

export const FiltersContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between"
}));

export const FiltersRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "0 15px",
  fontSize: "16px",
  userSelect: "none"
}));

export const FiltersTitle = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  margin: "20px 0",
  fontFamily: "Raleway",
  fontSize: "17px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const FiltersCheckbox = styled(Checkbox)(({ theme }) => ({
  color: "#c0d4ff",
  "&.Mui-checked": {
    color: "#6596ff"
  }
}));

export const FilterSelect = styled(Autocomplete)(({ theme }) => ({
  "& #categories-select": {
    padding: "7px"
  },
  "& .MuiSelect-placeholder": {
    fontFamily: "Raleway",
    fontSize: "17px",
    color: theme.palette.text.primary,
    userSelect: "none"
  },
  "& MuiFormLabel-root": {
    fontFamily: "Raleway",
    fontSize: "17px",
    color: theme.palette.text.primary,
    userSelect: "none"
  }
}));

export const FilterSelectMenuItems = styled(TextField)(({ theme }) => ({
  fontFamily: "Raleway",
  fontSize: "17px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const ProductManagerRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  padding: "15px 18px"
}));

export const FiltersSubContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: "5px"
}));

export const FilterDropdownLabel = styled(InputLabel)(({ theme }) => ({
  fontFamily: "Raleway",
  fontSize: "16px",
  color: theme.palette.text.primary
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

export const CartIconContainer = styled(Box)(({ theme }) => ({
  position: "relative"
}));

export const NotificationBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "-7px",
  right: "-7px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  backgroundColor: theme.palette.mode === "dark" ? "#bdba02" : "#e1dd04",
  color: "#000000",
  fontFamily: "Karla",
  fontSize: "14px",
  fontWeight: "bold",
  userSelect: "none"
}));

export const ProductCardCol = styled(Grid)(({ theme }) => ({
  display: "flex",
  gap: 1,
  alignItems: "center",
  width: "auto",
  position: "relative",
  maxWidth: "100%",
  flexGrow: 1,
  [theme.breakpoints.down("sm")]: {
    width: "100%"
  }
}));
