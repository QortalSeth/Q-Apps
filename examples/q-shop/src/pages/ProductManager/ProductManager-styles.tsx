import { styled } from "@mui/system";
import { Box, Typography } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { TimesSVG } from "../../assets/svgs/TimesSVG";

export const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: "divider",
  display: "flex",
  width: "100%",
  alignItems: "flex-start",
  justifyContent: "center",
  flexDirection: "column",
  padding: "15px",
  gap: "4px"
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.secondary.main
  }
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  fontFamily: "Raleway",
  fontSize: "15px",
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.secondary.main
  }
}));

export const ProductsToSaveCard = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexDirection: "column",
  width: "85vw",
  height: "auto",
  minHeight: "400px",
  gap: "10px",
  borderRadius: "8px",
  backgroundColor: theme.palette.mode === "light" ? "#EFF3FD" : "#2b2d48",
  position: "absolute",
  top: "25%",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "25px",
  boxShadow:
    theme.palette.mode === "light"
      ? "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;"
      : "0px 3px 4px 0px hsla(0,0%,0%,0.14), 0px 3px 3px -2px hsla(0,0%,0%,0.12), 0px 1px 8px 0px hsla(0,0%,0%,0.2);",
  zIndex: 2
}));

export const ProductToSaveCard = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-evenly",
  maxWidth: "300px",
  width: "auto",
  height: "auto",
  maxHeight: "200px",
  minHeight: "100px",
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: "#f2f2f2",
  flexGrow: 1
}));

export const ProductToSaveImageRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  gap: "4px"
}));

export const CardHeader = styled(Typography)(({ theme }) => ({
  fontFamily: "Merriweather Sans",
  fontSize: "18px",
  userSelect: "none",
  color: "#000000",
  letterSpacing: 0
}));

export const Bulletpoints = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "17px",
  userSelect: "none",
  color: "#000000",
  letterSpacing: 0,
  alignItems: "center",
  gap: "5px",
  display: "flex",
  justifyContent: "flex-start",
  width: "100%"
}));

export const TimesIcon = styled(TimesSVG)(({ theme }) => ({
  position: "absolute",
  top: "2px",
  right: "5px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    transform: "scale(1.1)"
  }
}));

export const CardButtonRow = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "flex-end"
}));