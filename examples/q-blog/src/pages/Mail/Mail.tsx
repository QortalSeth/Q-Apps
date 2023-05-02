import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { useFetchPosts } from '../../hooks/useFetchPosts'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import { NewMessage } from './NewMessage'
import { useFetchMail } from '../../hooks/useFetchMail'
import ReactVirtualizedTable from './MailTable'
import { ShowMessage } from './ShowMessage'
import { fetchAndEvaluateMail } from '../../utils/fetchMail'
import { addToHashMapMail } from '../../state/features/mailSlice'

export const Mail = () => {
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)

  const hashMapPosts = useSelector(
    (state: RootState) => state.blog.hashMapPosts
  )
  const hashMapMailMessages = useSelector(
    (state: RootState) => state.mail.hashMapMailMessages
  )
  const mailMessages = useSelector(
    (state: RootState) => state.mail.mailMessages
  )

  const fullMailMessages = useMemo(() => {
    return mailMessages.map((msg) => {
      let message = msg
      const existingMessage = hashMapMailMessages[msg.id]
      if (existingMessage) {
        message = existingMessage
      }
      return message
    })
  }, [mailMessages, hashMapMailMessages])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { getMailMessages, checkNewMessages } = useFetchMail()
  const getMessages = React.useCallback(async () => {
    if (!user?.name || !user?.address) return
    await getMailMessages(user.name, user.address)
  }, [getMailMessages, user])

  const interval = useRef<any>(null)

  const checkNewMessagesFunc = useCallback(() => {
    if (!user?.name || !user?.address) return
    let isCalling = false
    interval.current = setInterval(async () => {
      if (isCalling || !user?.name || !user?.address) return
      isCalling = true
      const res = await checkNewMessages(user?.name, user.address)
      isCalling = false
    }, 30000)
  }, [checkNewMessages, user])

  useEffect(() => {
    checkNewMessagesFunc()
    return () => {
      if (interval?.current) {
        clearInterval(interval.current)
      }
    }
  }, [checkNewMessagesFunc])

  const openMessage = async (
    user: string,
    messageIdentifier: string,
    content: any
  ) => {
    try {
      console.log({ user, messageIdentifier, content })
      const existingMessage = hashMapMailMessages[messageIdentifier]
      if (existingMessage) {
        setMessage(existingMessage)
      }
      const res = await fetchAndEvaluateMail({
        user,
        messageIdentifier,
        content,
        otherUser: user
      })
      console.log({ res })
      setMessage(res)
      dispatch(addToHashMapMail(res))
      setIsOpen(true)
    } catch (error) {}
  }

  const firstMount = useRef(false)
  useEffect(() => {
    if (user?.name && !firstMount.current) {
      getMessages()
      firstMount.current = true
    }
  }, [user])
  console.log({ mailMessages })
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        backgroundColor: 'background.paper'
      }}
    >
      <NewMessage replyTo={replyTo} setReplyTo={setReplyTo} />
      <ShowMessage
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        message={message}
        setReplyTo={setReplyTo}
      />
      {/* {countNewPosts > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography>
            {countNewPosts === 1
              ? `There is ${countNewPosts} new message`
              : `There are ${countNewPosts} new messages`}
          </Typography>
          <Button
            sx={{
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.text.primary,
              fontFamily: 'Arial'
            }}
            onClick={getNewPosts}
          >
            Load new Posts
          </Button>
        </Box>
      )} */}
      <ReactVirtualizedTable
        openMessage={openMessage}
        data={fullMailMessages}
        loadMoreData={getMessages}
      >
        {/* <LazyLoad onLoadMore={getMessages}></LazyLoad> */}
      </ReactVirtualizedTable>
      {/* <Box>
        {mailMessages.map((message, index) => {
          const existingMessage = hashMapMailMessages[message.id]
          let mailMessage = message
          if (existingMessage) {
            mailMessage = existingMessage
          }
          return (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                width: 'auto',
                position: 'relative',
                ' @media (max-width: 450px)': {
                  width: '100%'
                }
              }}
              key={mailMessage.id}
            >
              hello
            </Box>
          )
        })}
      </Box> */}
    </Box>
  )
}
