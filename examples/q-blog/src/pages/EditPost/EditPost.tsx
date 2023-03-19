import React from 'react'
import { useParams } from 'react-router-dom';
import BlogEditor from '../../components/editor/BlogEditor'
import ShortUniqueId from 'short-unique-id';
import { Button } from '@mui/material';
import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import { Box } from '@mui/material';
import ImageUploader from '../../components/common/ImageUploader';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const uid = new ShortUniqueId()
export const EditPost = () => {
  const { user: username, postId } = useParams();

  const { user } = useSelector((state: RootState) => state.auth);

  const [newPostContent, setNewPostContent] = React.useState<any[]>([])
  const [editingSection, setEditingSection] = React.useState<any>(null)
  const addPostSection = React.useCallback((content: any)=> {
    const section = {
      type: 'editor',
      version: 1,
      content,
      id: uid()
    }

    setNewPostContent((prev)=> [...prev, section])
  }, [])
  const editPostSection = React.useCallback((content: any, section: any)=> {
    console.log({content, section})
    const findSectionIndex = newPostContent.findIndex((s)=> s.id === section.id)
    console.log({findSectionIndex, newPostContent})
    if(findSectionIndex !== -1){
      console.log('hello entered')
      const copyNewPostContent = [...newPostContent]
      copyNewPostContent[findSectionIndex] = {
        ...section,
        content
      }

      setNewPostContent(copyNewPostContent)
    }

    setEditingSection(null)
    
  }, [newPostContent])
  
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


 

  

  async function getNameInfo(address: string) {
    const response = await fetch("/names/address/" + address);
    const nameData = await response.json();

      if (nameData?.length > 0 ) {
          return nameData[0].name;
      } else {
          return '';
      }
}


  
  async function publishQDNResource() {
    let address
    let name 

    try {
       
      if(!user || !user.address) return
        address = user.address
    } catch (error) {
        
    }
    if(!address) return
    try {
      name =  await getNameInfo(address)
    } catch (error) {
        
    }
    if(!name) return
    try {
        const id = uid();
        const blogPostToBase64 = objectToBase64(newPostContent)
      const resourceResponse = await qortalRequest({
        action: "PUBLISH_QDN_RESOURCE",
        name: name, 
        service: 'BLOG_POST',
        data64: blogPostToBase64,
        title: "Title",
        description: "Description",
        category: "TECHNOLOGY",
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
        metaData: 'description=destriptontest&category=catTest',
        identifier: postId
      });
      console.log({ resourceResponse });
    } catch (error) {
      console.error(error)
    }
    
  }
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
     const url=  `http://213.202.218.148:62391/arbitrary/BLOG_POST/${username}/${postId}`
       const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log({response})
      const responseData =  await response.json()
      if(checkStructure(responseData)){
        setNewPostContent(responseData)
      }
    } catch (error) {
      
    }
  }, [user, postId])
  React.useEffect(()=> {
    getBlogPost()
  }, [])

  const editSection = (section: any)=> {
    setEditingSection(section)
  }

  const removeSection = (section: any)=> {
    const newContent = newPostContent.filter((s)=> s.id !== section.id)
    setNewPostContent(newContent)
  }
  const editImage = (base64: string,  section: any)=> {
    const newSection = {
      ...section,
      content: {
        image: base64,
        caption: section.content.caption 
      },
    }
    const findSectionIndex = newPostContent.findIndex((s)=> s.id === section.id)
    if(findSectionIndex !== -1){
      const copyNewPostContent = [...newPostContent]
      copyNewPostContent[findSectionIndex] = newSection

      setNewPostContent(copyNewPostContent)
    }
  }
  return (
    <>
       <div>CreateEditPost</div>
       {newPostContent.map((section: any)=> {
        if(section.type === 'editor'){
         

          return <Box key={section.id}>
          {editingSection && editingSection.id === section.id ? (
             <BlogEditor editPostSection={editPostSection} defaultValue={section.content} section={section}/>
          ) : (
            <ReadOnlySlate key={section.id} content={section.content}  />
          )}
          {editingSection && editingSection.id === section.id ? (
             <Button onClick={()=> setEditingSection(null)}>Close</Button>
          ) : (
            <>
            <Button onClick={()=> editSection(section)}>Edit</Button>
            <Button onClick={()=> removeSection(section)}>Remove</Button>
            </>
            
          )}
            
            
          </Box>
          
        }
        if(section.type === 'image'){
          return <Box key={section.id}>
          {editingSection && editingSection.id === section.id ? (
              <ImageUploader onPick={(base64)=> editImage(base64, section)}>
              Add Image
              <AddPhotoAlternateIcon />
              </ImageUploader>
          ) : (
            <img src={section.content.image}  />
          )}
          {editingSection && editingSection.id === section.id ? (
             <Button onClick={()=> setEditingSection(null)}>Close</Button>
          ) : (
            <>
            <Button onClick={()=> editSection(section)}>Edit</Button>
            <Button onClick={()=> removeSection(section)}>Remove</Button>
            </>
            
          )}
            
            
          </Box> 
        }
       })}
    <BlogEditor addPostSection={addPostSection}/>
    <Button onClick={publishQDNResource}>PUBLISH UPDATE</Button>
    </>
 
  )
}
