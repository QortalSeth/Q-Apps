import React, { useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { Box, Button, Input, Typography } from '@mui/material'
import { BuilderButton } from '../CreatePost/CreatePost-styles'
import BlogEditor from '../../components/editor/BlogEditor'
import EmailIcon from '@mui/icons-material/Email'
import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import AttachFileIcon from '@mui/icons-material/AttachFile'

import { setNotification } from '../../state/features/notificationsSlice'
import {
  objectToBase64,
  objectToUint8Array,
  objectToUint8ArrayFromResponse,
  uint8ArrayToBase64
} from '../../utils/toBase64'
import ReadOnlySlate from '../../components/editor/ReadOnlySlate'
import MailThread from './MailThread'
import { AvatarWrapper } from './MailTable'
import { formatTimestamp } from '../../utils/time'
import FileElement from '../../components/FileElement'
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]
const uid = new ShortUniqueId()

export const ShowMessage = ({
  isOpen,
  setIsOpen,
  message,
  setReplyTo
}: any) => {
  const [value, setValue] = useState(initialValue)
  const [title, setTitle] = useState<string>('')
  const [attachments, setAttachments] = useState<any[]>([])
  const [description, setDescription] = useState<string>('')
  const [isOpenMailThread, setIsOpenMailThread] = useState<boolean>(false)

  const [destinationName, setDestinationName] = useState('')
  const user = useSelector((state: RootState) => state.auth?.user)
  const dispatch = useDispatch()
  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {
    setIsOpen(false)
    setIsOpenMailThread(false)
  }

  async function publishQDNResource() {
    let address
    let name
    let errorMsg = ''

    address = user?.address
    name = user?.name || ''

    const missingFields = []
    if (!address) {
      errorMsg = "Cannot send: your address isn't available"
    }
    if (!name) {
      errorMsg = 'Cannot send a message without a access to your name'
    }
    if (!destinationName) {
      errorMsg = 'Cannot send a message without a recipient name'
    }
    if (!description) missingFields.push('subject')
    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(', ')
      const errMsg = `Missing: ${missingFieldsString}`
      errorMsg = errMsg
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: 'error'
        })
      )
      throw new Error(errorMsg)
    }

    const mailObject = {
      title,
      description,
      createdAt: Date.now(),
      version: 1,
      attachments,
      textContent: value,
      generalData: {}
    }
    try {
      if (!destinationName) return
      const id = uid()
      const recipientName = destinationName
      const resName = await qortalRequest({
        action: 'GET_NAME_DATA',
        name: recipientName
      })
      if (!resName?.owner) return

      const recipientAddress = resName.owner
      const resAddress = await qortalRequest({
        action: 'GET_ACCOUNT_DATA',
        address: recipientAddress
      })
      if (!resAddress?.publicKey) return
      const recipientPublicKey = resAddress.publicKey

      const blogPostToUnit8Array = objectToUint8Array(mailObject)

      let requestEncryptBody: any = {
        action: 'ENCRYPT_DATA',
        Uint8ArrayData: blogPostToUnit8Array,
        destinationPublicKey: recipientPublicKey
      }
      const responseEncrypt = await qortalRequest(requestEncryptBody)

      if (!responseEncrypt?.encryptedData) return
      const identifier = `qblog_qmail_${recipientName.slice(
        0,
        20
      )}_${recipientAddress.slice(-6)}_mail_${id}`
      console.log({ responseEncrypt })
      const convertToArray = objectToUint8ArrayFromResponse(
        responseEncrypt.encryptedData
      )
      const encryptedDataBase64 = uint8ArrayToBase64(convertToArray)
      let requestBody: any = {
        action: 'PUBLISH_QDN_RESOURCE',
        name: name,
        service: 'DOCUMENT',
        data64: encryptedDataBase64,
        title: title,
        description: description,
        tag1: `attach: ${attachments?.length?.toString()}`,
        identifier
      }
      const resourceResponse = await qortalRequest(requestBody)
      dispatch(
        setNotification({
          msg: 'Message sent',
          alertType: 'success'
        })
      )
    } catch (error: any) {
      let notificationObj = null
      if (typeof error === 'string') {
        notificationObj = {
          msg: error || 'Failed to send message',
          alertType: 'error'
        }
      } else if (typeof error?.error === 'string') {
        notificationObj = {
          msg: error?.error || 'Failed to send message',
          alertType: 'error'
        }
      } else {
        notificationObj = {
          msg: error?.message || 'Failed to send message',
          alertType: 'error'
        }
      }
      if (!notificationObj) return
      dispatch(setNotification(notificationObj))

      throw new Error('Failed to send message')
    }
  }

  const sendMail = () => {
    publishQDNResource()
  }

  const handleReply = () => {
    setReplyTo(message)
  }

  console.log({ message })
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%'
      }}
    >
      <ReusableModal
        open={isOpen}
        customStyles={{
          width: '96%',
          maxWidth: 1500,
          height: '96%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            alignItems: 'center'
          }}
        >
          {isOpenMailThread &&
            message?.generalData?.thread &&
            message?.user &&
            user?.name && (
              <Button
                variant="contained"
                onClick={() => {
                  setIsOpenMailThread(false)
                }}
              >
                Hide message threads
              </Button>
            )}

          {!isOpenMailThread &&
            message?.generalData?.thread?.length > 0 &&
            message?.user &&
            user?.name && (
              <Button
                variant="contained"
                onClick={() => {
                  setIsOpenMailThread(true)
                }}
              >
                Show message threads
              </Button>
            )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            overflow: 'auto',
            width: '100%'
          }}
        >
          {isOpenMailThread &&
            message?.generalData?.thread?.length > 0 &&
            message?.user &&
            user?.name && (
              <MailThread
                thread={message?.generalData?.thread}
                users={[message.user, user.name]}
                otherUser={message?.user}
              />
            )}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AvatarWrapper user={message?.user} />
              <Typography
                sx={{
                  fontSize: '16px'
                }}
              >
                {message?.user}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px'
                }}
              >
                {message?.subject}
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px'
                }}
              >
                {formatTimestamp(message?.createdAt)}
              </Typography>
            </Box>
          </Box>
          {message?.attachments?.length > 0 && (
            <Box
              sx={{
                width: '100%',
                marginTop: '10px'
              }}
            >
              {message?.attachments.map((file: any) => {
                return (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      width: '100%'
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                        width: 'auto'
                      }}
                    >
                      <FileElement
                        fileInfo={file}
                        title={file?.filename}
                        mode="mail"
                      >
                        <AttachFileIcon
                          sx={{
                            height: '16px',
                            width: 'auto'
                          }}
                        ></AttachFileIcon>
                        <Typography
                          sx={{
                            fontSize: '16px'
                          }}
                        >
                          {file?.filename}
                        </Typography>
                      </FileElement>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}

          {message?.textContent && (
            <ReadOnlySlate content={message.textContent} mode="mail" />
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end'
          }}
        >
          <BuilderButton onClick={handleReply}>Reply</BuilderButton>
          <BuilderButton onClick={closeModal}>Close</BuilderButton>
        </Box>
      </ReusableModal>
    </Box>
  )
}
