import React, { useMemo } from 'react'
import { Avatar, Typography, Box, Tooltip, useTheme } from '@mui/material'

import {
  CardContentContainer,
  StyledCard,
  StyledCardContent,
  TitleText,
  AuthorText,
  StyledCardHeader,
  StyledCardCol
} from './PostPreview-styles'
import moment from 'moment'
import {
  blockUser,
  BlogPost,
  removeFavorites,
  removeSubscription,
  upsertFavorites
} from '../../state/features/blogSlice'
import { useDispatch, useSelector } from 'react-redux'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { AppDispatch, RootState } from '../../state/store'
import BlockIcon from '@mui/icons-material/Block'
import { CustomIcon } from '../../components/common/CustomIcon'
interface BlogPostPreviewProps {
  title: string
  createdAt: number | string
  author: string
  postImage?: string
  description: any
  blogPost: BlogPost
  onClick?: () => void
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  title,
  createdAt,
  author,
  postImage,
  description,
  onClick,
  blogPost
}) => {
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')
  const dispatch = useDispatch<AppDispatch>()
  const theme = useTheme()
  const favoritesLocal = useSelector(
    (state: RootState) => state.blog.favoritesLocal
  )
  const subscriptions = useSelector(
    (state: RootState) => state.blog.subscriptions
  )
  const username = useSelector((state: RootState) => state.auth?.user?.name)
  const formatDate = (unixTimestamp: number): string => {
    const date = moment(unixTimestamp, 'x').fromNow()

    return date
  }

  function extractTextFromSlate(nodes: any) {
    console.log({ nodes })
    if (!Array.isArray(nodes)) return ''
    let text = ''

    for (const node of nodes) {
      if (node.text) {
        text += node.text
      } else if (node.children) {
        text += extractTextFromSlate(node.children)
      }
    }

    return text
  }
  const getAvatar = React.useCallback(async () => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: author,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })

      console.log({ url })
      setAvatarUrl(url)
    } catch (error) {}
  }, [author])

  React.useEffect(() => {
    getAvatar()
  }, [])

  const isFavorite = useMemo(() => {
    if (!favoritesLocal) return false
    return favoritesLocal.find((fav) => fav?.id === blogPost?.id)
  }, [favoritesLocal, blogPost?.id])

  const blockUserFunc = async (user: string) => {
    if (user === 'q-blog' || user === 'Phil') return
    if (subscriptions.includes(user) && username) {
      try {
        const listName = `q-blog-subscriptions-${username}`

        const response = await qortalRequest({
          action: 'DELETE_LIST_ITEM',
          list_name: listName,
          item: user
        })
        if (response === true) {
          dispatch(removeSubscription(user))
        }
      } catch (error) {
        console.log({ error })
      }
    }

    try {
      const response = await qortalRequest({
        action: 'ADD_LIST_ITEMS',
        list_name: 'blockedNames_q-blog',
        items: [user]
      })

      if (response === true) {
        dispatch(blockUser(user))
        dispatch(removeFavorites(blogPost.id))
      }
    } catch (error) {}
  }

  console.log({ theme })

  return (
    <>
      <StyledCard onClick={onClick}>
        {postImage && (
          <Box sx={{ padding: '2px' }}>
            <img
              src={postImage}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          </Box>
        )}
        <CardContentContainer>
          <StyledCardHeader
            sx={{
              '& .MuiCardHeader-content': {
                overflow: 'hidden'
              }
            }}
          >
            <Box>
              <Avatar src={avatarUrl} alt={`${author}'s avatar`} />
            </Box>
            <StyledCardCol>
              <TitleText
                color={theme.palette.text.primary}
                noWrap
                variant="body1"
              >
                {title}
              </TitleText>
              <AuthorText color={theme.palette.text.secondary}>
                {author}
              </AuthorText>
            </StyledCardCol>
          </StyledCardHeader>
          <StyledCardContent>
            <Typography variant="body2" color={theme.palette.text.primary}>
              {description}
            </Typography>
            <Box sx={{ textAlign: 'flex-start', width: '100%' }}>
              <Typography variant="h6" color={theme.palette.text.primary}>
                {formatDate(+createdAt)}
              </Typography>
            </Box>
          </StyledCardContent>
        </CardContentContainer>
      </StyledCard>
      <Box
        sx={{
          position: 'absolute',
          top: '10px',
          right: '5px'
        }}
      >
        <Tooltip title="Block user content">
          <Box>
            <CustomIcon
              component={BlockIcon}
              onClick={() => {
                blockUserFunc(blogPost.user)
              }}
            />
          </Box>
        </Tooltip>
        {username && isFavorite && (
          <BookmarkIcon
            sx={{
              color: 'red'
            }}
            onClick={() => {
              dispatch(removeFavorites(blogPost.id))
            }}
          />
        )}
        {username && !isFavorite && (
          <BookmarkBorderIcon
            onClick={() => {
              dispatch(upsertFavorites([blogPost]))
            }}
          />
        )}
      </Box>

      {/* <Button
        onClick={() => {
          dispatch(upsertFavorites([blogPost]))
        }}
      >
        + Fav
      </Button> */}
    </>
  )
}

export default BlogPostPreview
