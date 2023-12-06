import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { setIsLoadingGlobal } from '../../state/features/globalSlice'
import { Avatar, Box, Typography, useTheme } from '@mui/material'
import { VideoPlayer } from '../../components/common/VideoPlayer'
import { RootState } from '../../state/store'
import { addToHashMap } from '../../state/features/videoSlice'
import mockImg from '../../test/mockimg.jpg'
import { AuthorTextComment, Spacer, StyledCardColComment, StyledCardHeaderComment, VideoDescription, VideoPlayerContainer, VideoTitle } from './VideoContent-styles'
import { setUserAvatarHash } from '../../state/features/globalSlice'
import { formatDate, formatDateSeconds, formatTimestampSeconds } from '../../utils/time'
import { NavbarName } from '../../components/layout/Navbar/Navbar-styles'
import { CommentSection } from '../../components/common/Comments/CommentSection'
import { CrowdfundSubTitle, CrowdfundSubTitleRow } from '../../components/UploadVideo/Upload-styles'
import { QTUBE_VIDEO_BASE } from '../../constants'
import { Playlists } from '../../components/Playlists/Playlists'

export const VideoContent = () => {
  const { name, id } = useParams()
  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  )

  const avatarUrl = useMemo(()=> {
    let url = ''
    if(name && userAvatarHash[name]){
      url = userAvatarHash[name]
    }

    return url
  }, [userAvatarHash, name])
  const navigate = useNavigate()
  const theme = useTheme()

  const [videoData, setVideoData] = useState<any>(null)
  const [playlistData, setPlaylistData] = useState<any>(null)

  const hashMapVideos = useSelector(
    (state: RootState) => state.video.hashMapVideos
  )
  const videoReference = useMemo(() => {
    if (!videoData) return null
    const { videoReference } = videoData
    if (videoReference?.identifier && videoReference?.name && videoReference?.service) {
      return videoReference
    } else {
      return null
    }
  }, [videoData])

  const videoCover = useMemo(() => {
    if (!videoData) return null
    const { videoImage } = videoData
    return videoImage || null
  }, [videoData])
  const dispatch = useDispatch()

  const getVideoData = React.useCallback(async (name: string, id: string) => {
    try {
      if (!name || !id) return
      dispatch(setIsLoadingGlobal(true))

      const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&query=${QTUBE_VIDEO_BASE}&limit=1&includemetadata=true&reverse=true&excludeblocked=true&name=${name}&exactmatchnames=true&offset=0&identifier=${id}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseDataSearch = await response.json()

     
      if (responseDataSearch?.length > 0) {
        let resourceData = responseDataSearch[0]
        resourceData = {
          title: resourceData?.metadata?.title,
          category: resourceData?.metadata?.category,
          categoryName: resourceData?.metadata?.categoryName,
          tags: resourceData?.metadata?.tags || [],
          description: resourceData?.metadata?.description,
          created: resourceData?.created,
          updated: resourceData?.updated,
          user: resourceData.name,
          videoImage: '',
          id: resourceData.identifier
        }
      
        const responseData = await qortalRequest({
          action: 'FETCH_QDN_RESOURCE',
          name: name,
          service: 'DOCUMENT',
          identifier: id
        })
   
        if (responseData && !responseData.error) {
          const combinedData = {
            ...resourceData,
            ...responseData
          }
       
          setVideoData(combinedData)
          dispatch(addToHashMap(combinedData))
          checkforPlaylist(name,id, combinedData?.code)
        }
      }

    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [])

  const checkforPlaylist = React.useCallback(async (name, id, code)=> {
    try {
      if (!name || !id || !code) return

      const url = `/arbitrary/resources/search?mode=ALL&service=PLAYLIST&description=c:${code}&limit=1&includemetadata=true&reverse=true&excludeblocked=true&name=${name}&exactmatchnames=true&offset=0`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseDataSearch = await response.json()

      if (responseDataSearch?.length > 0) {
        let resourceData = responseDataSearch[0]
        resourceData = {
          title: resourceData?.metadata?.title,
          category: resourceData?.metadata?.category,
          categoryName: resourceData?.metadata?.categoryName,
          tags: resourceData?.metadata?.tags || [],
          description: resourceData?.metadata?.description,
          created: resourceData?.created,
          updated: resourceData?.updated,
          name: resourceData.name,
          videoImage: '',
          identifier: resourceData.identifier,
          service: resourceData.service
        }
  
        const responseData = await qortalRequest({
          action: 'FETCH_QDN_RESOURCE',
          name: resourceData.name,
          service: resourceData.service,
          identifier: resourceData.identifier
        })

   
        if (responseData && !responseData.error) {
          const combinedData = {
            ...resourceData,
            ...responseData
          }
          const videos = []
          if(combinedData?.videos){
            for(const vid of combinedData.videos){
              const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&identifier=${vid.identifier}&limit=1&includemetadata=true&reverse=true&name=${vid.name}&exactmatchnames=true&offset=0`
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              const responseDataSearchVid = await response.json()
        
              if (responseDataSearchVid?.length > 0) {
                let resourceData2 = responseDataSearchVid[0]
                videos.push(resourceData2)
            }
            }
          }
          combinedData.videos = videos
          setPlaylistData(combinedData)
        }
      }
    } catch (error) {
      
    }
  }, [])

  React.useEffect(() => {
    if (name && id) {
      const existingVideo = hashMapVideos[id]

      if (existingVideo) {
        setVideoData(existingVideo)
        checkforPlaylist(name,id, existingVideo?.code)
      } else {
        getVideoData(name, id)
      }

     


    }

  }, [id, name])


  // const getAvatar = React.useCallback(async (author: string) => {
  //   try {
  //     let url = await qortalRequest({
  //       action: 'GET_QDN_RESOURCE_URL',
  //       name: author,
  //       service: 'THUMBNAIL',
  //       identifier: 'qortal_avatar'
  //     })

  //     setAvatarUrl(url)
  //     dispatch(setUserAvatarHash({
  //       name: author,
  //       url
  //     }))
  //   } catch (error) { }
  // }, [])

  // React.useEffect(() => {
  //   if (name && !avatarUrl) {
  //     const existingAvatar = userAvatarHash[name]

  //     if (existingAvatar) {
  //       setAvatarUrl(existingAvatar)
  //     } else {
  //       getAvatar(name)
  //     }

  //   }

  // }, [name, userAvatarHash])



  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px 10px'
      }}
    >
      <VideoPlayerContainer sx={{
        marginBottom: '30px'
      }}>
        {videoReference && (

          <VideoPlayer
            name={videoReference?.name}
            service={videoReference?.service}
            identifier={videoReference?.identifier}
            user={name}
            jsonId={id}
            poster={videoCover || ""}
          />

        )}

        <Spacer height="15px" />
        <VideoTitle
          variant="h1"
          color="textPrimary"
          sx={{
            textAlign: 'center'
          }}
        >
          {videoData?.title}
        </VideoTitle>
        {videoData?.created && (
             <Typography
             variant="h6"
             sx={{
               fontSize: '12px'
             }}
             color={theme.palette.text.primary}
           >
             {formatDate(videoData.created)}
           </Typography>
        )}
     
        <Spacer height="15px"/>
        <Box sx={{
          cursor: 'pointer'
        }}  onClick={() => {
                    navigate(`/channel/${name}`)
                  }}>
          <StyledCardHeaderComment
            sx={{
              '& .MuiCardHeader-content': {
                overflow: 'hidden'
              }
            }}
          >
            <Box>
              <Avatar src={`/arbitrary/THUMBNAIL/${name}/qortal_avatar`} alt={`${name}'s avatar`} />
            </Box>
            <StyledCardColComment>
              <AuthorTextComment
                color={
                  theme.palette.mode === 'light'
                    ? theme.palette.text.secondary
                    : '#d6e8ff'
                }
              >
                {name}
              </AuthorTextComment>
            </StyledCardColComment>

          </StyledCardHeaderComment>
        </Box>
        <Spacer height="15px"/>
        <VideoDescription
          variant="body1"
          color="textPrimary"
        >
          {videoData?.fullDescription}
        </VideoDescription>

      </VideoPlayerContainer>
     
      <Box sx={{
        display: 'flex',
        gap:'20px',
        width: '100%',
        maxWidth: "1200px"
      }}>
              <CommentSection postId={id || ""} postName={name || ""} />
      { playlistData && (
        <Playlists playlistData={playlistData} currentVideoIdentifier={id}/>
      )}
      </Box>
    </Box>
  )
}
