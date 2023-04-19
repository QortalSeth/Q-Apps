import React, { useMemo, useState } from 'react'
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Typography,
  Box,
  Button,
  Tooltip
} from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { styled } from '@mui/system'
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
  isValid?: boolean
}

const StyledCard = styled(Card)`
  max-width: 600px;
  width: 100%;
  margin: 10px 0px;
  cursor: pointer;

  @media (max-width: 450px) {
    width: 100%;
  }
`

const StyledCardMedia = styled(CardMedia)`
  height: 0;
  padding-top: 56.25%; // 16:9 aspect ratio
`
const EllipsisTypography = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({
  title,
  createdAt,
  author,
  postImage,
  description,
  onClick,
  blogPost,
  isValid
}) => {
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')
  const dispatch = useDispatch<AppDispatch>()
  const favoritesLocal = useSelector(
    (state: RootState) => state.blog.favoritesLocal
  )
  const [isOpenAlert, setIsOpenAlert] = useState<boolean>(false)
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
    if (user === 'q-blog') return
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

  const continueToPost = () => {
    if (isValid === false) {
      setIsOpenAlert(true)
      return
    }
    if (!onClick) return
    onClick()
  }

  const handleClose = () => {
    setIsOpenAlert(false)
  }
  return (
    <>
      <StyledCard onClick={continueToPost}>
        <CardHeader
          sx={{
            '& .MuiCardHeader-content': {
              overflow: 'hidden'
            }
          }}
          avatar={<Avatar src={avatarUrl} alt={`${author}'s avatar`} />}
          title={
            <EllipsisTypography noWrap variant="h6">
              {title}
            </EllipsisTypography>
          }
          subheader={`Author: ${author}`}
        />
        {/* <StyledCardMedia image={postImage} /> */}
        <img
          src={postImage}
          style={{
            width: '100%',
            height: 'auto'
          }}
        />
        <CardContent>
          <Typography
            variant="body2"
            color="textSecondary"
            // className="line-clamp"
            component="p"
          >
            {/* {extractTextFromSlate(description)} */}
            {description}
          </Typography>
          <Box marginTop="1rem">
            <Typography variant="caption" color="textSecondary">
              {formatDate(+createdAt)}
            </Typography>
          </Box>
        </CardContent>
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

      <Dialog
        open={isOpenAlert}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Invalid Content Structure
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This post seems to contain an invalid content structure. Click
            continue to proceed
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={onClick} autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BlogPostPreview
