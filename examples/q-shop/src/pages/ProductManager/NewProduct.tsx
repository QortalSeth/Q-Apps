import React, { Dispatch, useEffect, useState } from 'react'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { Box, Button, Input, Typography, useTheme } from '@mui/material'

import { Descendant } from 'slate'
import ShortUniqueId from 'short-unique-id'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'

import CreateIcon from '@mui/icons-material/Create'
import { setNotification } from '../../state/features/notificationsSlice'
import { objectToBase64 } from '../../utils/toBase64'
import {
  MAIL_ATTACHMENT_SERVICE_TYPE,
  MAIL_SERVICE_TYPE
} from '../../constants/mail'

import { ProductForm } from './ProductForm'
import { setProductsToSave } from '../../state/features/globalSlice'

const uid = new ShortUniqueId({ length: 10 })

interface ProductPrice {
  currency: string
  value: number
}
export interface PublishProductParams {
  title: string
  description: string
  type: string
  images: string[]
  price: ProductPrice[]
  mainImageIndex: number
}
interface NewMessageProps {}
const maxSize = 25 * 1024 * 1024 // 25 MB in bytes
export const NewProduct = ({}: NewMessageProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const [destinationName, setDestinationName] = useState('')
  const { user } = useSelector((state: RootState) => state.auth)

  const [imagePreviewFile, setImagePreviewFile] = useState<any>(null)
  const currentStore = useSelector(
    (state: RootState) => state.global.currentStore
  )
  const dataContainer = useSelector(
    (state: RootState) => state.global.dataContainer
  )
  const theme = useTheme()

  const dispatch = useDispatch()

  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {
    setIsOpen(false)
  }

  async function addProduct({
    title,
    description,
    type,
    images,
    price,
    mainImageIndex
  }: PublishProductParams) {
    let address: string = ''
    let name: string = ''
    let errorMsg = ''

    address = user?.address || ''
    name = user?.name || ''

    if (!address) {
      errorMsg = "Cannot send: your address isn't available"
    }
    if (!name) {
      errorMsg = 'Cannot send a message without a access to your name'
    }
    if (images.length === 0) {
      errorMsg = 'Missing images'
    }
    if (!currentStore) {
      errorMsg = 'Cannot create a product without having a store'
    }
    if (!dataContainer) {
      errorMsg = 'Cannot create a product without having a data-container'
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: 'error'
        })
      )
      return
    }

    try {
      if (!currentStore?.id) throw new Error('Cannot find store id')
      if (!dataContainer?.products)
        throw new Error('Cannot find data-container products')
      const storeId: string = currentStore?.id

      const parts = storeId.split('q-store-general-')
      const shortStoreId = parts[1]
      const productId = uid()
      if (!currentStore) return

      const id = `q-store-product-${shortStoreId}-${productId}`
      const productObject: any = {
        title,
        description,
        created: Date.now(),
        version: 1,
        images,
        mainImageIndex,
        type,
        price,
        storeId,
        shortStoreId,
        id
      }

      dispatch(setProductsToSave(productObject))

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
  async function publishQDNResource({
    title,
    description,
    type,
    images,
    price,
    mainImageIndex
  }: PublishProductParams) {
    let address: string = ''
    let name: string = ''
    let errorMsg = ''

    address = user?.address || ''
    name = user?.name || ''

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
    if (!dataContainer) {
      errorMsg = 'Cannot create a product without having a data-container'
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
    if (!currentStore?.id) throw new Error('Cannot find store id')
    if (!dataContainer?.products)
      throw new Error('Cannot find data-container products')
    try {
      const newDataContainer = { ...dataContainer }
      const dataContainerProducts = { ...dataContainer.products }
    } catch (error: any) {
      throw new Error(error?.message || 'Failed to create product')
    }
    try {
      const storeId: string = currentStore?.id

      const parts = storeId.split('q-store-general-')
      const shortStoreId = parts[1]
      const productId = uid()
      if (!currentStore) return

      const id = `q-store-product-${shortStoreId}-${productId}`
      const productObject: any = {
        title,
        description,
        created: Date.now(),
        version: 1,
        images,
        mainImageIndex,
        type,
        price,
        // price: [{ currency: 'qort', value: 15 }],
        storeId,
        shortStoreId,
        id
      }
      const blogPostToBase64 = await objectToBase64(productObject)
      console.log({ imagePreviewFile })
      if (!currentStore) return
      const productResource = {
        identifier: id,
        title: 'Shoes',
        name,
        service: 'PRODUCT',
        filename: 'product.json',
        data64: blogPostToBase64
      }

      const productImagePreviewResource = {
        identifier: `q-store-product-${shortStoreId}-${productId}-image`,
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

  return (
    <Box
      sx={{
        display: 'flex'
      }}
    >
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
          <ProductForm onSubmit={addProduct} categories={[]} />
        </Box>
        <Button variant="contained" onClick={closeModal}>
          Close
        </Button>
      </ReusableModal>
    </Box>
  )
}
