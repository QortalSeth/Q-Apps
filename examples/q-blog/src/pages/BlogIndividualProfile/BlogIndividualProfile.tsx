import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { useParams } from 'react-router-dom'
import { List, ListItem, Typography, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import BlogPostPreview from '../BlogList/PostPreview'
import {
  setIsLoadingGlobal,
  setVisitingBlog,
  toggleEditBlogModal
} from '../../state/features/globalSlice'
import { BlogPost } from '../../state/features/blogSlice'
import { useFetchPosts } from '../../hooks/useFetchPosts'
import LazyLoad from '../../components/common/LazyLoad'
import { addPrefix, removePrefix } from '../../utils/blogIdformats'
export const BlogIndividualProfile = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentBlog } = useSelector((state: RootState) => state.global)

  const { blog: blogShortVersion, user: username } = useParams()
  const blog = React.useMemo(() => {
    if (!blogShortVersion) return ''
    return addPrefix(blogShortVersion)
  }, [blogShortVersion])
  const dispatch = useDispatch()
  const [userBlog, setUserBlog] = React.useState<any>(null)
  const { checkAndUpdatePost, getBlogPost, hashMapPosts } = useFetchPosts()

  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([])

  const getBlogPosts = React.useCallback(async () => {
    let name = username

    if (!name) return
    if (!blog) return

    try {
      dispatch(setIsLoadingGlobal(true))
      const offset = blogPosts.length
      const url = `/arbitrary/resources/search?service=BLOG_POST&query=${blog}-post-&limit=20&name=${name}&includemetadata=true&offset=${offset}&reverse=true`
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
      setBlogPosts(structureData)
      const copiedBlogPosts: BlogPost[] = [...blogPosts]
      structureData.forEach((post: BlogPost) => {
        const index = blogPosts.findIndex((p) => p.id === post.id)
        if (index !== -1) {
          copiedBlogPosts[index] = post
        } else {
          copiedBlogPosts.push(post)
        }
      })
      setBlogPosts(copiedBlogPosts)

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
  }, [username, blog, blogPosts])
  const getBlog = React.useCallback(async () => {
    let name = username

    if (!name) return
    if (!blog) return
    try {
      const urlBlog = `/arbitrary/BLOG/${name}/${blog}`
      const response = await fetch(urlBlog, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const responseData = await response.json()
      dispatch(setVisitingBlog({ ...responseData, name }))
      setUserBlog(responseData)
    } catch (error) {}
  }, [username, blog])

  React.useEffect(() => {
    getBlog()
  }, [username, blog])
  const getPosts = React.useCallback(async () => {
    await getBlogPosts()
  }, [getBlogPosts])
  console.log({ currentBlog })
  if (!userBlog) return null
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography
          variant="h1"
          color="textPrimary"
          sx={{
            textAlign: 'center',
            marginTop: '20px'
          }}
        >
          {currentBlog?.blogId === blog ? currentBlog?.title : userBlog.title}
        </Typography>
        {currentBlog?.blogId === blog && (
          <EditIcon
            sx={{
              cursor: 'pointer'
            }}
            onClick={() => {
              dispatch(toggleEditBlogModal(true))
            }}
          ></EditIcon>
        )}
      </Box>

      <List
        sx={{
          margin: '0px',
          padding: '10px',
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {blogPosts.map((post, index) => {
          const existingPost = hashMapPosts[post.id]
          let blogPost = post
          if (existingPost) {
            blogPost = existingPost
          }
          return (
            <ListItem
              onClick={() => {}}
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
                  const arr = str.split('-post-')
                  const str1 = arr[0]

                  const blogId = removePrefix(str1)
                  const str2 = arr[1]
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
            </ListItem>
          )
        })}
      </List>
      <LazyLoad onLoadMore={getPosts}></LazyLoad>
    </>
  )
}
