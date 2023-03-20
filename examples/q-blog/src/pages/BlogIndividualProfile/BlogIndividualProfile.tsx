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

export const BlogIndividualProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { blog, user: username } = useParams();
  const dispatch = useDispatch()
  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);

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
      let name = username

   
      if(!name) return
      if(!blog) return
      try {
        dispatch(setIsLoadingGlobal(true))
       const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=${blog}-post-&limit=20&name=${name}`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData =  await response.json()
      
        console.log({responseData})
for (const content of responseData) {
  if (content.name && content.identifier) {
    await getBlogPost(content.name, content.identifier, content);
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



    if(!currentBlog) return null
  return (
    <>
   <Typography variant="h1" color="textPrimary" sx={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
        {currentBlog.title}
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
