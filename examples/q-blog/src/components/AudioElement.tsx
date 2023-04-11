import * as React from 'react'
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import AudiotrackIcon from '@mui/icons-material/Audiotrack'

const Widget = styled('div')(({ theme }) => ({
  padding: 16,
  borderRadius: 16,
  maxWidth: '100%',
  position: 'relative',
  zIndex: 1,
  //   backgroundColor:
  //     theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(40px)',
  background: 'skyblue',
  transition: '0.2s all',
  '&:hover': {
    opacity: 0.75
  }
}))

const CoverImage = styled('div')({
  width: 100,
  height: 100,
  objectFit: 'cover',
  overflow: 'hidden',
  flexShrink: 0,
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.08)',
  '& > img': {
    width: '100%'
  }
})

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2
})

interface IAudioElement {
  onClick: () => void
  title: string
  description: string
  author: string
}

export default function AudioElement({
  onClick,
  title,
  description,
  author
}: IAudioElement) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      <Widget>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CoverImage>
            <AudiotrackIcon
              sx={{
                width: '90%',
                height: 'auto'
              }}
            />
          </CoverImage>
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {author}
            </Typography>
            <Typography noWrap>
              <b>{title}</b>
            </Typography>
            <Typography noWrap letterSpacing={-0.25}>
              {description}
            </Typography>
          </Box>
        </Box>
      </Widget>
    </Box>
  )
}
