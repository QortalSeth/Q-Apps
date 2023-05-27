import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { addUser } from '../state/features/authSlice'
import ShortUniqueId from 'short-unique-id'
import { RootState } from '../state/store'
import PublishBlogModal from '../components/modals/PublishBlogModal'
import EditBlogModal from '../components/modals/EditBlogModal'

import {
  setCurrentStore,
  setDataContainer,
  setIsLoadingGlobal,
  toggleEditBlogModal,
  togglePublishBlogModal
} from '../state/features/globalSlice'
import NavBar from '../components/layout/Navbar/Navbar'
import PageLoader from '../components/common/PageLoader'

import { setNotification } from '../state/features/notificationsSlice'
import localForage from 'localforage'
import ConsentModal from '../components/modals/ConsentModal'
import { objectToBase64 } from '../utils/toBase64'
import { Cart } from '../pages/ProductManager/Cart'

interface Props {
  children: React.ReactNode
}

const uid = new ShortUniqueId()

const GlobalWrapper: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [userAvatar, setUserAvatar] = useState<string>('')
  const [isOpenCart, setIsOpenCart] = useState<boolean>(false)
  const { user } = useSelector((state: RootState) => state.auth)
  const [hasAttemptedToFetchBlogInitial, setHasAttemptedToFetchBlogInitial] =
    useState(false)

  useEffect(() => {
    if (!user?.name) return

    getAvatar()
  }, [user?.name])

  const getAvatar = async () => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: user?.name,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })

      if (url === 'Resource does not exist') return

      setUserAvatar(url)
    } catch (error) {
      console.error(error)
    }
  }

  const {
    isOpenPublishBlogModal,
    currentStore,
    isLoadingGlobal,
    isOpenEditBlogModal
  } = useSelector((state: RootState) => state.global)

  async function getNameInfo(address: string) {
    const response = await fetch('/names/address/' + address)
    const nameData = await response.json()

    if (nameData?.length > 0) {
      return nameData[0].name
    } else {
      return ''
    }
  }

  async function verifyIfBlogIdExtists(username: string, identifier: string) {
    let doesExist = true
    //TODO - SHOULD REMOVE NAME FILTER AND IDENTIFIER SHOULD BE EXACT
    // const url2 = `http://62.141.38.192:62391/arbitrary/resources/search?service=BLOG&identifier=${identifier}&name=${username}&limit=1&includemetadata=true`
    const url2 = `http://62.141.38.192:62391/arbitrary/resources?service=BLOG&identifier=${identifier}&name=${username}&limit=1&includemetadata=true`
    const responseBlogs = await fetch(url2, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const dataMetadata = await responseBlogs.json()
    // const url = `http://62.141.38.192:62391/arbitrary/metadata/BLOG/${username}/${identifier}}`
    // const responseBlogs = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    // const responseDataBlogs = await responseBlogs.json()
    if (dataMetadata.length === 0) {
      doesExist = false
    }

    return doesExist
  }
  async function getStore(name: string) {
    //TODO NAME SHOULD BE EXACT
    const url = `http://62.141.38.192:62391/arbitrary/resources/search?service=STORE&identifier=q-store-general-&exactmatchnames=true&name=${name}&prefix=true&limit=20&includemetadata=true`
    const responseBlogs = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const responseDataBlogs = await responseBlogs.json()
    const filterOut = responseDataBlogs.filter((blog: any) =>
      blog.identifier.startsWith('q-store-general-')
    )
    let blog
    if (filterOut.length === 0) return
    if (filterOut.length !== 0) {
      blog = filterOut[0]
    }
    const urlBlog = `http://62.141.38.192:62391/arbitrary/STORE/${blog.name}/${blog.identifier}`
    const response = await fetch(urlBlog, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const responseData = await response.json()

    const urlDataContainer = `http://62.141.38.192:62391/arbitrary/DOCUMENT/${blog.name}/${blog.identifier}-datacontainer`
    const response2 = await fetch(urlDataContainer, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const responseData2 = await response2.json()

    dispatch(
      setCurrentStore({
        created: responseData?.created || '',
        id: blog.identifier,
        title: responseData?.title || '',
        location: responseData?.location,
        shipsTo: responseData?.shipsTo,
        description: responseData?.description || '',
        category: blog.metadata?.category,
        tags: blog.metadata?.tags || []
      })
    )
    console.log({ responseData2 })
    if (responseData2 && !responseData2.error) {
      dispatch(setDataContainer(responseData2))
    } else {
      const parts = blog.identifier.split('q-store-general-')
      const shortStoreId = parts[1]
      const dataContainer = {
        storeId: blog.identifier,
        shortStoreId: shortStoreId,
        owner: blog.name,
        products: {}
      }
      const dataContainerToBase64 = await objectToBase64(dataContainer)

      const resourceResponse2 = await qortalRequest({
        action: 'PUBLISH_QDN_RESOURCE',
        name: blog.name,
        service: 'DOCUMENT',
        data64: dataContainerToBase64,
        identifier: `${blog.identifier}-datacontainer`
      })
    }
    // const response = await fetch("/names/address/" + address);
    // const nameData = await response.json();

    //   if (nameData?.length > 0 ) {
    //       return nameData[0].name;
    //   } else {
    //       return '';
    //   }
  }

  const askForAccountInformation = React.useCallback(async () => {
    try {
      let account = await qortalRequest({
        action: 'GET_USER_ACCOUNT'
      })

      const name = await getNameInfo(account.address)
      dispatch(addUser({ ...account, name }))

      const blog = await getStore(name)
      setHasAttemptedToFetchBlogInitial(true)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const createStore = React.useCallback(
    async (
      title: string,
      description: string,
      category: string,
      tags: string[],
      blogIdentifier: string
    ) => {
      if (!user || !user.name)
        throw new Error('Cannot publish: You do not have a Qortal name')
      if (!title) throw new Error('A title is required')
      if (!description) throw new Error('A description is required')
      const name = user.name
      const id = uid()
      let formatBlogIdentifier = blogIdentifier
      if (formatBlogIdentifier.endsWith('-')) {
        formatBlogIdentifier = formatBlogIdentifier.slice(0, -1)
      }
      if (formatBlogIdentifier.startsWith('-')) {
        formatBlogIdentifier = formatBlogIdentifier.slice(1)
      }
      if (!formatBlogIdentifier) {
        throw new Error('Please insert a valid store id')
      }
      const identifier = `q-store-general-${formatBlogIdentifier}`
      const doesExitst = await verifyIfBlogIdExtists(name, identifier)
      if (doesExitst) {
        throw new Error('The store identifier already exists')
      }

      const formattedTags: { [key: string]: string } = {}
      tags.forEach((tag: string, i: number) => {
        formattedTags[`tag${i + 1}`] = tag
      })

      const blogobj = {
        title: 'My Store',
        description: 'This is a description of my store',
        location: 'Canada',
        shipsTo: 'Worldwide',
        created: Date.now(),
        shortStoreId: formatBlogIdentifier
      }
      const dataContainer = {
        storeId: identifier,
        shortStoreId: formatBlogIdentifier,
        owner: name,
        products: {}
      }
      const blogPostToBase64 = await objectToBase64(blogobj)
      const dataContainerToBase64 = await objectToBase64(dataContainer)
      try {
        const resourceResponse = await qortalRequest({
          action: 'PUBLISH_QDN_RESOURCE',
          name: name,
          service: 'STORE',
          data64: blogPostToBase64,
          title,
          description,
          category,
          identifier: identifier,
          ...formattedTags
        })
        const resourceResponse2 = await qortalRequest({
          action: 'PUBLISH_QDN_RESOURCE',
          name: name,
          service: 'DOCUMENT',
          data64: dataContainerToBase64,
          identifier: `${identifier}-datacontainer`
        })
        // navigate(`/${user.name}/${identifier}`)
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res()
          }, 1000)
        })

        const blogfullObj = {
          ...blogobj,
          blogId: identifier,
          category,
          tags
        }

        dispatch(setCurrentStore(blogfullObj))
        dispatch(setDataContainer(dataContainer))
        // getStore(name)
        dispatch(
          setNotification({
            msg: 'Store successfully created',
            alertType: 'success'
          })
        )
      } catch (error: any) {
        let notificationObj: any = null
        if (typeof error === 'string') {
          notificationObj = {
            msg: error || 'Failed to create store',
            alertType: 'error'
          }
        } else if (typeof error?.error === 'string') {
          notificationObj = {
            msg: error?.error || 'Failed to create store',
            alertType: 'error'
          }
        } else {
          notificationObj = {
            msg: error?.message || 'Failed to create store',
            alertType: 'error'
          }
        }
        if (!notificationObj) return
        dispatch(setNotification(notificationObj))
        if (error instanceof Error) {
          throw new Error(error.message)
        } else {
          throw new Error('An unknown error occurred')
        }
      }
    },
    [user]
  )

  React.useEffect(() => {
    askForAccountInformation()
  }, [])

  const onClosePublishBlogModal = React.useCallback(() => {
    dispatch(togglePublishBlogModal(false))
  }, [])
  const onCloseEditBlogModal = React.useCallback(() => {
    dispatch(toggleEditBlogModal(false))
  }, [])

  return (
    <>
      {isLoadingGlobal && <PageLoader />}

      {isOpenPublishBlogModal && user?.name && (
        <PublishBlogModal
          open={isOpenPublishBlogModal}
          onClose={onClosePublishBlogModal}
          onPublish={createStore}
          username={user?.name || ''}
        />
      )}

      {/* <EditBlogModal
        open={isOpenEditBlogModal}
        onClose={onCloseEditBlogModal}
        onPublish={()=> {}}
        currentBlog={currentStore}
      /> */}
      <NavBar
        isAuthenticated={!!user?.name}
        hasBlog={!!currentStore}
        userName={user?.name || ''}
        userAvatar={userAvatar}
        blog={currentStore}
        authenticate={askForAccountInformation}
        hasAttemptedToFetchBlogInitial={hasAttemptedToFetchBlogInitial}
      />
      <ConsentModal />
      <Cart />
      {children}
    </>
  )
}

export default GlobalWrapper
