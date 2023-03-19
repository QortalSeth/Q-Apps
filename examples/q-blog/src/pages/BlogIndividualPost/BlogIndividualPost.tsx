import React from 'react'
import { useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
export const BlogIndividualPost = () => {
  const { user, postId, blog } = useParams();
  const { user: userState } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

   const [blogContent, setBlogContent] = React.useState([])
    const checkStructure = (content: any)=> {
      console.log({content})
      let isValid = true
      if(!Array.isArray(content))  isValid = false

      content.forEach((c : any)=> {
        if(!c.type || !c.version || !c.id || !c.content) return isValid = false
        if(c.version === 1){
          if(c.type !== 'editor' && c.type !== 'image') return isValid = false
        }
      })
      console.log({isValid})
      return isValid
    }

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
  
    return (
      <div className="App">
        {user === userState?.name && (
          <Button onClick={()=> {
            navigate(`/${user}/${blog}/${postId}/edit`)
          }}>Edit Post</Button>
        )}
      {blogContent.map((section: any)=> {
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
