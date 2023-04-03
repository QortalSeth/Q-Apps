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
import TextFieldsIcon from '@mui/icons-material/TextFields'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'

import {
  Button,
  Box,
  Typography,
  CardHeader,
  Avatar,
  Toolbar,
  AppBar
} from '@mui/material'
import { styled } from '@mui/system'
import { createEditor, Descendant, Editor, Transforms } from 'slate'
import EditIcon from '@mui/icons-material/Edit'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { extractTextFromSlate } from '../../utils/extractTextFromSlate'
import { setNotification } from '../../state/features/notificationsSlice'
import { VideoPanel } from '../../components/common/VideoPanel'
import { VideoContent } from '../../components/common/VideoContent'
import PostPublishModal from '../../components/common/PostPublishModal'
import { AudioPanel } from '../../components/common/AudioPanel'
import DynamicHeightItem from '../../components/DynamicHeightItem'
import { Responsive, WidthProvider } from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import { ReusableModal } from '../../components/modals/ReusableModal'
import { VideoPlayer } from '../../components/common/VideoPlayer'
const ResponsiveGridLayout = WidthProvider(Responsive)
const initialMinHeight = 2 // Define an initial minimum height for grid items
const uid = new ShortUniqueId()
const md = [
  { i: 'a', x: 0, y: 0, w: 4, h: initialMinHeight },
  { i: 'b', x: 6, y: 0, w: 4, h: initialMinHeight }
]
const sm = [
  { i: 'a', x: 0, y: 0, w: 6, h: initialMinHeight },
  { i: 'b', x: 6, y: 0, w: 6, h: initialMinHeight }
]
const xs = [
  { i: 'a', x: 0, y: 0, w: 6, h: initialMinHeight },
  { i: 'b', x: 6, y: 0, w: 6, h: initialMinHeight }
]
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

const CustomToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
})

const CustomAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#000000'
}))

