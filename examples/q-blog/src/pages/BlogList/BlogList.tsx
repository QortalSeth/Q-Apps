import Button from '@mui/material/Button';
import React from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Tooltip,
  Popover,
  List,
  ListItem,
  Typography,
  IconButton,
} from "@mui/material";
import { setIsLoadingGlobal, togglePublishBlogModal } from '../../state/features/globalSlice';
import BlogPostPreview from './PostPreview';
import { checkStructure } from '../../utils/checkStructure';
import { addPosts, BlogPost, removePost, updatePost } from '../../state/features/blogSlice';
import MyWorker from '../../webworkers/getBlogWorker?worker'


export const BlogList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);
  const { posts } = useSelector((state: RootState) => state.blog);

  const dispatch = useDispatch();

    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = React.useState<any[]>([])
    
   React.useEffect(()=> {
    const worker = new MyWorker()
    worker.postMessage([1,2,3])

worker.onmessage = (event: MessageEvent) => {
  console.log(event.data)
}
    console.log({worker})
   }, [])
   const getBlogPost = (user: string, postId: string, content: any)=> {
    const worker = new MyWorker()
    worker.postMessage({user, postId, content})

worker.onmessage = (event: MessageEvent) => {
  console.log('worker return', event.data)
  if(event.data.remove && event.data.id) 
  {
    dispatch(removePost(event.data.id))
    return
  }
  dispatch(updatePost(event.data))
}
   }
   

    const getBlogPosts = React.useCallback(async()=> {
      try {
        dispatch(setIsLoadingGlobal(true))
       const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=q-blog-&limit=20&includemetadata=true`
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
        dispatch(addPosts(structureData))

for (const content of responseData) {
  if (content.name && content.identifier) {
     getBlogPost(content.name, content.identifier, content);
  }
}
      } catch (error) {
        
      }
      finally {
        dispatch(setIsLoadingGlobal(false))
      }
    }, [])
    React.useEffect(()=> {
      getBlogPosts()
    }, [])
console.log({blogPosts})

  return (
    <>
  
      <List sx={{ margin: "0px", padding: "10px", display: "flex", flexWrap: 'wrap'  }}>
                        {posts.map((blogPost, index) => (
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
                              }} description={blogPost?.description} title={blogPost?.title}  createdAt={blogPost?.createdAt} author={blogPost.user}  postImage={blogPost?.postImage} />
                                 
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
