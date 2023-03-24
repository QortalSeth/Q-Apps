import React, { useRef, useState } from 'react'
import { Box, IconButton, Slider } from '@mui/material'
import { CircularProgress } from '@mui/material'
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Fullscreen,
  PictureInPicture
} from '@mui/icons-material'
import { styled } from '@mui/system'

const VideoContainer = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 20px 0px;
`

const VideoElement = styled('video')`
  width: 100%;
  height: auto;
`

const ControlsContainer = styled(Box)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.6);
`

interface VideoPlayerProps {
  src?: string
  poster?: string
  name?: string
  identifier?: string
  service?: string
  autoplay?: boolean
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  poster,
  name,
  identifier,
  service,
  autoplay
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [src, setSrc] = useState('')
  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(!playing)
  }

  const onVolumeChange = (_: any, value: number | number[]) => {
    if (!videoRef.current) return
    videoRef.current.volume = value as number
    setVolume(value as number)
  }

  const onProgressChange = (_: any, value: number | number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value as number
    setProgress(value as number)
    if (!playing) {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  const handleEnded = () => {
    setPlaying(false)
  }

  const updateProgress = () => {
    if (!videoRef.current) return
    setProgress(videoRef.current.currentTime)
  }

  const [isFullscreen, setIsFullscreen] = useState(false)

  const enterFullscreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen()
    } else {
      exitFullscreen()
    }
  }
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return

    if (document.pictureInPictureElement === videoRef.current) {
      await document.exitPictureInPicture()
    } else {
      await videoRef.current.requestPictureInPicture()
    }
  }

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleLoadedMetadata = () => {
    setIsLoading(false)
  }

  const handleCanPlay = () => {
    setIsLoading(false)
  }

  const getSrc = React.useCallback(async () => {
    if (!name || !identifier || !service) return
    try {
      let videoData = await qortalRequest({
        action: 'FETCH_QDN_RESOURCE',
        name: name,
        service: 'VIDEO',
        identifier: identifier,
        encoding: 'base64'
      })
      const src = 'data:video/mp4;base64,' + videoData
      setSrc(src)
    } catch (error) {}
  }, [identifier, name])
  React.useEffect(() => {
    getSrc()
  }, [getSrc])

  return (
    <VideoContainer>
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress />
        </Box>
      )}
      <VideoElement
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={updateProgress}
        autoPlay={autoplay}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
      />
      <ControlsContainer>
        <IconButton
          sx={{
            color: 'rgba(255, 255, 255, 0.7)'
          }}
          onClick={togglePlay}
        >
          {playing ? <Pause /> : <PlayArrow />}
        </IconButton>
        <Slider
          value={progress}
          onChange={onProgressChange}
          min={0}
          max={videoRef.current?.duration || 100}
          sx={{ flexGrow: 1, mx: 2 }}
        />
        <VolumeUp />
        <Slider
          value={volume}
          onChange={onVolumeChange}
          min={0}
          max={1}
          step={0.01}
        />
        <IconButton
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            marginLeft: '15px'
          }}
          onClick={togglePictureInPicture}
        >
          <PictureInPicture />
        </IconButton>
        <IconButton
          sx={{
            color: 'rgba(255, 255, 255, 0.7)'
          }}
          onClick={toggleFullscreen}
        >
          <Fullscreen />
        </IconButton>
      </ControlsContainer>
    </VideoContainer>
  )
}