export const CreatePost = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentBlog, isLoadingCurrentBlog } = useSelector(
    (state: RootState) => state.global
  )
  const [editingSection, setEditingSection] = React.useState<any>(null)
  const [layouts, setLayouts] = React.useState<any>({ md, sm, xs })
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<any>()
  const handleLayoutChange = (layout: any, layoutss: any) => {
    // const redoLayouts = setAutoHeight(layoutss)

    setLayouts(layoutss)
  }
  const [newPostContent, setNewPostContent] = React.useState<any[]>([])
  const [title, setTitle] = React.useState<string>('')
  const [blogImage, setBlogImage] = React.useState<string>('')
  const [isOpenPostModal, setIsOpenPostModal] = React.useState<boolean>(false)
  const [value, setValue] = React.useState(initialValue)
  const [count, setCount] = React.useState<number>(1)
  const [isOpenAddTextModal, setIsOpenAddTextModal] =
    React.useState<boolean>(false)
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

  const description = React.useMemo(() => {
    let description = ''
    const findText = newPostContent.find((data) => data?.type === 'editor')
    if (findText && findText.content) {
      description = extractTextFromSlate(findText?.content)
      description = description.slice(0, 180)
    }
    return description
  }, [newPostContent])
  console.log({ description })
  const post = React.useMemo(() => {
    return {
      description,
      title
    }
  }, [title, description])

  async function publishQDNResource(params: any) {
    console.log({ params })
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
      throw new Error(errorMsg)
    }

    const postObject = {
      title,
      blogImage,
      createdAt: Date.now(),
      postContent: newPostContent,
      layouts
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

      let requestBody = {
        action: 'PUBLISH_QDN_RESOURCE',
        name: name,
        service: 'BLOG_POST',
        data64: blogPostToBase64,
        title: title,
        description: params?.description || description,
        category: params?.category || '',
        identifier: identifier
      }

      const formattedTags: { [key: string]: string } = {}
      if (params?.tags) {
        params.tags.forEach((tag: string, i: number) => {
          console.log({ tag })
          formattedTags[`tag${i + 1}`] = tag
        })

        requestBody = {
          ...requestBody,
          ...formattedTags
        }
      }

      const resourceResponse = await qortalRequest(requestBody)
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

      throw new Error('Failed to publish post')
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

  interface IaddVideo {
    name: string
    identifier: string
    service: string
    title: string
    description: string
  }
  const addVideo = ({
    name,
    identifier,
    service,
    title,
    description
  }: IaddVideo) => {
    const section = {
      type: 'video',
      version: 1,
      content: {
        name: name,
        identifier: identifier,
        service: service,
        title,
        description
      },
      id: uid()
    }
    console.log({ section })
    setNewPostContent((prev) => [...prev, section])
  }

  const addAudio = ({
    name,
    identifier,
    service,
    title,
    description
  }: IaddVideo) => {
    const section = {
      type: 'audio',
      version: 1,
      content: {
        name: name,
        identifier: identifier,
        service: service,
        title,
        description
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
  const editVideo = (
    { name, identifier, service, description, title }: IaddVideo,
    section: any
  ) => {
    const newSection = {
      ...section,
      content: {
        name: name,
        identifier: identifier,
        service: service,
        description,
        title
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

  const onSelectVideo = React.useCallback((video: any) => {
    addVideo({
      name: video.name,
      identifier: video.identifier,
      service: video.service,
      title: video?.metadata?.title,
      description: video?.metadata?.description
    })
    console.log({ video })
  }, [])

  const onSelectAudio = React.useCallback((video: any) => {
    addAudio({
      name: video.name,
      identifier: video.identifier,
      service: video.service,
      title: video?.metadata?.title,
      description: video?.metadata?.description
    })
    console.log({ video })
  }, [])

  const onBreakpointChange = (newBreakpoint: any) => {
    setCurrentBreakpoint(newBreakpoint)
  }

  const closeAddTextModal = React.useCallback(() => {
    setIsOpenAddTextModal(false)
  }, [])

  const onResizeStop = (layout: any, layoutItem: any) => {
    console.log({ layoutItem })
    // Update the layout state with the new position and size of the component
    setCount((prev) => prev + 1)
  }
  const handleResize = () => {
    setCount((prev) => prev + 1)
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return (
    <>
      <CustomAppBar position="sticky">
        <CustomToolbar variant="dense">
          <Box
            sx={{
              display: 'flex',
              gap: '10px'
            }}
          >
            <TextFieldsIcon
              onClick={() => setIsOpenAddTextModal(true)}
              sx={{
                cursor: 'pointer',
                width: '40px',
                height: '40px'
              }}
            />
            <ImageUploader onPick={addImage}>
              <AddPhotoAlternateIcon
                sx={{
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px'
                }}
              />
            </ImageUploader>
            <VideoPanel onSelect={onSelectVideo} />
            <AudioPanel onSelect={onSelectAudio} />
          </Box>
        </CustomToolbar>
      </CustomAppBar>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          padding: '10px'
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
          sx={{ maxWidth: '700px' }}
        />
        <Box
          sx={{
            maxWidth: '1400px',
            // margin: '15px',
            width: '95%'
          }}
        >
          <ResponsiveGridLayout
            layouts={layouts}
            breakpoints={{ md: 996, sm: 768, xs: 480 }}
            cols={{ md: 4, sm: 3, xs: 1 }}
            onLayoutChange={handleLayoutChange}
            measureBeforeMount={false}
            autoSize={true}
            // compactType={null}
            isBounded={true}
            resizeHandles={['se', 'sw', 'ne', 'nw']}
            rowHeight={25}
            onBreakpointChange={onBreakpointChange}
            onResizeStop={onResizeStop}
            margin={[0, 0]}
            // isDraggable={false}
            // isResizable={false}
          >
            {newPostContent.map((section: any) => {
              if (section.type === 'editor') {
                return (
                  <div key={section.id} className="grid-item">
                    <DynamicHeightItem
                      layouts={layouts}
                      setLayouts={setLayouts}
                      i={section.id}
                      breakpoint={currentBreakpoint}
                      count={count}
                    >
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
                            position: 'relative',
                            width: '100%',
                            height: 'auto'
                          }}
                        >
                          <ReadOnlySlate
                            key={section.id}
                            content={section.content}
                          />
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
                    </DynamicHeightItem>
                  </div>
                )
              }
              if (section.type === 'image') {
                return (
                  <div key={section.id} className="grid-item">
                    <DynamicHeightItem
                      layouts={layouts}
                      setLayouts={setLayouts}
                      i={section.id}
                      breakpoint={currentBreakpoint}
                      count={count}
                      type="image"
                    >
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
                            position: 'relative',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <img
                            src={section.content.image}
                            className="post-image"
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
                        <Button onClick={() => setEditingSection(null)}>
                          Close
                        </Button>
                      ) : (
                        <></>
                      )}
                    </DynamicHeightItem>
                  </div>
                )
              }

              if (section.type === 'video') {
                return (
                  <div key={section.id} className="grid-item">
                    <DynamicHeightItem
                      layouts={layouts}
                      setLayouts={setLayouts}
                      i={section.id}
                      breakpoint={currentBreakpoint}
                      count={count}
                    >
                      {editingSection && editingSection.id === section.id ? (
                        <VideoPanel
                          width="24px"
                          height="24px"
                          onSelect={(video) =>
                            editVideo(
                              {
                                name: video.name,
                                identifier: video.identifier,
                                service: video.service,
                                title: video?.metadata?.title,
                                description: video?.metadata?.description
                              },
                              section
                            )
                          }
                        />
                      ) : (
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <VideoPlayer
                            name={section.content.name}
                            service={section.content.service}
                            identifier={section.content.identifier}
                            from="create"
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              right: '5px',
                              zIndex: 501,
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
                            <VideoPanel
                              width="24px"
                              height="24px"
                              onSelect={(video) =>
                                editVideo(
                                  {
                                    name: video.name,
                                    identifier: video.identifier,
                                    service: video.service,
                                    title: video?.metadata?.title,
                                    description: video?.metadata?.description
                                  },
                                  section
                                )
                              }
                            />
                          </Box>
                        </Box>
                      )}
                      {editingSection && editingSection.id === section.id ? (
                        <Button onClick={() => setEditingSection(null)}>
                          Close
                        </Button>
                      ) : (
                        <></>
                      )}
                    </DynamicHeightItem>
                  </div>
                )
              }
              if (section.type === 'audio') {
                return (
                  <div key={section.id} className="grid-item">
                    <DynamicHeightItem
                      layouts={layouts}
                      setLayouts={setLayouts}
                      i={section.id}
                      breakpoint={currentBreakpoint}
                      count={count}
                    >
                      <Box
                        key={section.id}
                        sx={{
                          display: 'flex',
                          padding: '5px',
                          gap: 1,
                          marginTop: '15px',
                          cursor: 'pointer',
                          width: '100%',
                          margin: 0,
                          height: '100%',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="h5" sx={{}}>
                            {section.content?.title}
                          </Typography>

                          <AudiotrackIcon />
                        </Box>

                        <Box>
                          <Typography variant="subtitle1" sx={{}}>
                            {section.content?.description}
                          </Typography>
                        </Box>
                      </Box>
                    </DynamicHeightItem>
                  </div>
                )
              }
            })}
          </ResponsiveGridLayout>

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
            <Button
              onClick={() => {
                setIsOpenPostModal(true)
              }}
            >
              Publish
            </Button>
          </Box>
        </Box>
        <ReusableModal open={isOpenAddTextModal}>
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
          <Button onClick={addSection}>Add Text</Button>
          <Button onClick={closeAddTextModal}>Close</Button>
        </ReusableModal>
        <PostPublishModal
          onClose={() => {
            setIsOpenPostModal(false)
          }}
          open={isOpenPostModal}
          post={post}
          onPublish={publishQDNResource}
        />
      </Box>
    </>
  )
}
