import React, { Dispatch, useEffect, useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { Box, Input } from '@mui/material'
import { BuilderButton } from '../CreatePost/CreatePost-styles'
import BlogEditor from '../../components/editor/BlogEditor'
import EmailIcon from '@mui/icons-material/Email'
import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { setNotification } from '../../state/features/notificationsSlice'
import {
  objectToBase64,
  objectToUint8Array,
  objectToUint8ArrayFromResponse,
  uint8ArrayToBase64
} from '../../utils/toBase64'
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]
const uid = new ShortUniqueId()

interface NewMessageProps {
  replyTo?: any
  setReplyTo: React.Dispatch<any>
}

export const NewMessage = ({ setReplyTo, replyTo }: NewMessageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [value, setValue] = useState(initialValue)
  const [title, setTitle] = useState<string>('')
  const [attachments, setAttachments] = useState<any[]>([])
  const [description, setDescription] = useState<string>('')
  const [destinationName, setDestinationName] = useState('')
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const openModal = () => {
    setIsOpen(true)

    setReplyTo(null)
  }
  const closeModal = () => {
    setIsOpen(false)
  }
  useEffect(() => {
    if (replyTo) {
      setIsOpen(true)
      setDestinationName(replyTo?.user || '')
    }
  }, [replyTo])
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

    const mailObject: any = {
      title,
      description,
      createdAt: Date.now(),
      version: 1,
      attachments,
      textContent: value,
      generalData: {
        thread: []
      }
    }
    if (replyTo?.id && mailObject?.generalData?.thread) {
      mailObject.generalData.thread.push(replyTo.id)
    }
    if (replyTo?.id && !mailObject?.generalData?.thread) {
      mailObject.generalData.thread = [replyTo.id]
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
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%'
      }}
    >
      <EmailIcon
        sx={{
          cursor: 'pointer',
          margin: '15px'
        }}
        onClick={openModal}
      />
      <ReusableModal open={isOpen}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Input
            id="standard-adornment-name"
            value={destinationName}
            disabled={!!replyTo}
            onChange={(e) => {
              setDestinationName(e.target.value)
            }}
            placeholder="To (name) -public"
          />
          <Input
            id="standard-adornment-name"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            placeholder="Subject -public"
          />
          <BlogEditor value={value} setValue={setValue} editorKey={1} />
        </Box>
        <BuilderButton onClick={sendMail}>
          {replyTo ? 'Send reply mail' : 'Send mail'}
        </BuilderButton>
        <BuilderButton onClick={closeModal}>Close</BuilderButton>
      </ReusableModal>
    </Box>
  )
}
