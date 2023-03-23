import React from 'react'
import { useParams } from 'react-router-dom';
import { Button, Box, Typography, CardHeader, Avatar, } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/system';

import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { checkStructure } from '../../utils/checkStructure';
import { BlogContent } from '../../interfaces/interfaces';
import { setIsLoadingGlobal } from '../../state/features/globalSlice';
import { VideoPlayer } from '../../components/common/VideoPlayer'

export const BlogIndividualPost = () => {
  const { user, postId, blog } = useParams()
  const { user: userState } = useSelector((state: RootState) => state.auth)
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [blogContent, setBlogContent] = React.useState<BlogContent | null>(null)

  const getBlogPost = React.useCallback(async () => {
    try {
      dispatch(setIsLoadingGlobal(true))
      const url = `/arbitrary/BLOG_POST/${user}/${postId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log({ response })
      const responseData = await response.json()
      if (checkStructure(responseData)) {
        setBlogContent(responseData)
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [user, postId])
  React.useEffect(() => {
    getBlogPost()
  }, [])

  const getAvatar = React.useCallback(async () => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: user,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })

      console.log({ url })
      setAvatarUrl(url)
    } catch (error) {}
  }, [user])
  React.useEffect(() => {
    getAvatar()
  }, [])

  if (!blogContent) return null

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          maxWidth: '700px',
          margin: '15px',
          width: '70%'
        }}
      >
        {user === userState?.name && (
          <Button
            onClick={() => {
              navigate(`/${user}/${blog}/${postId}/edit`)
            }}
          >
            Edit Post
          </Button>
        )}
        <CardHeader
          onClick={() => {
            navigate(`/${user}/${blog}`)
          }}
          sx={{
            cursor: 'pointer',
            '& .MuiCardHeader-content': {
              overflow: 'hidden'
            },
            padding: '10px 0px'
          }}
          avatar={<Avatar src={avatarUrl} alt={`${user}'s avatar`} />}
          subheader={`Author: ${user}`}
        />
        <Typography
          variant="h1"
          color="textPrimary"
          sx={{
            textAlign: 'center'
          }}
        >
          {blogContent.title}
        </Typography>

        {blogContent?.postContent?.map((section: any) => {
          if (section.type === 'editor') {
            return <ReadOnlySlate key={section.id} content={section.content} />
          }
          if (section.type === 'image') {
            return <img src={section.content.image} className="post-image" />
          }
          if (section.type === 'video') {
            return (
              <VideoPlayer
                name={section.content.name}
                service={section.content.service}
                identifier={section.content.identifier}
              />
            )
          }
        })}
      </Box>
    </Box>
  )
}
