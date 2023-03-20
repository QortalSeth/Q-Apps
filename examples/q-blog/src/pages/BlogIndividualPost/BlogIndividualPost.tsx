import React from 'react'
import { useParams } from 'react-router-dom';
import { Button, Box, Typography, CardHeader, Avatar, } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/system';

import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { checkStructure } from '../../utils/checkStructure';
import { BlogContent } from '../../interfaces/interfaces';

const EllipsisTypography = styled(Typography)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;
export const BlogIndividualPost = () => {
  const { user, postId, blog } = useParams();
  const { user: userState } = useSelector((state: RootState) => state.auth);
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')

  const navigate = useNavigate();

   const [blogContent, setBlogContent] = React.useState<BlogContent | null>(null)
    

    const getBlogPost = React.useCallback(async()=> {
      try {
       const url=  `http://213.202.218.148:62391/arbitrary/BLOG_POST/${user}/${postId}`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        console.log({response})
        const responseData =  await response.json()
        if(checkStructure(responseData)){
          setBlogContent(responseData)
        }
      } catch (error) {
        
      }
    }, [user, postId])
    React.useEffect(()=> {
      getBlogPost()
    }, [])

    const getAvatar = React.useCallback(async ()=> {
      try {
        let url = await qortalRequest({
          action: "GET_QDN_RESOURCE_URL",
          name: user,
          service: "THUMBNAIL",
          identifier: "qortal_avatar"
        });
       
        console.log({url})
        setAvatarUrl(url)
      } catch (error) {
        
      }
    }, [user])
    React.useEffect(()=> {
      getAvatar()
    }, [])

    if(!blogContent) return null


  
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <Box sx={{
          maxWidth: '700px',
          margin: '15px'
        }}>
        {user === userState?.name && (
          <Button onClick={()=> {
            navigate(`/${user}/${blog}/${postId}/edit`)
          }}>Edit Post</Button>
        )}
           <CardHeader
        sx={{
          '& .MuiCardHeader-content': {
            overflow: 'hidden'
          },
         padding: '10px 0px'
        }}
        avatar={<Avatar src={avatarUrl} alt={`${user}'s avatar`} />}
     
        subheader={`Author: ${user}`}
      />
        <Typography variant="h1" color="textPrimary" sx={{
          textAlign: 'center'
        }}>
        {blogContent.title}
        </Typography>
     
 
      {blogContent?.postContent?.map((section: any)=> {
        if(section.type === 'editor'){
          return <ReadOnlySlate key={section.id} content={section.content}  />
        }
        if(section.type === 'image'){
          return <img src={section.content.image} className="post-image" />
        }
       })}
      </Box>
      </Box>
    );
}
