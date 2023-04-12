import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { addUser } from '../state/features/authSlice'
import ShortUniqueId from 'short-unique-id'
import { RootState } from '../state/store'
import PublishBlogModal from '../components/modals/PublishBlogModal'
import EditBlogModal from '../components/modals/EditBlogModal'

import {
  setAddToDownloads,
  setCurrentBlog,
  setIsLoadingGlobal,
  toggleEditBlogModal,
  togglePublishBlogModal,
  updateDownloads
} from '../state/features/globalSlice'

import { useFetchPosts } from '../hooks/useFetchPosts'
import { setNotification } from '../state/features/notificationsSlice'
import { DownloadTaskManager } from '../components/common/DownloadTaskManager'

interface Props {
  children: React.ReactNode
}

const uid = new ShortUniqueId()

const defaultValues: MyContextInterface = {
  downloadVideo: () => {}
}
interface IDownloadVideoParams {
  name: string
  service: string
  identifier: string
  blogPost: any
}
interface MyContextInterface {
  downloadVideo: ({
    name,
    service,
    identifier,
    blogPost
  }: IDownloadVideoParams) => void
}
export const MyContext = React.createContext<MyContextInterface>(defaultValues)

const DownloadWrapper: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { audios, currAudio } = useSelector((state: RootState) => state.global)
  const { getBlogPosts } = useFetchPosts()
  const { downloads, currentBlog, isLoadingGlobal, isOpenEditBlogModal } =
    useSelector((state: RootState) => state.global)

  const addToPile = async ({
    name,
    service,
    identifier,
    blogPost
  }: IDownloadVideoParams) => {
    try {
      const res = await qortalRequest({
        action: 'GET_QDN_RESOURCE_STATUS',
        name: name,
        service: service,
        identifier: identifier
      })
      if (
        res?.status === 'READY' ||
        (res.percentLoaded > 75 && res.totalChunkCount < 100)
      ) {
        return false
      }
    } catch (error) {}
  }

  const performDownload = ({
    name,
    service,
    identifier,
    blogPost
  }: IDownloadVideoParams) => {
    dispatch(
      setAddToDownloads({
        name,
        service,
        identifier,
        blogPost
      })
    )

    const url = `/arbitrary/${service}/${name}/${identifier}`
    let isCalling = false
    const intervalId = setInterval(async () => {
      if (isCalling) return
      isCalling = true
      const res = await qortalRequest({
        action: 'GET_QDN_RESOURCE_STATUS',
        name: name,
        service: service,
        identifier: identifier
      })
      isCalling = false
      if (res.localChunkCount) {
        dispatch(
          updateDownloads({
            name,
            service,
            identifier,
            status: res
          })
        )
      }

      // check if progress is 100% and clear interval if true
      if (res?.status === 'READY') {
        clearInterval(intervalId)
      }
    }, 1000) // 1 second interval
    console.log('hello before')
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        console.log('hello after')
        const url = URL.createObjectURL(blob)
        console.log({ url })
        dispatch(
          updateDownloads({
            name,
            service,
            identifier,
            url
          })
        )
      })
      .catch((error) => {
        console.error('Error fetching the video:', error)
        // clearInterval(intervalId)
      })
  }

  const downloadVideo = async ({
    name,
    service,
    identifier,
    blogPost
  }: IDownloadVideoParams) => {
    try {
      // if (downloads.length > 3) return 'continue'
      // const willAdd = await addToPile({ name, service, identifier })
      // if (willAdd === false) return 'continue'

      performDownload({
        name,
        service,
        identifier,
        blogPost
      })
      return 'addedToList'
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <MyContext.Provider value={{ downloadVideo }}>
        <DownloadTaskManager />
        {children}
      </MyContext.Provider>
    </>
  )
}

export default DownloadWrapper
