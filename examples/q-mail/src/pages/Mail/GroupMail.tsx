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
  setIsLoadingCustom,
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
import { current } from '@reduxjs/toolkit'
import { delay } from '../../utils/helpers'

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
  const [allThreads, setAllThreads] = useState<any[]>([])
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

  const getAllThreads = React.useCallback(
    async (groupId: string) => {
      try {
        const offset = allThreads.length
        dispatch(setIsLoadingCustom('Loading messages. This may take time.'))
        const query = `qortal_qmail_thread_group${groupId}`
        const url = `/arbitrary/resources/search?mode=ALL&service=${MAIL_SERVICE_TYPE}&query=${query}&limit=${20}&includemetadata=false&offset=${offset}&reverse=true&excludeblocked=true`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData = await response.json()

        let fullArrayMsg = [...allThreads]
        for (const message of responseData) {
          try {
            let threadRes = await qortalRequest({
              action: 'FETCH_QDN_RESOURCE',
              name: message.name,
              service: MAIL_SERVICE_TYPE,
              identifier: message.identifier,
              encoding: 'base64'
            })
            let requestEncryptThread: any = {
              action: 'DECRYPT_DATA',
              encryptedData: threadRes
            }
            const resDecryptThread = await qortalRequest(requestEncryptThread)
            const decryptToUnit8ArrayThread =
              base64ToUint8Array(resDecryptThread)
            const responseDataThread = uint8ArrayToObject(
              decryptToUnit8ArrayThread
            )
            const fullObject = {
              ...message,
              threadId: message.identifier,
              threadData: responseDataThread
            }
            const index = allThreads.findIndex(
              (p) => p.identifier === fullObject.identifier
            )
            if (index !== -1) {
              fullArrayMsg[index] = fullObject
            } else {
              fullArrayMsg.push(fullObject)
            }
          } catch (error) {
          } finally {
            dispatch(setIsLoadingCustom(null))
          }
        }
        setAllThreads(fullArrayMsg)
      } catch (error) {
      } finally {
        dispatch(setIsLoadingCustom(null))
      }
    },
    [allThreads]
  )

  const getMailMessages = React.useCallback(async (groupId: string) => {
    try {
      dispatch(setIsLoadingCustom('Loading messages. This may take time.'))
      const query = `qortal_qmail_thmsg_group${groupId}`
      const url = `/arbitrary/resources/search?mode=ALL&service=${MAIL_SERVICE_TYPE}&query=${query}&limit=100&includemetadata=false&offset=${0}&reverse=true&excludeblocked=true`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      const messagesForThread: any = {}

      for (const message of responseData) {
        let str = message.identifier
        let parts = str.split('_').reverse()
        let result = parts[1]
        const checkMessage = messagesForThread[result]
        if (!checkMessage) {
          messagesForThread[result] = message
        }
      }
      const newArray = Object.keys(messagesForThread)
        .map((key) => {
          return {
            ...messagesForThread[key],
            threadId: `qortal_qmail_thread_group${groupId}_${key}`
          }
        })
        .sort((a, b) => b.created - a.created)
      let fullThreadArray: any = []
      const getMessageForThreads = newArray.map(async (message: any) => {
        try {
          let messageRes = await Promise.race([
            qortalRequest({
              action: 'FETCH_QDN_RESOURCE',
              name: message.name,
              service: MAIL_SERVICE_TYPE,
              identifier: message.identifier,
              encoding: 'base64'
            }),
            delay(7000)
          ])
          let requestEncryptBody: any = {
            action: 'DECRYPT_DATA',
            encryptedData: messageRes
          }
          const resDecrypt = await qortalRequest(requestEncryptBody)

          const decryptToUnit8ArrayMessage = base64ToUint8Array(resDecrypt)
          const responseDataMessage = uint8ArrayToObject(
            decryptToUnit8ArrayMessage
          )
          let threadRes = await Promise.race([
            qortalRequest({
              action: 'FETCH_QDN_RESOURCE',
              name: responseDataMessage.threadOwner,
              service: MAIL_SERVICE_TYPE,
              identifier: message.threadId,
              encoding: 'base64'
            }),
            delay(5000)
          ])

          let requestEncryptThread: any = {
            action: 'DECRYPT_DATA',
            encryptedData: threadRes
          }
          const resDecryptThread = await qortalRequest(requestEncryptThread)
          const decryptToUnit8ArrayThread = base64ToUint8Array(resDecryptThread)
          const responseDataThread = uint8ArrayToObject(
            decryptToUnit8ArrayThread
          )
          const fullObject = {
            ...message,
            threadData: responseDataThread,
            messageData: responseDataMessage
          }
          fullThreadArray.push(fullObject)
        } catch (error) {}
        return null
      })
      await Promise.all(getMessageForThreads)
      const sorted = fullThreadArray.sort(
        (a: any, b: any) => b.created - a.created
      )
      setRecentThreads(sorted)
    } catch (error) {
    } finally {
      dispatch(setIsLoadingCustom(null))
    }
  }, [])
  const getMessages = React.useCallback(async () => {
    if (!user?.name || !groupId) return
    await getMailMessages(groupId)
  }, [getMailMessages, user, groupId])

  const interval = useRef<any>(null)

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

  useEffect(() => {
    if (currentThread) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [currentThread])

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
      <NewThread groupInfo={groupInfo} refreshLatestThreads={getMessages} />

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
              margin: '5px 10px',
              gap: '20px',
              padding: '20px 10px',
              border: 'solid 1px',
              borderRadius: '5px',
              marginBottom: '10px',
              cursor: 'pointer'
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
                <Typography
                  sx={{
                    fontSize: '18px'
                  }}
                >
                  last message: @{thread.name} - {formatDate(thread?.created)}
                </Typography>
              </div>
            </div>
          </div>
        )
      })}

      <Box
        sx={{
          width: '100%',
          justifyContent: 'center'
        }}
      >
        {allThreads.length === 0 && (
          <Button variant="contained" onClick={() => getAllThreads(groupId)}>
            Load all threads
          </Button>
        )}
        {allThreads.length > 0 && (
          <div>
            <p>All threads</p>
          </div>
        )}
        {allThreads.map((thread) => {
          return (
            <div
              onClick={() => {
                setCurrentThread(thread)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '5px 10px',
                gap: '20px',
                padding: '20px 10px',
                border: 'solid 1px',
                borderRadius: '5px',
                marginBottom: '10px',
                cursor: 'pointer'
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
              </div>
            </div>
          )
        })}

        {allThreads.length > 0 && (
          <Button variant="contained" onClick={() => getAllThreads(groupId)}>
            Load more threads
          </Button>
        )}
      </Box>
    </div>
  )
}
