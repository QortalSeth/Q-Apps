import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import EditIcon from '@mui/icons-material/Edit'
import { List, ListItem } from '@mui/material'
import BlogPostPreview from './PostPreview'
import { useFetchPosts } from '../../hooks/useFetchPosts'
import LazyLoad from '../../components/common/LazyLoad'
import { removePrefix } from '../../utils/blogIdformats'

export const BlogList = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const hashMapPosts = useSelector(
    (state: RootState) => state.blog.hashMapPosts
  )
  const { posts } = useSelector((state: RootState) => state.blog)
  const navigate = useNavigate()
  const { getBlogPosts } = useFetchPosts()
  const getPosts = React.useCallback(async () => {
    await getBlogPosts()
  }, [getBlogPosts])

  return (
    <>
      <List
        sx={{
          margin: '0px',
          padding: '10px',
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {posts.map((post, index) => {
          const existingPost = hashMapPosts[post.id]
          let blogPost = post
          if (existingPost) {
            blogPost = existingPost
          }
          return (
            <ListItem
              disablePadding
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                width: 'auto',
                position: 'relative'
              }}
              key={blogPost.id}
            >
              <BlogPostPreview
                onClick={() => {
                  const str = blogPost.id
                  const arr = str.split('-post')
                  const str1 = arr[0]
                  const blogId = removePrefix(str1)
                  navigate(`/${blogPost.user}/${blogId}/${blogPost.id}`)
                }}
                description={blogPost?.description}
                title={blogPost?.title}
                createdAt={blogPost?.createdAt}
                author={blogPost.user}
                postImage={blogPost?.postImage}
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
            </ListItem>
          )
        })}
      </List>
      <LazyLoad onLoadMore={getPosts}></LazyLoad>
    </>
  )
}
