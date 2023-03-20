import React from 'react'
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { checkStructure } from '../../utils/checkStructure';
import { BlogContent } from '../../interfaces/interfaces';


export const BlogIndividualPost = () => {
  const { user, postId, blog } = useParams();
  const { user: userState } = useSelector((state: RootState) => state.auth);
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

    if(!blogContent) return null
  
    return (
      <div className="App">
        {user === userState?.name && (
          <Button onClick={()=> {
            navigate(`/${user}/${blog}/${postId}/edit`)
          }}>Edit Post</Button>
        )}
        <p>{blogContent.title}</p>
      {blogContent?.postContent?.map((section: any)=> {
        if(section.type === 'editor'){
          return <ReadOnlySlate key={section.id} content={section.content}  />
        }
        if(section.type === 'image'){
          return <img src={section.content.image}  />
        }
       })}
      </div>
    );
}
