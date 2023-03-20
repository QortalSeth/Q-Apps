import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

import {
  addUser
} from '../state/features/authSlice';
import ShortUniqueId from 'short-unique-id';
import { RootState } from "../state/store";
import PublishBlogModal from '../components/modals/PublishBlogModal';
import { setCurrentBlog } from '../state/features/globalSlice';
import NavBar from '../components/layout/Navbar/Navbar';
import PageLoader from '../components/common/PageLoader';

interface Props {
  children: React.ReactNode;
}

const uid = new ShortUniqueId()

const GlobalWrapper: React.FC<Props> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const { isOpenPublishBlogModal , currentBlog, isLoadingGlobal} = useSelector((state: RootState) => state.global);


    async function getNameInfo(address: string) {
        const response = await fetch("/names/address/" + address);
        const nameData = await response.json();
    
          if (nameData?.length > 0 ) {
              return nameData[0].name;
          } else {
              return '';
          }
    }
    async function getBlog(name: string) {
      const url=  `http://213.202.218.148:62391/arbitrary/resources/search?service=BLOG&identifier=q-blog-&name=${name}&prefix=true&limit=20`
      const responseBlogs = await fetch(url, {
       method: 'GET',
       headers: {
         'Content-Type': 'application/json'
       }
     })
     const responseDataBlogs =  await responseBlogs.json()
     const filterOut = responseDataBlogs.filter((blog: any)=> blog.identifier.split("-").length === 3)
     let blog
     if(filterOut.length === 0) return
     if(filterOut.length !== 0){
      blog = filterOut[0]
     }
     const urlBlog=  `http://213.202.218.148:62391/arbitrary/BLOG/${blog.name}/${blog.identifier}`
     const response = await fetch(urlBlog, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const responseData =  await response.json()
    console.log({responseData})
    dispatch(
      setCurrentBlog({
        createdAt: responseData?.createdAt || "",
        blogId: blog.identifier,
        title: responseData?.title || "",
        description: responseData?.description || "",
        blogImage: responseData?.blogImage || "",
      })
    )
      // const response = await fetch("/names/address/" + address);
      // const nameData = await response.json();
  
      //   if (nameData?.length > 0 ) {
      //       return nameData[0].name;
      //   } else {
      //       return '';
      //   }
  }

    const askForAccountInformation = React.useCallback(async()=> {
        try {
            
            let account = await qortalRequest({
              action: "GET_USER_ACCOUNT",
            });

            const name = await getNameInfo(account.address)
            dispatch(
                addUser({...account, name})
              );
    
              const blog = await getBlog(name)

             
          } catch (error) {
            const blog = await getBlog('Phil')
            console.error(error)
          }
        
    }, [])
    function objectToBase64(obj:any) {
        // Step 1: Convert the object to a JSON string
        const jsonString = JSON.stringify(obj);
      
        // Step 2: Convert the JSON string to a Uint8Array of bytes
        const utf8Encoder = new TextEncoder();
        const uint8Array = utf8Encoder.encode(jsonString);
      
        // Step 3: Convert the Uint8Array to a base64-encoded string
        let base64 = '';
     
          // For browsers
          const numberArray = Array.from(uint8Array); // Convert Uint8Array to a regular array
          const binaryString = String.fromCharCode.apply(null, numberArray);
          base64 = btoa(binaryString);
        
        return base64;
      }

    const createBlog =  React.useCallback( async (title: string, description: string)=> {
        if(!user || !user.name) throw new Error('Cannot publish: You do not have a Qortal name')
        const name = user.name
        const id = uid();
        const identifier = `q-blog-${id}`;
        const blogPostToBase64 = objectToBase64({
            title,
            description,
            blogImage: "",
            createdAt: Date.now()
        })
        try {
          const resourceResponse = await qortalRequest({
            action: "PUBLISH_QDN_RESOURCE",
            name: name, 
            service: 'BLOG',
            data64: blogPostToBase64,
            title,
            description: "This is a test of a blog",
            category: "TECHNOLOGY",
            tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
            identifier: identifier
          });
          // navigate(`/${user.name}/${identifier}`)
          console.log({resourceResponse})
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error('An unknown error occurred');
        }
      }
        
    }, [user])
    
    React.useEffect(()=> {

        askForAccountInformation()
      

    }, [])

    const onClosePublishBlogModal= React.useCallback(()=> {
      
    }, [])
  return (
    <>
    {isLoadingGlobal && (
       <PageLoader />
    )}
   
    <PublishBlogModal open={isOpenPublishBlogModal} onClose={onClosePublishBlogModal} onPublish={createBlog} />
    <NavBar isAuthenticated={!!user} hasBlog={!!currentBlog} userName={user?.name || ""} userAvatar="" blog={currentBlog} authenticate={askForAccountInformation} />
      {children}
    </>
  );
};

export default GlobalWrapper;