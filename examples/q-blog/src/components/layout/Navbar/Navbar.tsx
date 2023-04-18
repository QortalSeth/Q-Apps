import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Popover
} from '@mui/material'
import { styled } from '@mui/system'
import AccountCircle from '@mui/icons-material/AccountCircle'
import AddBoxIcon from '@mui/icons-material/AddBox'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import { useNavigate } from 'react-router-dom'
import { togglePublishBlogModal } from '../../../state/features/globalSlice'
import { useDispatch, useSelector } from 'react-redux'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { RootState } from '../../../state/store'
import { UserNavbar } from '../../common/UserNavbar'
import { addPrefix, removePrefix } from '../../../utils/blogIdformats'
import { useLocation } from 'react-router-dom'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import SubscriptionsIcon from '@mui/icons-material/Subscriptions'
import SettingsIcon from '@mui/icons-material/Settings'
import { BlockedNamesModal } from '../../common/BlockedNamesModal'
import { CustomIcon } from '../../common/CustomIcon'
interface Props {
  isAuthenticated: boolean
  hasBlog: boolean
  userName: string | null
  userAvatar: string | null
  blog: any
  authenticate: () => void
}

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default
}))

const CustomToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const CustomTitle = styled(Typography)({
  fontWeight: 600,
  color: '#000000'
})

const StyledButton = styled(Button)({
  fontWeight: 600
})

const NavBar: React.FC<Props> = ({
  isAuthenticated,
  hasBlog,
  userName,
  userAvatar,
  blog,
  authenticate
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const query = useQuery()
  const { visitingBlog } = useSelector((state: RootState) => state.global)
  const location = useLocation()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [isOpenModal, setIsOpenModal] = React.useState<boolean>(false)
  const stripBlogId = removePrefix(visitingBlog?.blogId || '')
  if (visitingBlog?.navbarConfig && location?.pathname?.includes(stripBlogId)) {
    return (
      <UserNavbar
        title={visitingBlog?.title || ''}
        menuItems={visitingBlog?.navbarConfig?.navItems || []}
        name={visitingBlog?.name || ''}
        blogId={visitingBlog?.blogId || ''}
      />
    )
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as unknown as HTMLButtonElement | null
    setAnchorEl(target)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }
  const onClose = () => {
    setIsOpenModal(false)
  }
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined
  return (
    <CustomAppBar position="sticky" elevation={2}>
      <CustomToolbar variant="dense">
        <CustomTitle
          variant="h6"
          sx={{
            cursor: 'pointer'
          }}
          onClick={() => {
            navigate(`/`)
          }}
        >
          Q-Blog
        </CustomTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {!isAuthenticated && (
            <StyledButton
              color="primary"
              startIcon={<ExitToAppIcon />}
              onClick={authenticate}
            >
              Authenticate
            </StyledButton>
          )}
          {isAuthenticated && userName && (
            <>
              <StyledButton
                color="primary"
                startIcon={
                  <BookmarkIcon
                    sx={{
                      color: 'red'
                    }}
                  />
                }
                onClick={() => navigate('/favorites')}
              >
                Favorites
              </StyledButton>
              <StyledButton
                color="primary"
                startIcon={<SubscriptionsIcon />}
                onClick={() => navigate('/subscriptions')}
              >
                Subscriptions
              </StyledButton>
            </>
          )}
          {isAuthenticated && userName && !hasBlog && (
            <StyledButton
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={() => {
                dispatch(togglePublishBlogModal(true))
              }}
            >
              Create Blog
            </StyledButton>
          )}
          {isAuthenticated && userName && hasBlog && (
            <>
              <StyledButton
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={() => {
                  navigate(`/post/new`)
                }}
              >
                Create Post
              </StyledButton>

              <StyledButton
                color="primary"
                startIcon={<AutoStoriesIcon />}
                onClick={() => {
                  navigate(`/${userName}/${blog.blogId}`)
                }}
              >
                My Blog
              </StyledButton>
            </>
          )}
          <Box onClick={handleClick}>
            <CustomIcon component={SettingsIcon} />
            {/* <SettingsIcon /> */}
          </Box>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
          >
            <Typography
              sx={{ p: 2, cursor: 'pointer' }}
              onClick={() => setIsOpenModal(true)}
            >
              Blocked Names
            </Typography>
          </Popover>
          {/* {isAuthenticated && userName && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle1" style={{ marginRight: '1rem' }}>{userName}</Typography>
            {!userAvatar ? (
              <IconButton>
                <AccountCircle />
              </IconButton>
            ) : (
              <img src={userAvatar} alt="User Avatar" width="32" height="32" />
            )}
          </Box>
        )} */}
          <BlockedNamesModal open={isOpenModal} onClose={onClose} />
        </Box>
      </CustomToolbar>
    </CustomAppBar>
  )
}

export default NavBar;
