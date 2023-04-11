import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { Box, IconButton, Slider } from '@mui/material'
import { CircularProgress, Typography } from '@mui/material'
import MyWorker from '../../webworkers/decodeBase64.js/?worker'

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
  margin: 0px;
  padding: 0px;
`

const VideoElement = styled('video')`
  width: 100%;
  height: auto;
  background: rgb(33, 33, 33);
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
  from?: string | null
  setCount?: () => void
  customStyle?: any
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  poster,
  name,
  identifier,
  service,
  autoplay = true,
  from = null,
  setCount,
  customStyle = {}
}) => {
  const workerRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [src, setSrc] = useState('')
  const [resourceStatus, setResourceStatus] = useState<any>(null)
  const toggleRef = useRef<any>(null)
  const togglePlay = async () => {
    if (!videoRef.current) return
    if (!src) {
      const el = document.getElementById('videoWrapper')
      if (el) {
        el?.parentElement?.removeChild(el)
      }
      ReactDOM.flushSync(() => {
        setIsLoading(true)
      })
      getSrc()
    }
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
    if (setCount) {
      setCount()
    }
    setIsLoading(false)
  }

  const getSrc = React.useCallback(async () => {
    if (!name || !identifier || !service) return
    try {
      // let videoData = await qortalRequest({
      //   action: 'FETCH_QDN_RESOURCE',
      //   name: name,
      //   service: service,
      //   identifier: identifier,
      //   encoding: 'base64'
      // })
      console.log('starting')
      try {
        const url = `/arbitrary/${service}/${name}/${identifier}`

        fetch(url)
          .then((response) => response.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob)
            const videoElement = document.querySelector('video')
            if (!videoElement) return
            setSrc(url)
          })
          .catch((error) => {
            console.error('Error fetching the video:', error)
          })

        // const xhr = new XMLHttpRequest()
        // xhr.open('GET', url2, true)
        // xhr.responseType = 'blob'

        // // Add the Range header to fetch only the first 1MB of the video

        // xhr.onload = () => {
        //   const blob = xhr.response
        //   const url = URL.createObjectURL(blob)
        //   const videoElement = document.querySelector('video')
        //   if (!videoElement) return
        //   setSrc(url)
        // }
        // xhr.send()
        // workerRef.current.postMessage('Hello, world!')
      } catch (error) {
        console.log({ error })
      }

      // setSrc('data:video/mp4;base64,' + videoData)
    } catch (error) {}
  }, [identifier, name, service])

  const isCalling = React.useRef(false)

  React.useEffect(() => {
    if (!isLoading) return
    const getStatus = () => {
      const intervalId = setInterval(async () => {
        if (isCalling.current) return
        isCalling.current = true
        const res = await qortalRequest({
          action: 'GET_QDN_RESOURCE_STATUS',
          name: name,
          service: service,
          identifier: identifier
        })
        isCalling.current = false
        if (res.localChunkCount) {
          setResourceStatus(res)
        }

        // check if progress is 100% and clear interval if true
        if (res?.status === 'READY') {
          clearInterval(intervalId)
        }
      }, 1000) // 1 second interval

      return intervalId
    }

    const intervalId = getStatus()

    // cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId)
  }, [identifier, name, service, isLoading])

  React.useEffect(() => {
    workerRef.current = new MyWorker()

    workerRef.current.addEventListener('message', (event: any) => {
      const url = event.data
      console.log({ url })
      const videoElement = document.querySelector('video')
      if (!videoElement) return
      videoElement.src = url
      setSrc(url)
    })

    return () => {
      workerRef.current.terminate()
    }
  }, [])

  React.useEffect(() => {
    const videoElement = videoRef.current

    const handleLeavePictureInPicture = async (event: any) => {
      const target = event?.target
      if (target) {
        console.log({ target })
        target.pause()
        if (setPlaying) {
          setPlaying(false)
        }
      }
    }

    if (videoElement) {
      videoElement.addEventListener(
        'leavepictureinpicture',
        handleLeavePictureInPicture
      )
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener(
          'leavepictureinpicture',
          handleLeavePictureInPicture
        )
      }
    }
  }, [])

  React.useEffect(() => {
    const videoElement = videoRef.current

    const minimizeVideo = async () => {
      if (!videoElement) return
      const handleClose = () => {
        if (videoElement && videoElement.parentElement) {
          const el = document.getElementById('videoWrapper')
          if (el) {
            el?.parentElement?.removeChild(el)
          }
        }
      }
      const createCloseButton = (): HTMLButtonElement => {
        const closeButton = document.createElement('button')
        closeButton.textContent = 'X'
        closeButton.style.position = 'absolute'
        closeButton.style.top = '0'
        closeButton.style.right = '0'
        closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
        closeButton.style.border = 'none'
        closeButton.style.fontWeight = 'bold'
        closeButton.style.fontSize = '1.2rem'
        closeButton.style.cursor = 'pointer'
        closeButton.style.padding = '2px 8px'
        closeButton.style.borderRadius = '0 0 0 4px'

        closeButton.addEventListener('click', handleClose)

        return closeButton
      }
      const buttonClose = createCloseButton()
      const videoWrapper = document.createElement('div')
      videoWrapper.id = 'videoWrapper'
      videoWrapper.style.position = 'fixed'
      videoWrapper.style.zIndex = '900000009'
      videoWrapper.style.bottom = '0px'
      videoWrapper.style.right = '0px'

      videoElement.parentElement?.insertBefore(videoWrapper, videoElement)
      videoWrapper.appendChild(videoElement)

      videoWrapper.appendChild(buttonClose)
      videoElement.controls = true
      videoElement.style.height = 'auto'
      videoElement.style.width = '300px'

      console.log({ videoElement })
      document.body.appendChild(videoWrapper)
    }

    return () => {
      if (videoElement) {
        if (videoElement && !videoElement.paused && !videoElement.ended) {
          minimizeVideo()
        }
      }
    }
  }, [])

  function formatTime(seconds: number): string {
    seconds = Math.floor(seconds)

    let minutes: number | string = Math.floor(seconds / 60)
    let remainingSeconds: number | string = seconds % 60

    if (minutes < 10) {
      minutes = '0' + minutes
    }
    if (remainingSeconds < 10) {
      remainingSeconds = '0' + remainingSeconds
    }

    return minutes + ':' + remainingSeconds
  }

  return (
    <VideoContainer
      style={{
        padding: from === 'create' ? '8px' : 0
      }}
    >
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
          zIndex={4999}
          bgcolor="rgba(0, 0, 0, 0.6)"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <CircularProgress color="secondary" />
          {resourceStatus && (
            <Typography
              variant="subtitle2"
              component="div"
              sx={{
                color: 'white',
                fontSize: '18px'
              }}
            >
              {resourceStatus?.status !== 'READY' ? (
                <>
                  {(resourceStatus.localChunkCount /
                    resourceStatus.totalChunkCount) *
                    100}
                  %
                </>
              ) : (
                <>Download Completed: fetching video...</>
              )}
            </Typography>
          )}
        </Box>
      )}
      {!src && !isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex={500}
          bgcolor="rgba(0, 0, 0, 0.6)"
          onClick={() => {
            if (from === 'create') return

            togglePlay()
          }}
          sx={{
            cursor: 'pointer'
          }}
        >
          <PlayArrow
            sx={{
              width: '50px',
              height: '50px',
              color: 'white'
            }}
          />
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
        preload="metadata"
        style={{
          ...customStyle
        }}
      />
      <ControlsContainer
        style={{
          bottom: from === 'create' ? '15px' : 0
        }}
      >
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
        <Typography
          sx={{
            fontSize: '14px',
            marginRight: '5px',
            color: 'rgba(255, 255, 255, 0.7)',
            visibility:
              !videoRef.current?.duration || !progress ? 'hidden' : 'visible'
          }}
        >
          {progress && videoRef.current?.duration && formatTime(progress)}/
          {progress &&
            videoRef.current?.duration &&
            formatTime(videoRef.current?.duration)}
        </Typography>
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
          ref={toggleRef}
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
