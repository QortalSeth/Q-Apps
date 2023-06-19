import { styled } from "@mui/system";
import { Box } from "@mui/material";

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
