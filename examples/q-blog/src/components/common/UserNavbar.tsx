import React from 'react'
import { styled } from '@mui/system'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Button
} from '@mui/material'

import { useNavigate } from 'react-router-dom'
import { Menu as MenuIcon } from '@mui/icons-material'
import { removePrefix } from '../../utils/blogIdformats'

interface Props {
  title: string
  menuItems: any[]
  name: string
  blogId: string
}

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#000000'
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

export const UserNavbar: React.FC<Props> = ({
  title,
  menuItems,
  name,
  blogId
}) => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main
  }))

  const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    justifyContent: 'space-between'
  }))

  const StyledMenu = styled(Menu)(({ theme }) => ({
    marginTop: theme.spacing(2)
  }))
  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    width: '100%',
    whiteSpace: 'nowrap',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }))

  const goToPost = (item: any) => {
    if (!name) return
    const { postId } = item

    const str = postId
    const arr = str.split('-post-')
    const str1 = arr[0]
    const str2 = arr[1]
    const blogId = removePrefix(str1)
    navigate(`/${name}/${blogId}/${str2}`)
  }

  const handleAction = (action: () => void) => {
    handleClose()
    setTimeout(() => {
      action()
    }, 100)
  }

  return (
    <CustomAppBar position="sticky">
      <CustomToolbar variant="dense">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <CustomTitle
            variant="h6"
            sx={{
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            {title}
          </CustomTitle>
        </Box>
        <StyledMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ style: { width: '250px' } }}
        >
          {menuItems.map((item, index) => (
            <StyledMenuItem
              key={index}
              onClick={() => handleAction(() => goToPost(item))}
            >
              {item.name}
            </StyledMenuItem>
          ))}
        </StyledMenu>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
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
        </Box>
      </CustomToolbar>
    </CustomAppBar>
  )
}