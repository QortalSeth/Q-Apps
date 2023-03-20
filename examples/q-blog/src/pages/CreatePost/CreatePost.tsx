import React from 'react'
import BlogEditor from '../../components/editor/BlogEditor'
import ShortUniqueId from 'short-unique-id';
import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import TextField from '@mui/material/TextField';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ImageUploader from '../../components/common/ImageUploader';
import { Button, Box, Typography, CardHeader, Avatar, } from '@mui/material';
import { styled } from '@mui/system';
import { createEditor, Descendant, Editor, Transforms } from 'slate';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
const uid = new ShortUniqueId()

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: "Start writing your blog post... Don't forget to add a title :)" }],
  },
];

const BlogTitleInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '28px',
    height: '28px',
    '&::placeholder': {
      fontSize: '28px',
      color: theme.palette.text.secondary,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '28px',
  },
 
}));


export const CreatePost = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentBlog, isLoadingCurrentBlog } = useSelector((state: RootState) => state.global);

  const [newPostContent, setNewPostContent] = React.useState<any[]>([])
  const [title, setTitle] = React.useState<string>('')
  const [blogImage, setBlogImage] = React.useState<string>('')
  const [value, setValue] = React.useState(initialValue);

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
    if(!title) return
    if(newPostContent.length === 0) return
    console.log({currentBlog})

    if(!currentBlog) return

    const postObject = {
      title,
      blogImage,
      createdAt: Date.now(),
      postContent: newPostContent
    }
    try {
        const id = uid();
        
        const identifier = `${currentBlog.blogId}-post-${id}`;
        const blogPostToBase64 = objectToBase64(postObject)
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

  const addSection = ()=> {
    addPostSection(value)
  }

  const removeSection = (section: any)=> {
    const newContent = newPostContent.filter((s)=> s.id !== section.id)
    setNewPostContent(newContent)
  }
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
       <Box sx={{
          maxWidth: '700px',
          margin: '15px',
          width: '100%'
        }}>
        <BlogTitleInput
      id="modal-title-input"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      fullWidth 
      placeholder="Title"
      variant="filled" 
      multiline
          maxRows={2}
          InputLabelProps={{shrink: false}}
    />
       
       {newPostContent.map((section: any)=> {
        if(section.type === 'editor'){
          return <Box sx={{
            position: 'relative'
          }}>
             <ReadOnlySlate key={section.id} content={section.content}  />
             <RemoveCircleIcon onClick={()=> removeSection(section)} sx={{
              position: 'absolute',
              right: '5px',
              zIndex: 5,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer'
             }} />
            </Box>
          
         
        }
        if(section.type === 'image'){
          return <Box sx={{
            position: 'relative'
          }}>
           <img src={section.content.image} className="post-image" style={{
            marginTop: '20px'
           }} />
             <RemoveCircleIcon onClick={()=> removeSection(section)} sx={{
              position: 'absolute',
              right: '5px',
              zIndex: 5,
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer'
             }} />
            </Box> 
        }
       })}
    <Box  sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
    <BlogEditor addPostSection={addPostSection} value={value} setValue={setValue}/>
    
   
  
    </Box>
  <Box
  sx={{
    display: 'flex',
   

  }}
  >
  <PostAddIcon onClick={addSection} sx={{
        cursor: 'pointer',
        width: '50px',
        height: '50px'
      }} /> 
  <ImageUploader onPick={addImage}>
          <AddPhotoAlternateIcon sx={{
            cursor: 'pointer',
            width: '50px',
            height: '50px'
          }} />
      </ImageUploader>
     
          
  </Box>
  <Box sx={{
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: 15,
    background: 'deepskyblue',
    padding: '10px',
    borderRadius: '5px',
  }}>
  <Button onClick={publishQDNResource}>Publish</Button>
  </Box>
    
   </Box>
   </Box>
  )
}
