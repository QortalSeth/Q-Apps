import { styled } from "@mui/system";
import { Box, TextareaAutosize } from "@mui/material";

export const AddReviewHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
}));

export const AddReviewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "25px",
  justifyContent: "flex-start",
  flexGrow: 1,
  width: "100%",
  gap: "15px"
}));

export const AddReviewDescription = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  fontFamily: "Karla",
  fontSize: "17.5px",
  fontWeight: 300,
  lineHeight: "1.5",
  padding: "12px",
  borderRadius: "12px 12px 0 12px",
  color: theme.palette.text.primary,
  background: theme.palette.background.default,
  border: `1px solid ${theme.palette.background.paper}`,
  "&:hover": {
    borderColor: theme.palette.secondary.main
  },
  "&:focus": {
    borderColor: theme.palette.secondary.main
  }
}));
