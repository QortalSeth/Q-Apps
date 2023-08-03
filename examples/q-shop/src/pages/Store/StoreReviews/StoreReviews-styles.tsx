import { styled } from "@mui/system";
import { Box, Button, Typography } from "@mui/material";

export const AddReviewButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "4px 12px",
  gap: "10px",
  fontFamily: "Raleway",
  fontSize: "16px",
  width: "300px",
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
  border: "none",
  borderRadius: "5px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0px 8px 10px 1px hsla(0,0%,0%,0.14), 0px 3px 14px 2px hsla(0,0%,0%,0.12), 0px 5px 5px -3px hsla(0,0%,0%,0.2)"
        : "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;"
  }
}));

export const AverageReviewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-evenly",
  height: "500px",
  width: "100%"
}));

export const ReviewsFont = styled(Typography)(({ theme }) => ({
  fontFamily: "Raleway",
  fontSize: "18px",
  fontWeight: 400,
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const TotalReviewsFont = styled(Typography)(({ theme }) => ({
  fontFamily: "Karla",
  fontSize: "15px",
  fontWeight: 300,
  color: theme.palette.text.primary,
  userSelect: "none",
  opacity: 0.8
}));
