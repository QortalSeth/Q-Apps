import React, { useRef } from "react";
import { Box, Popover, useTheme, Input } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import { toggleCreateStoreModal } from "../../../state/features/globalSlice";
import { useDispatch } from "react-redux";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { BlockedNamesModal } from "../../common/BlockedNamesModal/BlockedNamesModal";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import BackspaceIcon from "@mui/icons-material/Backspace";
import {
  AvatarContainer,
  CustomAppBar,
  DropdownContainer,
  DropdownText,
  StyledButton,
  AuthenticateButton,
  NavbarName,
  LightModeIcon,
  DarkModeIcon,
  ThemeSelectRow,
  QShopLogoContainer,
  SearchBox,
  StoreManagerIcon
} from "./Navbar-styles";
import { AccountCircleSVG } from "../../../assets/svgs/AccountCircleSVG";
import QShopLogo from "../../../assets/img/QShopLogo.webp";
import QShopLogoLight from "../../../assets/img/QShopLogoLight.webp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import {
  addFilteredPosts,
  setFilterValue,
  setIsFiltering
} from "../../../state/features/storeSlice";
import { setIsOpen } from "../../../state/features/cartSlice";

interface Props {
  isAuthenticated: boolean;
  hasStore: boolean;
  userName: string | null;
  userAvatar: string;
  blog: any;
  authenticate: () => void;
  hasAttemptedToFetchShopInitial: boolean;
  setTheme: (val: string) => void;
}

