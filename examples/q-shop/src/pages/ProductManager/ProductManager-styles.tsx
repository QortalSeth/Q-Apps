import { styled } from "@mui/system";
import { Box } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

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
