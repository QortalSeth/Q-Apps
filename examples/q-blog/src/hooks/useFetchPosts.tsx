import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addPosts,
  addToHashMap,
  BlogPost,
  upsertPosts
} from '../state/features/blogSlice'
import {
  setCurrentBlog,
  setIsLoadingGlobal
} from '../state/features/globalSlice'
import { RootState } from '../state/store'
import { fetchAndEvaluatePosts } from '../utils/fetchPosts'

export const useFetchPosts = () => {
  const dispatch = useDispatch()
  const hashMapPosts = useSelector(
    (state: RootState) => state.blog.hashMapPosts
  )
  const posts = useSelector((state: RootState) => state.blog.posts)
  const checkAndUpdatePost = React.useCallback(
    (post: BlogPost) => {
      // Check if the post exists in hashMapPosts
      console.log({ hashMapPosts })
      const existingPost = hashMapPosts[post.id]
      if (!existingPost) {
        // If the post doesn't exist, add it to hashMapPosts
        return true
      } else if (
        post?.updated &&
        existingPost?.updated &&
        (!existingPost?.updated || post?.updated) > existingPost?.updated
      ) {
        // If the post exists and its updated is more recent than the existing post's updated, update it in hashMapPosts
        return true
      } else {
        return false
      }
    },
    [hashMapPosts]
  )

  const getBlogPost = async (user: string, postId: string, content: any) => {
    const res = await fetchAndEvaluatePosts({
      user,
      postId,
      content
    })

    dispatch(addToHashMap(res))
  }

  const getBlogPosts = React.useCallback(async () => {
    try {
      console.log({ posts })
      const offset = posts.length
      console.log({ offset })
      dispatch(setIsLoadingGlobal(true))
      const url = `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=q-blog-&limit=20&includemetadata=true&offset=${offset}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      const structureData = responseData.map((post: any): BlogPost => {
        return {
          title: post?.metadata?.title,
          category: post?.metadata?.category,
          categoryName: post?.metadata?.categoryName,
          tags: post?.metadata?.tags || [],
          description: post?.metadata?.description,
          createdAt: '',
          user: post.name,
          postImage: '',
          id: post.identifier
        }
      })
      dispatch(upsertPosts(structureData))

      for (const content of structureData) {
        if (content.user && content.id) {
          const res = checkAndUpdatePost(content)
          console.log({ res })
          if (res) {
            getBlogPost(content.user, content.id, content)
          }
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [posts, hashMapPosts])
  return {
    getBlogPosts,
    checkAndUpdatePost,
    getBlogPost,
    hashMapPosts
  }
}
