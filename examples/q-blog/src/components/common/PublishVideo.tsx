import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setNotification } from '../../state/features/notificationsSlice'
import { RootState } from '../../state/store'
import ShortUniqueId from 'short-unique-id'

const uid = new ShortUniqueId()

interface IPublishVideo {
  title: string
  description: string
  base64: string
}

export const usePublishVideo = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const publishVideo = async ({
    title,
    description,
    base64
  }: IPublishVideo) => {
    let address
    let name
    let errorMsg = ''

    address = user?.address
    name = user?.name || ''

    const missingFields = []
    if (!address) {
      errorMsg = "Cannot post: your address isn't available"
    }
    if (!name) {
      errorMsg = 'Cannot post without a name'
    }
    if (!title) missingFields.push('title')
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
      return
    }

    try {
      const id = uid()

      const identifier = `q-blog-video-${id}`

      const resourceResponse = await qortalRequest({
        action: 'PUBLISH_QDN_RESOURCE',
        name: name,
        service: 'VIDEO',
        data64: base64,
        title: title,
        description: description,
        category: 'TECHNOLOGY',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        identifier: identifier
      })
      dispatch(
        setNotification({
          msg: 'Video successfully published',
          alertType: 'success'
        })
      )
      return resourceResponse
    } catch (error: any) {
      dispatch(
        setNotification({
          msg: error?.message || 'Failed to publish post',
          alertType: 'error'
        })
      )
    }
  }
  return {
    publishVideo
  }
}
