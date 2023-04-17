import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import EditIcon from '@mui/icons-material/Edit'
import { Box, List, ListItem } from '@mui/material'
import BlogPostPreview from './PostPreview'
import { useFetchPosts } from '../../hooks/useFetchPosts'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'
import Masonry from 'react-masonry-css'

const breakpointColumnsObj = {
  default: 5,
  1300: 4,
  940: 3,
  700: 2,
  500: 1
}
interface BlogListProps {
  mode?: string
}
export const BlogList = ({ mode }: BlogListProps) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const hashMapPosts = useSelector(
    (state: RootState) => state.blog.hashMapPosts
  )
  const favoritesLocal = useSelector(
    (state: RootState) => state.blog.favoritesLocal
  )
  const subscriptionPosts = useSelector(
    (state: RootState) => state.blog.subscriptionPosts
  )

  const { posts: globalPosts, favorites } = useSelector(
    (state: RootState) => state.blog
  )
  const navigate = useNavigate()
  const { getBlogPosts, getBlogPostsFavorites, getBlogPostsSubscriptions } =
    useFetchPosts()
  const getPosts = React.useCallback(async () => {
    if (mode === 'favorites') {
      getBlogPostsFavorites()
      return
    }
    if (mode === 'subscriptions' && user?.name) {
      getBlogPostsSubscriptions(user.name)
      return
    }
    await getBlogPosts()
  }, [getBlogPosts, mode, favoritesLocal, user?.name])

  let posts = globalPosts

  if (mode === 'favorites') {
    posts = favorites
  }
  if (mode === 'subscriptions') {
    posts = subscriptionPosts
  }
  // if (!favoritesLocal) return null
  return (
    <>
      {/* <List
        sx={{
          margin: '0px',
          padding: '10px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      > */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {posts.map((post, index) => {
          const existingPost = hashMapPosts[post.id]
          let blogPost = post
          if (existingPost) {
            blogPost = existingPost
          }
          return (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                width: 'auto',
                position: 'relative',
                ' @media (max-width: 450px)': {
                  width: '100%'
                }
              }}
              key={blogPost.id}
            >
              <BlogPostPreview
                onClick={() => {
                  const str = blogPost.id
                  const arr = str.split('-post-')
                  const str1 = arr[0]
                  const str2 = arr[1]
                  const blogId = removePrefix(str1)
                  navigate(`/${blogPost.user}/${blogId}/${str2}`)
                }}
                description={blogPost?.description}
                title={blogPost?.title}
                createdAt={blogPost?.createdAt}
                author={blogPost.user}
                postImage={blogPost?.postImage}
                blogPost={blogPost}
              />

              {blogPost.user === user?.name && (
                <EditIcon
                  className="edit-btn"
                  sx={{
                    position: 'absolute',
                    zIndex: 10,
                    bottom: '25px',
                    right: '25px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const str = blogPost.id
                    const arr = str.split('-post')
                    const str1 = arr[0]
                    navigate(`/${blogPost.user}/${str1}/${blogPost.id}/edit`)
                  }}
                />
              )}
            </Box>
          )
        })}
      </Masonry>
      {/* </List> */}
      <LazyLoad onLoadMore={getPosts}></LazyLoad>
    </>
  )
}
