import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';
import { togglePublishBlogModal } from '../../../state/features/globalSlice';
import { useDispatch } from 'react-redux';

interface Props {
  isAuthenticated: boolean;
  hasBlog: boolean;
  userName: string | null;
  userAvatar: string | null;
  blog: any
}

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#000000',
}));

const CustomToolbar = styled(Toolbar)({
  minHeight: 48,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const CustomTitle = styled(Typography)({
  fontWeight: 600,
  color: '#000000',
});

const StyledButton = styled(Button)({
  fontWeight: 600,
});

const NavBar: React.FC<Props> = ({ isAuthenticated, hasBlog, userName, userAvatar, blog }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

  return (
    <CustomAppBar position="static">
      <CustomToolbar>
        <CustomTitle variant="h6">
          Q-Blog
        </CustomTitle>
        {userName && (
          <>
            <Typography variant="subtitle1" style={{ marginRight: '1rem' }}>{userName}</Typography>
            {userAvatar ? (
              <IconButton>
                <AccountCircle />
              </IconButton>
            ) : (
              <img src={userAvatar!} alt="User Avatar" width="32" height="32" />
            )}
          </>
        )}
        {!isAuthenticated && (
          <StyledButton color="primary" startIcon={<ExitToAppIcon />}>
            Authenticate
          </StyledButton>
        )}
        {isAuthenticated &&  userName && !hasBlog && (
          <StyledButton color="primary" startIcon={<AddBoxIcon />} onClick={()=> {
            dispatch(
                togglePublishBlogModal(true)
              );
          }}>
            Create Blog
          </StyledButton>
        )}
        {isAuthenticated && userName && hasBlog && (
            <>
             <StyledButton color="primary" startIcon={<AddBoxIcon />} onClick={()=> {
            navigate(`/post/new`)
          }}>
            Create Post
          </StyledButton>
            
            <StyledButton color="primary" onClick={()=> {
              navigate(`/${userName}/${blog.blogId}`)
            }}>
              See My Blog - {blog?.title}
            </StyledButton>
            </>
         
        )}
      </CustomToolbar>
    </CustomAppBar>
  );
};

export default NavBar;