const NavBar: React.FC<Props> = ({
  isAuthenticated,
  hasStore,
  userName,
  userAvatar,
  blog,
  authenticate,
  hasAttemptedToFetchShopInitial,
  setTheme
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [isOpenModal, setIsOpenModal] = React.useState<boolean>(false);
  const searchValRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as unknown as HTMLButtonElement | null;
    setAnchorEl(target);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onClose = () => {
    setIsOpenModal(false);
  };

  const open = Boolean(anchorEl);

  const id = open ? "simple-popover" : undefined;

  return (
    <CustomAppBar position="sticky" elevation={2}>
      <ThemeSelectRow>
        {theme.palette.mode === "dark" ? (
          <LightModeIcon
            onClickFunc={() => setTheme("light")}
            color="white"
            height="22"
            width="22"
          />
        ) : (
          <DarkModeIcon
            onClickFunc={() => setTheme("dark")}
            color="black"
            height="22"
            width="22"
          />
        )}
        <QShopLogoContainer
          src={theme.palette.mode === "dark" ? QShopLogoLight : QShopLogo}
          alt="QShop Logo"
          onClick={() => {
            navigate(`/`);
            dispatch(setIsFiltering(false));
            dispatch(setFilterValue(""));
            dispatch(addFilteredPosts([]));
            searchValRef.current = "";
            if (!inputRef.current) return;
            inputRef.current.value = "";
          }}
        />
      </ThemeSelectRow>
      <SearchBox>
        <Input
          id="standard-adornment-name"
          inputRef={inputRef}
          onChange={(e) => {
            searchValRef.current = e.target.value;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.keyCode === 13) {
              if (!searchValRef.current) {
                dispatch(setIsFiltering(false));
                dispatch(setFilterValue(""));
                dispatch(addFilteredPosts([]));
                searchValRef.current = "";
                if (!inputRef.current) return;
                inputRef.current.value = "";
                return;
              }
              navigate("/");
              dispatch(setIsFiltering(true));
              dispatch(addFilteredPosts([]));
              dispatch(setFilterValue(searchValRef.current));
            }
          }}
          placeholder="Filter by name"
          sx={{
            "&&:before": {
              borderBottom: "none"
            },
            "&&:after": {
              borderBottom: "none"
            },
            "&&:hover:before": {
              borderBottom: "none"
            },
            "&&.Mui-focused:before": {
              borderBottom: "none"
            },
            "&&.Mui-focused": {
              outline: "none"
            },
            fontSize: "18px"
          }}
        />
        <SearchIcon
          sx={{
            cursor: "pointer"
          }}
          onClick={() => {
            if (!searchValRef.current) {
              dispatch(setIsFiltering(false));
              dispatch(setFilterValue(""));
              dispatch(addFilteredPosts([]));
              searchValRef.current = "";
              if (!inputRef.current) return;
              inputRef.current.value = "";
              return;
            }
            navigate("/");
            dispatch(setIsFiltering(true));
            dispatch(addFilteredPosts([]));
            dispatch(setFilterValue(searchValRef.current));
          }}
        />
        <BackspaceIcon
          sx={{
            marginLeft: "10px",
            cursor: "pointer"
          }}
          onClick={() => {
            dispatch(setIsFiltering(false));
            dispatch(setFilterValue(""));
            dispatch(addFilteredPosts([]));
            searchValRef.current = "";
            if (!inputRef.current) return;
            inputRef.current.value = "";
          }}
        />
      </SearchBox>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        {/* Add isAuthenticated && before username and wrap StyledButton in this condition*/}
        {!isAuthenticated && (
          <AuthenticateButton onClick={authenticate}>
            <ExitToAppIcon />
            Authenticate
          </AuthenticateButton>
        )}
        {/* {isAuthenticated &&
          userName &&
          hasAttemptedToFetchBlogInitial &&
          !hasBlog && (
            <CreateBlogButton
              onClick={() => {
                dispatch(toggleCreateStoreModal(true));
              }}
            >
              <NewWindowSVG color="#fff" width="18" height="18" />
              Create Store
            </CreateBlogButton>
          )} */}
        {isAuthenticated &&
          userName &&
          hasAttemptedToFetchShopInitial &&
          !hasStore && (
            <StoreManagerIcon
              color={theme.palette.text.primary}
              height={"32"}
              width={"32"}
              onClickFunc={() => {
                navigate(`/product-manager`);
              }}
            />
          )}
        {isAuthenticated && userName && (
          <>
            <StyledButton
              color="primary"
              startIcon={<AutoStoriesIcon />}
              onClick={() => {
                dispatch(toggleCreateStoreModal(true));
              }}
            >
              Cart
            </StyledButton>
            <AvatarContainer onClick={handleClick}>
              <NavbarName>{userName}</NavbarName>
              {!userAvatar ? (
                <AccountCircleSVG
                  color={theme.palette.text.primary}
                  width="32"
                  height="32"
                />
              ) : (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  width="32"
                  height="32"
                  style={{
                    borderRadius: "50%"
                  }}
                />
              )}
              <ExpandMoreIcon id="expand-icon" sx={{ color: "#ACB6BF" }} />
            </AvatarContainer>
          </>
        )}
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
        >
          <DropdownContainer onClick={() => navigate("/my-orders")}>
            <BookmarkIcon
              sx={{
                color: "#50e3c2"
              }}
            />
            <DropdownText>My Orders</DropdownText>
          </DropdownContainer>
          <DropdownContainer
            onClick={() => {
              setIsOpenModal(true);
              handleClose();
            }}
          >
            <PersonOffIcon
              sx={{
                color: "#e35050"
              }}
            />
            <DropdownText>Blocked Names</DropdownText>
          </DropdownContainer>
          <DropdownContainer>
            <a
              href="qortal://APP/Q-Mail"
              className="qortal-link"
              style={{
                width: "100%",
                display: "flex",
                gap: "5px",
                alignItems: "center"
              }}
            >
              <EmailIcon
                sx={{
                  color: "#50e3c2"
                }}
              />

              <DropdownText>Q-Mail</DropdownText>
            </a>
          </DropdownContainer>
        </Popover>
        {isOpenModal && (
          <BlockedNamesModal open={isOpenModal} onClose={onClose} />
        )}
      </Box>
    </CustomAppBar>
  );
};

export default NavBar;
