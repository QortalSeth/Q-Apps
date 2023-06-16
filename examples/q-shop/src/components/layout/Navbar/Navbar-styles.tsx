import { AppBar, Button, Typography, Box } from "@mui/material";
import { styled } from "@mui/system";
import { LightModeSVG } from "../../../assets/svgs/LightModeSVG";
import { DarkModeSVG } from "../../../assets/svgs/DarkModeSVG";
import { StorefrontSVG } from "../../../assets/svgs/StorefrontSVG";

export const CustomAppBar = styled(AppBar)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: "5px 16px",
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.only("xs")]: {
    gap: "15px"
  }
}));

export const QShopLogoContainer = styled("img")({
  width: "12%",
  minWidth: "50px",
  height: "auto",
  padding: "2px 0",
  userSelect: "none",
  objectFit: "contain",
  cursor: "pointer"
});

export const SearchBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #9e9393",
  borderRadius: "8px",
  padding: "10px 13px"
}));

export const CustomTitle = styled(Typography)({
  fontWeight: 600,
  color: "#000000"
});

export const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary
}));

export const StoreManagerIcon = styled(StorefrontSVG)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    filter:
      theme.palette.mode === "dark"
        ? "drop-shadow(0px 4px 6px rgba(255, 255, 255, 0.6))"
        : "drop-shadow(0px 4px 6px rgba(99, 88, 88, 0.1))"
  }
}));

export const CreateBlogButton = styled(Button)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "8px 15px",
  borderRadius: "40px",
  gap: "4px",
  backgroundColor: theme.palette.secondary.main,
  color: "#fff",
  fontFamily: "Arial",
  transition: "all 0.3s ease-in-out",
  boxShadow: "none",
  "&:hover": {
    cursor: "pointer",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;",
    backgroundColor: theme.palette.secondary.main,
    filter: "brightness(1.1)"
  }
}));

export const AuthenticateButton = styled(Button)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "8px 15px",
  borderRadius: "40px",
  gap: "4px",
  backgroundColor: theme.palette.secondary.main,
  color: "#fff",
  fontFamily: "Arial",
  transition: "all 0.3s ease-in-out",
  boxShadow: "none",
  "&:hover": {
    cursor: "pointer",
    boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;",
    backgroundColor: theme.palette.secondary.dark,
    filter: "brightness(1.1)"
  }
}));

export const AvatarContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  "&:hover": {
    cursor: "pointer",
    "& #expand-icon": {
      transition: "all 0.3s ease-in-out",
      filter: "brightness(0.7)"
    }
  }
});

export const DropdownContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  backgroundColor: theme.palette.primary.main,
  padding: "10px 15px",
  transition: "all 0.4s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    filter: "brightness(0.95)"
  }
}));

export const DropdownText = styled(Typography)(({ theme }) => ({
  fontFamily: "Arial",
  fontSize: "16px",
  color: theme.palette.text.primary,
  userSelect: "none"
}));

export const NavbarName = styled(Typography)(({ theme }) => ({
  fontFamily: "Arial",
  fontSize: "18px",
  color: theme.palette.text.primary,
  margin: "0 10px"
}));

export const ThemeSelectRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "5px",
  flexBasis: 0
});

export const LightModeIcon = styled(LightModeSVG)(({ theme }) => ({
  transition: "all 0.1s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    filter:
      theme.palette.mode === "dark"
        ? "drop-shadow(0px 4px 6px rgba(255, 255, 255, 0.6))"
        : "drop-shadow(0px 4px 6px rgba(99, 88, 88, 0.1))"
  }
}));

export const DarkModeIcon = styled(DarkModeSVG)(({ theme }) => ({
  transition: "all 0.1s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    filter:
      theme.palette.mode === "dark"
        ? "drop-shadow(0px 4px 6px rgba(255, 255, 255, 0.6))"
        : "drop-shadow(0px 4px 6px rgba(99, 88, 88, 0.1))"
  }
}));
