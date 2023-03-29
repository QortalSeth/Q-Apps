import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

import {
  addUser
} from '../state/features/authSlice';
import ShortUniqueId from 'short-unique-id';
import { RootState } from "../state/store";
import PublishBlogModal from '../components/modals/PublishBlogModal';
import EditBlogModal from '../components/modals/EditBlogModal'

import {
  setCurrentBlog,
  setIsLoadingGlobal,
  toggleEditBlogModal,
  togglePublishBlogModal
} from '../state/features/globalSlice'
import NavBar from '../components/layout/Navbar/Navbar'
import PageLoader from '../components/common/PageLoader'
import { fetchAndEvaluatePosts } from '../utils/fetchPosts'
import { addPosts, addToHashMap, BlogPost } from '../state/features/blogSlice'
import { useFetchPosts } from '../hooks/useFetchPosts'
import { setNotification } from '../state/features/notificationsSlice'

interface Props {
  children: React.ReactNode
}

const uid = new ShortUniqueId()

const GlobalWrapper: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { getBlogPosts } = useFetchPosts()

  const {
    isOpenPublishBlogModal,
    currentBlog,
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
  async function getBlog(name: string) {
    const url = `/arbitrary/resources/search?service=BLOG&identifier=q-blog-&name=${name}&prefix=true&limit=20&includemetadata=true`
    const responseBlogs = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const responseDataBlogs = await responseBlogs.json()
    const filterOut = responseDataBlogs.filter(
      (blog: any) => blog.identifier.split('-').length === 3
    )
    let blog
    if (filterOut.length === 0) return
    if (filterOut.length !== 0) {
      blog = filterOut[0]
    }
    const urlBlog = `/arbitrary/BLOG/${blog.name}/${blog.identifier}`
    const response = await fetch(urlBlog, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const responseData = await response.json()
    console.log({ responseData })
    dispatch(
      setCurrentBlog({
        createdAt: responseData?.createdAt || '',
        blogId: blog.identifier,
        title: responseData?.title || '',
        description: responseData?.description || '',
        blogImage: responseData?.blogImage || '',
        category: blog.metadata?.category,
        tags: blog.metadata?.tags || []
      })
    )
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

      const blog = await getBlog(name)
    } catch (error) {
      console.error(error)
    }
  }, [])
  function objectToBase64(obj: any) {
    // Step 1: Convert the object to a JSON string
    const jsonString = JSON.stringify(obj)

    // Step 2: Convert the JSON string to a Uint8Array of bytes
    const utf8Encoder = new TextEncoder()
    const uint8Array = utf8Encoder.encode(jsonString)

    // Step 3: Convert the Uint8Array to a base64-encoded string
    let base64 = ''

    // For browsers
    const numberArray = Array.from(uint8Array) // Convert Uint8Array to a regular array
    const binaryString = String.fromCharCode.apply(null, numberArray)
    base64 = btoa(binaryString)

    return base64
  }

  const createBlog = React.useCallback(
    async (
      title: string,
      description: string,
      category: string,
      tags: string[]
    ) => {
      if (!user || !user.name)
        throw new Error('Cannot publish: You do not have a Qortal name')
      if (!title) throw new Error('A title is required')
      if (!description) throw new Error('A description is required')
      const name = user.name
      const id = uid()
      const identifier = `q-blog-${id}`
      const formattedTags: { [key: string]: string } = {}
      tags.forEach((tag: string, i: number) => {
        console.log({ tag })
        formattedTags[`tag${i + 1}`] = tag
      })
      const blogPostToBase64 = objectToBase64({
        title,
        description,
        blogImage: '',
        createdAt: Date.now()
      })
      try {
        const resourceResponse = await qortalRequest({
          action: 'PUBLISH_QDN_RESOURCE',
          name: name,
          service: 'BLOG',
          data64: blogPostToBase64,
          title,
          description,
          category,
          identifier: identifier,
          ...formattedTags
        })
        // navigate(`/${user.name}/${identifier}`)
        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res()
          }, 1000)
        })

        getBlog(name)
        dispatch(
          setNotification({
            msg: 'Blog successfully created',
            alertType: 'success'
          })
        )
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message)
        } else {
          throw new Error('An unknown error occurred')
        }
      }
    },
    [user]
  )

  const editBlog = React.useCallback(
    async (
      title: string,
      description: string,
      category: string,
      tags: string[]
    ) => {
      if (!user || !user.name)
        throw new Error('Cannot update: your Qortal name is not accessible')

      if (!currentBlog)
        throw new Error('Your blog is not available. Refresh and try again.')
      if (!title) throw new Error('A title is required')
      if (!description) throw new Error('A description is required')
      const name = user.name
      const formattedTags: { [key: string]: string } = {}
      tags.forEach((tag: string, i: number) => {
        console.log({ tag })
        formattedTags[`tag${i + 1}`] = tag
      })
      const blogPostToBase64 = objectToBase64({
        ...currentBlog,
        title,
        description
      })
      try {
        const resourceResponse = await qortalRequest({
          action: 'PUBLISH_QDN_RESOURCE',
          name: name,
          service: 'BLOG',
          data64: blogPostToBase64,
          title,
          description,
          category,
          ...formattedTags,
          identifier: currentBlog.blogId
        })

        await new Promise<void>((res, rej) => {
          setTimeout(() => {
            res()
          }, 1000)
        })

        getBlog(name)
        dispatch(
          setNotification({
            msg: 'Blog successfully updated',
            alertType: 'success'
          })
        )
        console.log({ resourceResponse })
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message)
        } else {
          throw new Error('An unknown error occurred')
        }
      }
    },
    [user, currentBlog]
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
  // const getBlogPost = async (user: string, postId: string, content: any)=> {
  //   const res = await  fetchAndEvaluatePosts({
  //       user, postId, content
  //     })

  //   if(res.remove && res.id)
  //   {
  //     // dispatch(removePost(res.id))
  //     return
  //   }
  //   dispatch(addToHashMap(res))
  //   // dispatch(updatePost(res))

  //    }

  //     const getBlogPosts = React.useCallback(async()=> {
  //       try {
  //         dispatch(setIsLoadingGlobal(true))
  //        const url=  `/arbitrary/resources/search?service=BLOG_POST&query=q-blog-&limit=20&includemetadata=true`
  //          const response = await fetch(url, {
  //           method: 'GET',
  //           headers: {
  //             'Content-Type': 'application/json'
  //           }
  //         })
  //         const responseData =  await response.json()
  //         const structureData = responseData.map((post:any ) : BlogPost=>  {
  //           return {
  //             title: post?.metadata?.title,
  //             category: post?.metadata?.category,
  // categoryName: post?.metadata?.categoryName,
  // tags: post?.metadata?.tags || [],
  //   description: post?.metadata?.description,
  //   createdAt: '',
  //   user: post.name,
  //   postImage: '',
  //   id: post.identifier
  //           }
  //         })
  //         dispatch(addPosts(structureData))

  // for (const content of responseData) {
  //   if (content.name && content.identifier) {
  //      getBlogPost(content.name, content.identifier, content);
  //   }
  // }
  //       } catch (error) {

  //       }
  //       finally {
  //         dispatch(setIsLoadingGlobal(false))
  //       }
  //     }, [])
  // React.useEffect(()=> {
  //   getBlogPosts()
  // }, [])
  return (
    <>
      {isLoadingGlobal && <PageLoader />}

      <PublishBlogModal
        open={isOpenPublishBlogModal}
        onClose={onClosePublishBlogModal}
        onPublish={createBlog}
      />
      <EditBlogModal
        open={isOpenEditBlogModal}
        onClose={onCloseEditBlogModal}
        onPublish={editBlog}
        currentBlog={currentBlog}
      />
      <NavBar
        isAuthenticated={!!user}
        hasBlog={!!currentBlog}
        userName={user?.name || ''}
        userAvatar=""
        blog={currentBlog}
        authenticate={askForAccountInformation}
      />
      {children}
    </>
  )
}

export default GlobalWrapper;