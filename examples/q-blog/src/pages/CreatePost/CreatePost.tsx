import React from 'react'
import BlogEditor from '../../components/editor/BlogEditor'
import ShortUniqueId from 'short-unique-id';
import { Button } from '@mui/material';
import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import TextField from '@mui/material/TextField';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageUploader from '../../components/common/ImageUploader';
const uid = new ShortUniqueId()

export const CreatePost = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);

  const [newPostContent, setNewPostContent] = React.useState<object[]>([])
  const [title, setTitle] = React.useState<string>('')

  const addPostSection = React.useCallback((content: any)=> {
    const section = {
      type: 'editor',
      version: 1,
      content,
      id: uid()
    }

    setNewPostContent((prev)=> [...prev, section])
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


 

 

//   async function getNameInfo(address: string) {
//     const response = await fetch("/names/address/" + address);
//     const nameData = await response.json();

//       if (nameData?.length > 0 ) {
//           return nameData[0].name;
//       } else {
//           return '';
//       }
// }


  
  async function publishQDNResource() {
    let address
    let name 

    try {
       console.log({user})
      if(!user || !user.address) return
        address = user.address
        name = user?.name || ""
    } catch (error) {
        
    }
    console.log({address, name})
    if(!address) return
    if(!name) return
    console.log({currentBlog})

    if(!currentBlog) return
    try {
        const id = uid();
        
        const identifier = `${currentBlog.blogId}-post-${id}`;
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
        identifier: identifier
      });
      console.log({ resourceResponse });
    } catch (error) {
      console.error(error)
    }
    
  }
  const addImage = (base64: string)=> {
    const section = {
      type: 'image',
      version: 1,
      content: {
        image: base64,
        caption: ""
      },
      id: uid()
    }
    console.log({section})
    setNewPostContent((prev)=> [...prev, section])
  }
  return (
    <>
       <div>Create a blog post</div>
       <TextField
            id="modal-title-input"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            
          />
       
       {newPostContent.map((section: any)=> {
        if(section.type === 'editor'){
          return <ReadOnlySlate key={section.id} content={section.content}  />
        }
        if(section.type === 'image'){
          return <img src={section.content.image}  />
        }
       })}
    <BlogEditor addPostSection={addPostSection}/>
    <ImageUploader onPick={addImage}>
          Add Image
          <AddPhotoAlternateIcon />
          </ImageUploader>
    <Button onClick={publishQDNResource}>Publish</Button>
    </>
 
  )
}
