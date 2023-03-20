import React from 'react'
import { useParams } from 'react-router-dom';
import BlogEditor from '../../components/editor/BlogEditor'
import ShortUniqueId from 'short-unique-id';
import { Button, TextField } from '@mui/material';
import ReadOnlySlate from '../../components/editor/ReadOnlySlate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../../state/store";
import { Box } from '@mui/material';
import ImageUploader from '../../components/common/ImageUploader';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { checkStructure } from '../../utils/checkStructure';
import { BlogContent } from '../../interfaces/interfaces';
import PostAddIcon from '@mui/icons-material/PostAdd';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EditIcon from '@mui/icons-material/Edit';
import { createEditor, Descendant, Editor, Transforms } from 'slate';
import { styled } from '@mui/system';
import { setIsLoadingGlobal } from '../../state/features/globalSlice';

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

const uid = new ShortUniqueId()
export const EditPost = () => {
  const { user: username, postId } = useParams();

  const { user } = useSelector((state: RootState) => state.auth);

  const [newPostContent, setNewPostContent] = React.useState<any[]>([])
  const [blogInfo, setBlogInfo] = React.useState<BlogContent | null>(null)
  const [editingSection, setEditingSection] = React.useState<any>(null)
  const [value, setValue] = React.useState(initialValue);
  const [value2, setValue2] = React.useState(initialValue);
  const [title, setTitle] = React.useState('');
  const dispatch = useDispatch()
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
    if(!blogInfo) return
    try {
        

        const postObject = {
          ...blogInfo,
          title,
          postContent: newPostContent
        }
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
        metaData: 'description=destriptontest&category=catTest',
        identifier: postId
      });
      console.log({ resourceResponse });
    } catch (error) {
      console.error(error)
    }
    
  }

  const addSection = ()=> {
    addPostSection(value2)
  }

  const getBlogPost = React.useCallback(async()=> {
    try {
      dispatch(setIsLoadingGlobal(true))
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
        setNewPostContent(responseData.postContent)
        setTitle(responseData?.title || "")
        setBlogInfo(responseData)
      }
    } catch (error) {
      
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [user, postId])
  React.useEffect(()=> {
    getBlogPost()
  }, [])

  const editSection = (section: any)=> {
    console.log({section})
    setEditingSection(section)
    setValue(section.content)
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
         

          return <Box key={section.id}>
          {editingSection && editingSection.id === section.id ? (
             <BlogEditor editPostSection={editPostSection} defaultValue={section.content} section={section} value={value} setValue={setValue}/>
          ) : (
            <Box sx={{
              position: 'relative'
            }}>
            <ReadOnlySlate key={section.id} content={section.content}  />
             <Box sx={{
                position: 'absolute',
                right: '5px',
                zIndex: 5,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                // flexDirection: 'column',
                gap: 2,
                background: 'white',
                padding: '5px',
                borderRadius: '5px',
               }}>
             <RemoveCircleIcon onClick={()=> removeSection(section)} sx={{
               
                cursor: 'pointer'
               }} />
             <EditIcon onClick={()=> editSection(section)} sx={{
               
               cursor: 'pointer'
              }}  />
              </Box>
              
              </Box> 
           
          )}
          {editingSection && editingSection.id === section.id ? (
            <Box sx={{
           
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end'
             }}>
              <Button onClick={()=> setEditingSection(null)}>Close</Button>
              </Box>
             
          ) : (
            
            <>
           
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
            <Box sx={{
              position: 'relative'
            }}>
             <img src={section.content.image} className="post-image" style={{
              marginTop: '20px'
             }} />
             <Box sx={{
                position: 'absolute',
                right: '5px',
                zIndex: 5,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                background: 'white',
    padding: '5px',
    borderRadius: '5px',
               }}>
             <RemoveCircleIcon onClick={()=> removeSection(section)} sx={{
               
                cursor: 'pointer'
               }} />
                <ImageUploader onPick={(base64)=> editImage(base64, section)}>
                <EditIcon  sx={{
               
               cursor: 'pointer'
              }}  />
              </ImageUploader>
           
              </Box>
              
              </Box> 
          
          )}
          {editingSection && editingSection.id === section.id ? (
             <Button onClick={()=> setEditingSection(null)}>Close</Button>
          ) : (
            <>
           
            </>
            
          )}
            
            
          </Box> 
        }
       })}
      
    <BlogEditor addPostSection={addPostSection} value={value2} setValue={setValue2}/>
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
   <Button onClick={publishQDNResource}>PUBLISH UPDATE</Button>
  </Box>
    </Box>
 
  )
}
