import Button from '@mui/material/Button';
import React from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import { useParams } from 'react-router-dom';
import { checkStructure } from '../../utils/checkStructure';
import { BlogContent } from '../../interfaces/interfaces';
import {
  Box,
  Tooltip,
  Popover,
  List,
  ListItem,
  Typography,
  IconButton,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import BlogPostPreview from '../BlogList/PostPreview';
import { setIsLoadingGlobal } from '../../state/features/globalSlice';
import { BlogPost } from '../../state/features/blogSlice';
import MyWorker from '../../webworkers/getBlogWorker?worker'
export const BlogIndividualProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { blog, user: username } = useParams();
  const dispatch = useDispatch()
  const [userBlog, setUserBlog] = React.useState<any>(null)
    const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([])

   const removePost = (id: string) => {

      setBlogPosts((prev)=> {
        return prev.filter((item) => item.id !== id);
      })
    }
  const  updatePost = (payload: BlogPost) => {
    const {id} = payload
    setBlogPosts((prev)=> {
      const posts = [...prev]
      const index = posts.findIndex(post => post.id === id);
      if (index !== -1) {
        posts[index] = { ...payload};
        return posts
      } else return prev
    })
    
   
    }
    const getBlogPost = (user: string, postId: string, content: any)=> {
      const worker = new MyWorker()
      worker.postMessage({user, postId, content})
  
  worker.onmessage = (event: MessageEvent) => {
    if(event.data.remove && event.data.id) 
    {
      removePost(event.data.id)
      return
    }
    updatePost(event.data)
  }
     }
 

    // const getBlogPost = React.useCallback(async(user: string, postId: string, content: any)=> {
    //   try {
    //    const url=  `http://213.202.218.148:62391/arbitrary/BLOG_POST/${user}/${postId}`
    //      const response = await fetch(url, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     })
     
    //     const responseData =  await response.json()
    //     if(checkStructure(responseData)){
    //       const findImage = responseData.postContent.find((data: any)=> data?.type === 'image')
    //       const findText = responseData.postContent.find((data: any)=> data?.type === 'editor')
    //       setBlogPosts((prev)=> [...prev, {content: responseData.postContent, ...content, user, title: responseData.title, createdAt: responseData.createdAt, postId, blogImage: findImage, description: findText}])
    //     }
    //     return {
    //       ...responseData,
    //       user,
    //       postId
    //     }
    //   } catch (error) {
        
    //   }
    // }, [])

    const getBlogPosts = React.useCallback(async()=> {
      let name = username

   
      if(!name) return
      if(!blog) return
      try {
        const urlBlog=  `http://213.202.218.148:62391/arbitrary/BLOG/${name}/${blog}`
        const response = await fetch(urlBlog, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json'
         }
       })
       const responseData =  await response.json()
       setUserBlog(responseData)
      } catch (error) {
        
      }
     
      try {
        dispatch(setIsLoadingGlobal(true))
       const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=${blog}-post-&limit=20&name=${name}&includemetadata=true`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData =  await response.json()
      
        const structureData = responseData.map((post:any ) : BlogPost=>  {
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
for (const content of responseData) {
  if (content.name && content.identifier) {
     getBlogPost(content.name, content.identifier, content);
  }
}
      } catch (error) {
        
      } finally {
        dispatch(setIsLoadingGlobal(false))
      }
    }, [username, blog])



    React.useEffect(()=> {
      getBlogPosts()
    }, [])



    if(!userBlog) return null
  return (
    <>
   <Typography variant="h1" color="textPrimary" sx={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
        {userBlog.title}
        </Typography>
 
     <List sx={{ margin: "0px", padding: "10px", display: "flex", flexWrap: 'wrap'  }}>
                        {blogPosts.map((blogPost, index) => (
                            <ListItem
                            onClick={()=> {
                        


                            
                             }}
                                disablePadding
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                    width: "auto",
                                    position: 'relative'
                                }}
                                key={blogPost.id}
                            >
                              <BlogPostPreview onClick={()=> {
                                      const str = blogPost.id
                                      const arr = str.split("-post");
                                      const str1 = arr[0];
                                  navigate(`/${blogPost.user}/${str1}/${blogPost.id}`)
                              }} description={blogPost?.description} title={blogPost?.title}  createdAt={blogPost?.createdAt} author={blogPost.user}   postImage={blogPost?.postImage} />
                                 
       {blogPost.user === user?.name && (
        <EditIcon className="edit-btn" sx={{
          position: 'absolute',
          zIndex: 10,
          bottom: '25px',
          right:  '25px',
          cursor: 'pointer'
        }} onClick={
          ()=> {
            const str = blogPost.id
  const arr = str.split("-post");
  const str1 = arr[0];
            navigate(`/${blogPost.user}/${str1}/${blogPost.id}/edit`)
          }
        } />
       )}
      
                            </ListItem>
                        ))}
                    </List>
    </>
   
  )
}
