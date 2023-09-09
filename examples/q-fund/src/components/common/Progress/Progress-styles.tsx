import { styled } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";

export const ProgressRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
  width: "fit-content",
  padding: "25px",
  border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: "8px",
}));

export const CustomCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color:
    theme.palette.mode === "light"
      ? theme.palette.primary.dark
      : theme.palette.primary.light,
}));
