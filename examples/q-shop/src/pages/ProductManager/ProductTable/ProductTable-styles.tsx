import { styled } from "@mui/system";
import { TableRow } from "@mui/material";

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  padding: "5px 10px",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    filter:
      theme.palette.mode === "light" ? "brightness(0.9)" : "brightness(1.2)",
    cursor: "pointer"
  }
}));
