import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addToHashMap,
  BlogPost,
  populateFavorites,
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
  const favoritesLocal = useSelector(
    (state: RootState) => state.blog.favoritesLocal
  )
  const favorites = useSelector((state: RootState) => state.blog.favorites)

  const checkAndUpdatePost = React.useCallback(
    (post: BlogPost) => {
      // Check if the post exists in hashMapPosts
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
      const url = `/arbitrary/resources/search?service=BLOG_POST&query=q-blog-&limit=20&includemetadata=true&offset=${offset}&reverse=true`
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
  const getBlogPostsFavorites = React.useCallback(async () => {
    try {
      console.log({ posts, favoritesLocal })
      const offset = favorites.length
      console.log({ offset, favoritesLocal })
      const favSlice = (favoritesLocal || []).slice(offset, 20)
      console.log({ favSlice })
      let favs = []
      for (const item of favSlice) {
        try {
          //   await qortalRequest({
          //     action: "SEARCH_QDN_RESOURCES",
          //     service: "THUMBNAIL",
          //     query: "search query goes here", // Optional - searches both "identifier" and "name" fields
          //     identifier: "search query goes here", // Optional - searches only the "identifier" field
          //     name: "search query goes here", // Optional - searches only the "name" field
          //     prefix: false, // Optional - if true, only the beginning of fields are matched in all of the above filters
          //     default: false, // Optional - if true, only resources without identifiers are returned
          //     includeStatus: false, // Optional - will take time to respond, so only request if necessary
          //     includeMetadata: false, // Optional - will take time to respond, so only request if necessary
          //     limit: 100,
          //     offset: 0,
          //     reverse: true
          // });
          const url = `/arbitrary/resources/search?service=BLOG_POST&identifier=${item.id}&name=${item.user}&limit=20&includemetadata=true&reverse=true`
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          const data = await response.json()
          //
          console.log({ data })
          if (data.length > 0) {
            favs.push(data[0])
          }
        } catch (error) {}
      }
      console.log({ favs })
      const structureData = favs.map((post: any): BlogPost => {
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
      dispatch(populateFavorites(structureData))

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
    }
  }, [hashMapPosts, favoritesLocal])
  return {
    getBlogPosts,
    getBlogPostsFavorites,
    checkAndUpdatePost,
    getBlogPost,
    hashMapPosts
  }
}
