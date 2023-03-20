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
import { togglePublishBlogModal } from '../../state/features/globalSlice';
import BlogPostPreview from './PostPreview';
import { checkStructure } from '../../utils/checkStructure';

export const BlogList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);

  const dispatch = useDispatch();

    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = React.useState<any[]>([])
    
   

    const getBlogPost = React.useCallback(async(user: string, postId: string, content: any)=> {
      try {
       const url=  `http://213.202.218.148:62391/arbitrary/BLOG_POST/${user}/${postId}`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
     
        const responseData =  await response.json()
        if(checkStructure(responseData)){
          const findImage = responseData.postContent.find((data: any)=> data?.type === 'image')
          const findText = responseData.postContent.find((data: any)=> data?.type === 'editor')
          setBlogPosts((prev)=> [...prev, {content: responseData.postContent, ...content, user, title: responseData.title, createdAt: responseData.createdAt, postId, blogImage: findImage, description: findText}])
        }
        return {
          ...responseData,
          user,
          postId
        }
      } catch (error) {
        
      }
    }, [])

    const getBlogPosts = React.useCallback(async()=> {
      try {
       const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=q-blog-&limit=20&includemetadata=true`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData =  await response.json()
      

for (const content of responseData) {
  if (content.name && content.identifier) {
    await getBlogPost(content.name, content.identifier, content);
  }
}
      } catch (error) {
        
      }
    }, [])
    React.useEffect(()=> {
      getBlogPosts()
    }, [])
console.log({blogPosts})

  return (
    <>
  
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
                                key={blogPost.postId}
                            >
                              <BlogPostPreview onClick={()=> {
                                      const str = blogPost.postId
                                      const arr = str.split("-post");
                                      const str1 = arr[0];
                                  navigate(`/${blogPost.user}/${str1}/${blogPost.postId}`)
                              }} description={blogPost?.description?.content} title={blogPost?.title}  createdAt={blogPost?.createdAt} author={blogPost.user} authorAvatar=""  postImage={blogPost?.blogImage?.content?.image} />
                                 
       {blogPost.user === user?.name && (
        <EditIcon className="edit-btn" sx={{
          position: 'absolute',
          zIndex: 10,
          bottom: '25px',
          right:  '25px',
          cursor: 'pointer'
        }} onClick={
          ()=> {
            const str = blogPost.postId
  const arr = str.split("-post");
  const str1 = arr[0];
            navigate(`/${blogPost.user}/${str1}/${blogPost.postId}/edit`)
          }
        } />
       )}
      
                            </ListItem>
                        ))}
                    </List>
     
     
  
    </>
   
  )
}
