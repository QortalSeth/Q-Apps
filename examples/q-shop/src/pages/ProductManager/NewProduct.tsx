import React, { Dispatch, useEffect, useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { Box, Button, Input, Typography, useTheme } from '@mui/material'
import BlogEditor from '../../components/editor/BlogEditor'
import EmailIcon from '@mui/icons-material/Email'
import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { useDropzone } from 'react-dropzone'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import CreateIcon from '@mui/icons-material/Create'
import { setNotification } from '../../state/features/notificationsSlice'
import {
  objectToBase64,
  objectToUint8Array,
  objectToUint8ArrayFromResponse,
  processFileInChunks,
  toBase64,
  uint8ArrayToBase64
} from '../../utils/toBase64'
import {
  MAIL_ATTACHMENT_SERVICE_TYPE,
  MAIL_SERVICE_TYPE
} from '../../constants/mail'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import useConfirmationModal from '../../hooks/useConfirmModal'
const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }]
  }
]
const uid = new ShortUniqueId({ length: 10 })

interface NewMessageProps {
  replyTo?: any
  setReplyTo: React.Dispatch<any>
  alias?: string
  hideButton?: boolean
}
const maxSize = 25 * 1024 * 1024 // 25 MB in bytes
export const NewMessage = ({
  setReplyTo,
  replyTo,
  alias,
  hideButton
}: NewMessageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [value, setValue] = useState(initialValue)
  const [title, setTitle] = useState<string>('')
  const [attachments, setAttachments] = useState<any[]>([])
  const [description, setDescription] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [destinationName, setDestinationName] = useState('')
  const [aliasValue, setAliasValue] = useState<string>('')
  const { user } = useSelector((state: RootState) => state.auth)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [showAlias, setShowAlias] = useState<boolean>(false)
  const [imagePreviewFile, setImagePreviewFile] = useState<any>(null)
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  )

  const theme = useTheme()
  const { Modal, showModal } = useConfirmationModal({
    title: 'Important',
    message:
      'To keep yourself anonymous remember to not use the same alias as the person you are messaging'
  })
  const dispatch = useDispatch()
  const { getRootProps, getInputProps } = useDropzone({
    maxSize,
    onDrop: (acceptedFiles) => {
      setAttachments((prev) => [...prev, ...acceptedFiles])
    },
    onDropRejected: (rejectedFiles) => {
      dispatch(
        setNotification({
          msg: 'One of your files is over the 25mb limit',
          alertType: 'error'
        })
      )
    }
  })
  const {
    getRootProps: getRootPropsImagePreview,
    getInputProps: getInputPropsImagePreview
  } = useDropzone({
    maxSize,
    accept: {
      'image/*': []
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if(acceptedFiles?.length > 0){
        setImagePreviewFile(acceptedFiles[0])
      }
     
    }
    // onDropRejected: (rejectedFiles) => {
    //   dispatch(
    //     setNotification({
    //       msg: 'One of your files is over the 25mb limit',
    //       alertType: 'error'
    //     })
    //   )
    // }
  })

  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {}

  async function publishQDNResource() {
    let address: string = ''
    let name: string = ''
    let errorMsg = ''

    address = user?.address || ''
    name = user?.name || ''

    const missingFields: string[] = []
    if (!address) {
      errorMsg = "Cannot send: your address isn't available"
    }
    if (!name) {
      errorMsg = 'Cannot send a message without a access to your name'
    }
    if (!imagePreviewFile) {
      errorMsg = 'Missing a preview image'
    }
    if (!currentStore) {
      errorMsg = 'Cannot create a product without having a store'
    }

    // if (!description) missingFields.push('subject')
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

    try {
      const productObject: any = {
        title: 'Shoes',
        description: 'description of shoes',
        created: Date.now(),
        version: 1,
        images: ['', ''],
        type: 'physical',
        recipient: destinationName,
        price: [{ currency: 'qort', value: 15 }]
      }
      const blogPostToBase64 = await objectToBase64(productObject)
      console.log({imagePreviewFile})
      const productId = uid()
      if (!currentStore) return
      const storeId: string = currentStore?.id
      const productResource = {
        identifier: `q-store-product-${storeId}-${productId}`,
        title: 'Shoes',
        name,
        service: 'PRODUCT',
        filename: 'product.json',
        data64: blogPostToBase64
      }

      const productImagePreviewResource = {
        identifier: `q-store-product-${storeId}-${productId}-image`,
        name,
        title: 'Shoes',
        service: 'IMAGE',
        filename: imagePreviewFile?.name,
        file: imagePreviewFile
      }

      const multiplePublish = {
        action: 'PUBLISH_MULTIPLE_QDN_RESOURCES',
        resources: [productImagePreviewResource, productResource]
      }
      await qortalRequest(multiplePublish)

      dispatch(
        setNotification({
          msg: 'Message sent',
          alertType: 'success'
        })
      )

      closeModal()
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

  const createProduct = () => {
    publishQDNResource()
  }
  return (
    <Box
      sx={{
        display: 'flex'
      }}
    >
      {!hideButton && (
        <Box
          className="step-2"
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: theme.palette.background.default,
            borderRadius: '25px',
            height: 'auto',
            padding: '10px',
            cursor: 'pointer',
            margin: '7px 10px 7px 0px;'
          }}
          onClick={openModal}
        >
          <CreateIcon
            sx={{
              cursor: 'pointer',
              marginRight: '5px'
            }}
          />
          <Typography
            sx={{
              fontSize: '14px'
            }}
          >
            Add product
          </Typography>
        </Box>
      )}

      <ReusableModal
        open={isOpen}
        customStyles={{
          maxHeight: '95vh',
          overflowY: 'auto'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: 2,
              width: '100%'
            }}
          >
            <Input
              id="standard-adornment-name"
              value={destinationName}
              onChange={(e) => {
                setDestinationName(e.target.value)
              }}
              placeholder="To (name)"
              sx={{
                width: '100%',
                fontSize: '16px'
              }}
            />
            <Input
              id="standard-adornment-name"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value)
              }}
              placeholder="Subject"
              sx={{
                width: '100%',
                fontSize: '16px'
              }}
            />
            <Box
              {...getRootPropsImagePreview()}
              sx={{
                border: '1px dashed gray',
                padding: 2,
                textAlign: 'center',
                marginBottom: 2
              }}
            >
              <input {...getInputPropsImagePreview()} />
              <AttachFileIcon
                sx={{
                  height: '20px',
                  width: 'auto',
                  cursor: 'pointer'
                }}
              ></AttachFileIcon>
            </Box>
          </Box>
          {/* <BlogEditor
            mode="mail"
            value={value}
            setValue={setValue}
            editorKey={1}
          /> */}
        </Box>
        <Button onClick={createProduct}>Create product</Button>
        <Button onClick={closeModal}>Close</Button>
      </ReusableModal>
      <Modal />
    </Box>
  )
}
