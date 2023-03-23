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
import EditIcon from '@mui/icons-material/Edit';
import VideoCallIcon from '@mui/icons-material/VideoCall'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { extractTextFromSlate } from '../../utils/extractTextFromSlate'
import { setNotification } from '../../state/features/notificationsSlice'
const uid = new ShortUniqueId()

const initialValue: Descendant[] = [
  {
    type: 'paragraph',
    children: [
      { text: "Start writing your blog post... Don't forget to add a title :)" }
    ]
  }
]

const BlogTitleInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-input': {
    fontSize: '28px',
    height: '28px',
    '&::placeholder': {
      fontSize: '28px',
      color: theme.palette.text.secondary
    }
  },
  '& .MuiInputLabel-root': {
    fontSize: '28px'
  }
}))

export const CreatePost = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentBlog, isLoadingCurrentBlog } = useSelector(
    (state: RootState) => state.global
  )
  const [editingSection, setEditingSection] = React.useState<any>(null)

  const [newPostContent, setNewPostContent] = React.useState<any[]>([])
  const [title, setTitle] = React.useState<string>('')
  const [blogImage, setBlogImage] = React.useState<string>('')
  const [value, setValue] = React.useState(initialValue)
  const dispatch = useDispatch()
  const addPostSection = React.useCallback((content: any) => {
    const section = {
      type: 'editor',
      version: 1,
      content,
      id: uid()
    }

    setNewPostContent((prev) => [...prev, section])
  }, [])
  function objectToBase64(obj: any) {
    // Step 1: Convert the object to a JSON string
    const jsonString = JSON.stringify(obj)

    // Step 2: Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Step 3: Create a FileReader to read the Blob as a base64-encoded string
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove 'data:application/json;base64,' prefix
          const base64 = reader.result.replace(
            'data:application/json;base64,',
            ''
          )
          resolve(base64)
        } else {
          reject(
            new Error('Failed to read the Blob as a base64-encoded string')
          )
        }
      }
      reader.onerror = () => {
        reject(reader.error)
      }
      reader.readAsDataURL(blob)
    })
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
    let errorMsg = ''

    address = user?.address
    name = user?.name || ''

    const missingFields = []
    if (!address) {
      errorMsg = "Cannot post: your address isn't available"
    }
    if (!name) {
      errorMsg = 'Cannot post without a name'
    }
    if (!title) missingFields.push('title')
    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(', ')
      const errMsg = `Missing: ${missingFieldsString}`
      errorMsg = errMsg
    }
    if (newPostContent.length === 0) {
      errorMsg = 'Your post has no content'
    }

    console.log({ currentBlog })

    if (!currentBlog) {
      errorMsg = 'Cannot publish without first creating a blog.'
    }

    if (errorMsg) {
      dispatch(
        setNotification({
          msg: errorMsg,
          alertType: 'error'
        })
      )
      return
    }

    const postObject = {
      title,
      blogImage,
      createdAt: Date.now(),
      postContent: newPostContent
    }
    try {
      if (!currentBlog) return
      const id = uid()

      const identifier = `${currentBlog.blogId}-post-${id}`
      const blogPostToBase64 = await objectToBase64(postObject)
      let description = ''
      const findText = newPostContent.find((data) => data?.type === 'editor')
      if (findText && findText.content) {
        description = extractTextFromSlate(findText?.content)
        description = description.slice(0, 180)
      }
      const resourceResponse = await qortalRequest({
        action: 'PUBLISH_QDN_RESOURCE',
        name: name,
        service: 'BLOG_POST',
        data64: blogPostToBase64,
        title: title,
        description: description,
        category: 'TECHNOLOGY',
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        identifier: identifier
      })
      dispatch(
        setNotification({
          msg: 'Blog post successfully published',
          alertType: 'success'
        })
      )
      console.log({ resourceResponse })
    } catch (error: any) {
      dispatch(
        setNotification({
          msg: error?.message || 'Failed to publish post',
          alertType: 'error'
        })
      )
    }
  }
  const addImage = (base64: string) => {
    const section = {
      type: 'image',
      version: 1,
      content: {
        image: base64,
        caption: ''
      },
      id: uid()
    }
    console.log({ section })
    setNewPostContent((prev) => [...prev, section])
  }
  const addVideo = () => {
    const section = {
      type: 'video',
      version: 1,
      content: {
        name: 'AlphaX',
        identifier: 'qtube_tyfBQYwh',
        service: 'VIDEO'
      },
      id: uid()
    }
    console.log({ section })
    setNewPostContent((prev) => [...prev, section])
  }

  const addSection = () => {
    addPostSection(value)
  }

  const removeSection = (section: any) => {
    const newContent = newPostContent.filter((s) => s.id !== section.id)
    setNewPostContent(newContent)
  }
  const editImage = (base64: string, section: any) => {
    const newSection = {
      ...section,
      content: {
        image: base64,
        caption: section.content.caption
      }
    }
    const findSectionIndex = newPostContent.findIndex(
      (s) => s.id === section.id
    )
    if (findSectionIndex !== -1) {
      const copyNewPostContent = [...newPostContent]
      copyNewPostContent[findSectionIndex] = newSection

      setNewPostContent(copyNewPostContent)
    }
  }
  const editSection = (section: any) => {
    console.log({ section })
    setEditingSection(section)
    setValue(section.content)
  }
  const editPostSection = React.useCallback(
    (content: any, section: any) => {
      console.log({ content, section })
      const findSectionIndex = newPostContent.findIndex(
        (s) => s.id === section.id
      )
      console.log({ findSectionIndex, newPostContent })
      if (findSectionIndex !== -1) {
        console.log('hello entered')
        const copyNewPostContent = [...newPostContent]
        copyNewPostContent[findSectionIndex] = {
          ...section,
          content
        }

        setNewPostContent(copyNewPostContent)
      }

      setEditingSection(null)
    },
    [newPostContent]
  )
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          maxWidth: '700px',
          margin: '15px',
          width: '100%'
        }}
      >
        <BlogTitleInput
          id="modal-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          placeholder="Title"
          variant="filled"
          multiline
          maxRows={2}
          InputLabelProps={{ shrink: false }}
        />

        {newPostContent.map((section: any) => {
          if (section.type === 'editor') {
            return (
              <Box key={section.id}>
                {editingSection && editingSection.id === section.id ? (
                  <BlogEditor
                    editPostSection={editPostSection}
                    defaultValue={section.content}
                    section={section}
                    value={value}
                    setValue={setValue}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'relative'
                    }}
                  >
                    <ReadOnlySlate key={section.id} content={section.content} />
                    <Box
                      sx={{
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
                        borderRadius: '5px'
                      }}
                    >
                      <RemoveCircleIcon
                        onClick={() => removeSection(section)}
                        sx={{
                          cursor: 'pointer'
                        }}
                      />
                      <EditIcon
                        onClick={() => editSection(section)}
                        sx={{
                          cursor: 'pointer'
                        }}
                      />
                    </Box>
                  </Box>
                )}
                {editingSection && editingSection.id === section.id ? (
                  <Box
                    sx={{
                      display: 'flex',
                      width: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <Button onClick={() => setEditingSection(null)}>
                      Close
                    </Button>
                  </Box>
                ) : (
                  <></>
                )}
              </Box>
            )
          }
          if (section.type === 'image') {
            return (
              <Box key={section.id}>
                {editingSection && editingSection.id === section.id ? (
                  <ImageUploader
                    onPick={(base64) => editImage(base64, section)}
                  >
                    Add Image
                    <AddPhotoAlternateIcon />
                  </ImageUploader>
                ) : (
                  <Box
                    sx={{
                      position: 'relative'
                    }}
                  >
                    <img
                      src={section.content.image}
                      className="post-image"
                      style={{
                        marginTop: '20px'
                      }}
                    />
                    <Box
                      sx={{
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
                        borderRadius: '5px'
                      }}
                    >
                      <RemoveCircleIcon
                        onClick={() => removeSection(section)}
                        sx={{
                          cursor: 'pointer'
                        }}
                      />
                      <ImageUploader
                        onPick={(base64) => editImage(base64, section)}
                      >
                        <EditIcon
                          sx={{
                            cursor: 'pointer'
                          }}
                        />
                      </ImageUploader>
                    </Box>
                  </Box>
                )}
                {editingSection && editingSection.id === section.id ? (
                  <Button onClick={() => setEditingSection(null)}>Close</Button>
                ) : (
                  <></>
                )}
              </Box>
            )
          }
        })}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <BlogEditor
            addPostSection={addPostSection}
            value={value}
            setValue={setValue}
          />
        </Box>
        <Box
          sx={{
            display: 'flex'
          }}
        >
          <PostAddIcon
            onClick={addSection}
            sx={{
              cursor: 'pointer',
              width: '50px',
              height: '50px'
            }}
          />
          <ImageUploader onPick={addImage}>
            <AddPhotoAlternateIcon
              sx={{
                cursor: 'pointer',
                width: '50px',
                height: '50px'
              }}
            />
          </ImageUploader>
          <VideoCallIcon
           onClick={addVideo}
            
           sx={{
             cursor: 'pointer',
             width: '50px',
             height: '50px'
           }}
          ></VideoCallIcon>
        </Box>
        <Box
          sx={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 15,
            background: 'deepskyblue',
            padding: '10px',
            borderRadius: '5px'
          }}
        >
          <Button onClick={publishQDNResource}>Publish</Button>
        </Box>
      </Box>
    </Box>
  )
}
