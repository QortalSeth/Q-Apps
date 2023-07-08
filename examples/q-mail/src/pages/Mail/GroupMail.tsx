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
import { Box, Button, Input, Typography, useTheme } from '@mui/material'
import { useFetchPosts } from '../../hooks/useFetchPosts'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import { NewMessage } from './NewMessage'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { useFetchMail } from '../../hooks/useFetchMail'
import { ShowMessage } from './ShowMessage'
import { fetchAndEvaluateMail } from '../../utils/fetchMail'
import { addToHashMapMail } from '../../state/features/mailSlice'
import MailIcon from '@mui/icons-material/Mail'
import {
  setIsLoadingGlobal,
  setUserAvatarHash
} from '../../state/features/globalSlice'
import SimpleTable from './MailTable'
import { MAIL_SERVICE_TYPE } from '../../constants/mail'
import { BlogPost } from '../../state/features/blogSlice'
import { base64ToUint8Array, uint8ArrayToObject } from '../../utils/toBase64'
import { formatDate } from '../../utils/time'
import { NewThread } from './NewThread'
import { Thread } from './Thread'

interface AliasMailProps {
  groupInfo: any
}
export const GroupMail = ({ groupInfo }: AliasMailProps) => {
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [message, setMessage] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [valueTab, setValueTab] = React.useState(0)
  const [aliasValue, setAliasValue] = useState('')
  const [alias, setAlias] = useState<string[]>([])
  const [recentThreads, setRecentThreads] = useState<any[]>([])
  const [currentThread, setCurrentThread] = useState<any>(null)
  const hashMapPosts = useSelector(
    (state: RootState) => state.blog.hashMapPosts
  )
  const [mailMessages, setMailMessages] = useState<any[]>([])
  const hashMapMailMessages = useSelector(
    (state: RootState) => state.mail.hashMapMailMessages
  )

  const groupId = useMemo(() => {
    return groupInfo?.id
  }, [groupInfo])

  const fullMailMessages = useMemo(() => {
    return mailMessages.map((msg) => {
      let message = msg
      const existingMessage = hashMapMailMessages[msg.id]
      if (existingMessage) {
        message = existingMessage
      }
      return message
    })
  }, [mailMessages, hashMapMailMessages, user])
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const getAvatar = async (user: string) => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: user,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })
      dispatch(
        setUserAvatarHash({
          name: user,
          url
        })
      )
    } catch (error) {}
  }

  const checkNewMessages = React.useCallback(
    async (recipientName: string, recipientAddress: string) => {
      try {
        const query = `qortal_qmail_${groupId}_mail`
        const url = `/arbitrary/resources/search?mode=ALL&service=${MAIL_SERVICE_TYPE}&query=${query}&limit=50&includemetadata=true&reverse=true&excludeblocked=true`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData = await response.json()

        const latestPost = mailMessages[0]
        if (!latestPost) return
        const findPost = responseData?.findIndex(
          (item: any) => item?.identifier === latestPost?.id
        )
        if (findPost === -1) {
          return
        }
        const newArray = responseData.slice(0, findPost)
        const structureData = newArray.map((post: any): BlogPost => {
          return {
            title: post?.metadata?.title,
            category: post?.metadata?.category,
            categoryName: post?.metadata?.categoryName,
            tags: post?.metadata?.tags || [],
            description: post?.metadata?.description,
            createdAt: post?.created,
            updated: post?.updated,
            user: post.name,
            id: post.identifier
          }
        })
        setMailMessages((prev) => {
          const updatedMessages = [...prev]

          structureData.forEach((newMessage: any) => {
            const existingIndex = updatedMessages.findIndex(
              (prevMessage) => prevMessage.id === newMessage.id
            )

            if (existingIndex !== -1) {
              // Replace existing message
              updatedMessages[existingIndex] = newMessage
            } else {
              // Add new message
              updatedMessages.unshift(newMessage)
            }
          })

          return updatedMessages
        })
        return
      } catch (error) {}
    },
    [mailMessages]
  )

  const getMailMessages = React.useCallback(async (groupId: string) => {
    try {
      dispatch(setIsLoadingGlobal(true))
      const query = `qortal_qmail_thmsg_group${groupId}`
      const url = `/arbitrary/resources/search?mode=ALL&service=${MAIL_SERVICE_TYPE}&query=${query}&limit=4&includemetadata=true&offset=${0}&reverse=true&excludeblocked=true`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      console.log({ responseData })
      const messagesForThread: any = {}

      for (const message of responseData) {
        console.log({ message })
        let str = message.identifier
        let parts = str.split('_').reverse()
        let result = parts[1]
        const checkMessage = messagesForThread[result]
        if (!checkMessage) {
          messagesForThread[result] = message
        }
      }
      console.log({ messagesForThread })
      const newArray = Object.keys(messagesForThread)
        .map((key) => {
          return {
            ...messagesForThread[key],
            threadId: `qortal_qmail_thread_group${groupId}_${key}`
          }
        })
        .sort((a, b) => b.created - a.created)
      console.log({ newArray })
      let fullThreadArray = []
      for (const message of newArray) {
        try {
          let messageRes = await qortalRequest({
            action: 'FETCH_QDN_RESOURCE',
            name: message.name,
            service: MAIL_SERVICE_TYPE,
            identifier: message.identifier,
            encoding: 'base64'
          })
          console.log({ messageRes })
          let requestEncryptBody: any = {
            action: 'DECRYPT_DATA',
            encryptedData: messageRes
          }
          const resDecrypt = await qortalRequest(requestEncryptBody)
          console.log({ resDecrypt })

          const decryptToUnit8ArrayMessage = base64ToUint8Array(resDecrypt)
          const responseDataMessage = uint8ArrayToObject(
            decryptToUnit8ArrayMessage
          )
          let threadRes = await qortalRequest({
            action: 'FETCH_QDN_RESOURCE',
            name: responseDataMessage.threadOwner,
            service: MAIL_SERVICE_TYPE,
            identifier: message.threadId,
            encoding: 'base64'
          })
          console.log({ threadRes })
          let requestEncryptThread: any = {
            action: 'DECRYPT_DATA',
            encryptedData: threadRes
          }
          const resDecryptThread = await qortalRequest(requestEncryptThread)
          const decryptToUnit8ArrayThread = base64ToUint8Array(resDecryptThread)
          const responseDataThread = uint8ArrayToObject(
            decryptToUnit8ArrayThread
          )
          console.log({ resDecryptThread })
          const fullObject = {
            ...message,
            threadData: responseDataThread,
            messageData: responseDataMessage
          }
          console.log({ fullObject })
          fullThreadArray.push(fullObject)
        } catch (error) {
          console.log({ error })
        }
      }
      setRecentThreads(fullThreadArray)
      console.log({ fullThreadArray })
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [])
  const getMessages = React.useCallback(async () => {
    if (!user?.name || !groupId) return
    await getMailMessages(groupId)
  }, [getMailMessages, user, groupId])

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
      const existingMessage = hashMapMailMessages[messageIdentifier]
      if (existingMessage) {
        setMessage(existingMessage)
        setIsOpen(true)
        return
      }
      dispatch(setIsLoadingGlobal(true))
      const res = await fetchAndEvaluateMail({
        user,
        messageIdentifier,
        content,
        otherUser: user
      })
      setMessage(res)
      dispatch(addToHashMapMail(res))
      setIsOpen(true)
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }

  const firstMount = useRef(false)
  useEffect(() => {
    if (user?.name && groupId && !firstMount.current) {
      getMessages()
      firstMount.current = true
    }
  }, [user, groupId])

  const closeThread = useCallback(() => {
    setCurrentThread(null)
  }, [])

  return (
    <div
      style={{
        position: 'relative'
      }}
    >
      <Thread
        currentThread={currentThread}
        groupInfo={groupInfo}
        closeThread={closeThread}
      />
      <NewThread groupInfo={groupInfo} />

      <div>
        <p>Latest threads</p>
      </div>
      {recentThreads.map((thread) => {
        return (
          <div
            onClick={() => {
              setCurrentThread(thread)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: '20px',
              padding: '20px 10px'
            }}
          >
            <div>
              <MailIcon />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography>{thread?.threadData?.title}</Typography>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography>@{thread.name}</Typography> - last message -
                <Typography>{formatDate(thread?.created)}</Typography>
              </div>
            </div>
          </div>
        )
      })}
      <div>
        <Typography>Rest of threads by date created</Typography>
      </div>
      <Box
        sx={{
          width: '100%',
          justifyContent: 'center'
        }}
      >
        {mailMessages.length > 20 && (
          <Button onClick={getMessages}>Load Older Messages</Button>
        )}
      </Box>
    </div>
  )
}
