import { styled } from "@mui/system";
import { Card, Box, Typography } from "@mui/material";

export const StyledCard = styled(Card)(({ theme }) => ({ 
  backgroundColor: theme.palette.primary.main,
  maxWidth: "600px",
  width: "100%",
  margin: "10px 0px",
  cursor: "pointer",
  "@media (max-width: 450px)": {
    width: "100%;"
  }
}));

export const CardContentContainer = styled(Box)(({ theme }) => ({ 
  backgroundColor: theme.palette.primary.dark,
  margin: "5px 10px",
  borderRadius: "15px",
}));

export const StyledCardHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "5px",
  padding:  "7px",
});

export const StyledCardCol = styled(Box)({
  display: "flex",
  overflow: "hidden",
  flexDirection: "column",
  gap: "2px",
  alignItems: "flex-start",
  width: "100%"
});

export const StyledCardContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "5px 10px",
  gap: '10px',
})

export const TitleText = styled(Typography)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100%",
  fontFamily: "Cairo, sans-serif",
  fontSize: "22px",
  lineHeight: "1.2"
})

export const AuthorText = styled(Typography)({
  fontFamily: "Raleway, sans-serif",
  fontSize: "16px",
  lineHeight: "1.2",
})