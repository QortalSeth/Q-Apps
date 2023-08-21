import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  CustomAppBar,
  ThemeSelectRow,
  LogoContainer,
  LightModeIcon,
  DarkModeIcon,
  AuthenticateButton,
} from './Navbar-styles';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import QFundLogo from '../../../assets/images/QFundDarkLogo.png';
import QFundLogoLight from '../../../assets/images/QFundLightLogo.png';
interface Props {
  isAuthenticated: boolean;
  userName: string | null;
  userAvatar: string;
  authenticate: () => void;
  setTheme: (val: string) => void;
}

const NavBar: React.FC<Props> = ({
  isAuthenticated,
  userName,
  userAvatar,
  authenticate,
  setTheme,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <CustomAppBar position="sticky" elevation={2}>
      <ThemeSelectRow>
        {theme.palette.mode === 'dark' ? (
          <LightModeIcon
            onClickFunc={() => setTheme('light')}
            color="white"
            height="22"
            width="22"
          />
        ) : (
          <DarkModeIcon
            onClickFunc={() => setTheme('dark')}
            color="black"
            height="22"
            width="22"
          />
        )}
        <LogoContainer
          src={theme.palette.mode === 'dark' ? QFundLogo : QFundLogoLight}
          alt="QFund Logo"
          onClick={() => {
            navigate(`/`);
          }}
        />
      </ThemeSelectRow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {!isAuthenticated && (
          <AuthenticateButton onClick={authenticate}>
            <ExitToAppIcon />
            Authenticate
          </AuthenticateButton>
        )}
      </Box>
    </CustomAppBar>
  );
};

export default NavBar;
