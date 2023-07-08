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

import { Box, Button, Input, Typography, useTheme } from '@mui/material'
import { MAIL_SERVICE_TYPE } from '../../constants/mail'
import { base64ToUint8Array, uint8ArrayToObject } from '../../utils/toBase64'
import { ShowMessage } from './ShowMessageWithoutModal'
import { NewThread } from './NewThread'

interface ThreadProps {
  currentThread: any
  groupInfo: any
  closeThread: () => void
}
export const Thread = ({
  currentThread,
  groupInfo,
  closeThread
}: ThreadProps) => {
  const theme = useTheme()
  const { user } = useSelector((state: RootState) => state.auth)
  const [messages, setMessages] = useState<any[]>([])

  const getMailMessages = React.useCallback(async (groupInfo: any) => {
    try {
      let str = groupInfo.threadId
      let parts = str.split('_').reverse()
      let result = parts[0]
      const threadId = result
      const query = `qortal_qmail_thmsg_group${groupInfo?.threadData?.groupId}_${threadId}`
      const url = `/arbitrary/resources/search?mode=ALL&service=${MAIL_SERVICE_TYPE}&query=${query}&limit=20&includemetadata=true&offset=${0}&reverse=true&excludeblocked=true`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      let fullArrayMsg = []

      for (const message of responseData) {
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

          const fullObject = {
            ...message,
            ...(responseDataMessage || {})
          }

          fullArrayMsg.push(fullObject)
        } catch (error) {
          console.log({ error })
        }
      }
      setMessages(fullArrayMsg)
    } catch (error) {
      console.log({ error })
    } finally {
    }
  }, [])
  const getMessages = React.useCallback(async () => {
    if (!user?.name || !currentThread) return
    await getMailMessages(currentThread)
  }, [getMailMessages, user, currentThread])
  const firstMount = useRef(false)
  useEffect(() => {
    if (user?.name && currentThread) {
      getMessages()
      firstMount.current = true
    }
  }, [user, currentThread])
  const messageCallback = useCallback((msg: any) => {
    setMessages((prev) => [msg, ...prev])
  }, [])

  const interval = useRef<any>(null)

  const checkNewMessages = React.useCallback(
    async (groupInfo: any) => {
      try {
        let str = groupInfo.threadId
        let parts = str.split('_').reverse()
        let result = parts[0]
        const threadId = result
        const query = `qortal_qmail_thmsg_group${groupInfo?.threadData?.groupId}_${threadId}`
        const url = `/arbitrary/resources/search?mode=ALL&service=${MAIL_SERVICE_TYPE}&query=${query}&limit=20&includemetadata=true&offset=${0}&reverse=true&excludeblocked=true`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData = await response.json()
        const latestMessage = messages[0]
        if (!latestMessage) return
        const findMessage = responseData?.findIndex(
          (item: any) => item?.identifier === latestMessage?.id
        )
        let sliceLength = responseData.length
        if (findMessage !== -1) {
          sliceLength = findMessage
        }
        const newArray = responseData.slice(0, findMessage).reverse()
        let fullArrayMsg = [...messages]

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

            const fullObject = {
              ...message,
              ...(responseDataMessage || {})
            }

            const index = messages.findIndex(
              (p) => p.identifier === fullObject.identifier
            )
            if (index !== -1) {
              fullArrayMsg[index] = fullObject
            } else {
              fullArrayMsg.unshift(fullObject)
            }
          } catch (error) {
            console.log({ error })
          }
        }
        setMessages(fullArrayMsg)
      } catch (error) {
        console.log({ error })
      } finally {
      }
    },
    [messages]
  )

  const checkNewMessagesFunc = useCallback(() => {
    if (!user?.name || !user?.address) return
    let isCalling = false
    interval.current = setInterval(async () => {
      if (isCalling || !user?.name || !user?.address) return
      isCalling = true
      const res = await checkNewMessages(currentThread)
      isCalling = false
    }, 8000)
  }, [checkNewMessages, user, currentThread])

  useEffect(() => {
    checkNewMessagesFunc()
    return () => {
      if (interval?.current) {
        clearInterval(interval.current)
      }
    }
  }, [checkNewMessagesFunc])

  if (!currentThread) return null

  console.log({ messages })

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '0px',
        top: '102px',
        left: '0px',
        right: '0px',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '20px'
        }}
      >
        <NewThread
          groupInfo={groupInfo}
          isMessage={true}
          currentThread={currentThread}
          messageCallback={messageCallback}
        />
        <Button variant="contained" onClick={() => closeThread()}>
          Close Thread
        </Button>
      </Box>

      {messages.map((message) => {
        return <ShowMessage key={message?.identifier} message={message} />
      })}
    </div>
  )
}
