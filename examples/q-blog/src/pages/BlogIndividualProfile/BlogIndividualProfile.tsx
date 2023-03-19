import Button from '@mui/material/Button';
import React from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import { useParams } from 'react-router-dom';

export const BlogIndividualProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { blog } = useParams();

  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);

    const [blogPosts, setBlogPosts] = React.useState<any[]>([])
    const checkStructure = (content: any)=> {
      let isValid = true
      if (!Array.isArray(content)) isValid = false
    
      content.forEach((c: any)=> {
        if (!c.type) {
          isValid = false;
        }
        if (!c.version) {
          isValid = false;
        }
        if (!c.id) {
          isValid = false;
        }
        if (!c.content) {
          isValid = false;
        }
        if (c.version === 1 && c.type !== 'editor' && c.type !== 'image') {
          isValid = false;
        }
      });
    
      return isValid
    }


    const getBlogPost = React.useCallback(async(user: string, postId: string)=> {
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
          setBlogPosts((prev)=> [...prev, {...responseData, user, postId}])
        }
      } catch (error) {
        
      }
    }, [])

    async function getNameInfo(address: string) {
      const response = await fetch("/names/address/" + address);
      const nameData = await response.json();
  
        if (nameData?.length > 0 ) {
            return nameData[0].name;
        } else {
            return '';
        }
  }

    const getBlogPosts = React.useCallback(async()=> {
      let name 

      // if(!user || !user.address) return
      // try {
      //   name = await getNameInfo(user.address)
      // } catch (error) {
        
      // }
      if(!name) name = 'Phil'
      if(!currentBlog) return
      try {
       const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG_POST&query=${currentBlog.blogId}-post-&limit=20&name=${name}`
         const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const responseData =  await response.json()
        await Promise.all(responseData.map(async (content: any) => {
          if (content.name && content.identifier) {
            await getBlogPost(content.name, content.identifier);
          }
        }));
      } catch (error) {
        
      }
    }, [currentBlog])
    React.useEffect(()=> {
      getBlogPosts()
    }, [])


  return (
    <>
     <div>Phil's blog</div>
    {blogPosts.map((blogPost)=> {
     return (
      <Button onClick={
        ()=> navigate(`/${blogPost.user}/${blog}/${blogPost.postId}`)
      } key={blogPost.postId}>{blogPost.postId}</Button>
     )
    })}
    </>
   
  )
}