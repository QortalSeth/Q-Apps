import React from 'react'
import { useParams } from 'react-router-dom';
import { Button, Box, Typography, CardHeader, Avatar, } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/system';
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import ReadOnlySlate from '../../components/editor/ReadOnlySlate'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../state/store'
import { checkStructure } from '../../utils/checkStructure'
import { BlogContent } from '../../interfaces/interfaces'
import { setIsLoadingGlobal } from '../../state/features/globalSlice'
import { VideoPlayer } from '../../components/common/VideoPlayer'
import { AudioPlayer, IPlaylist } from '../../components/common/AudioPlayer'
import { Responsive, WidthProvider } from 'react-grid-layout'
import '/node_modules/react-grid-layout/css/styles.css'
import '/node_modules/react-resizable/css/styles.css'
import DynamicHeightItem from '../../components/DynamicHeightItem'
const ResponsiveGridLayout = WidthProvider(Responsive)
const initialMinHeight = 2 // Define an initial minimum height for grid items

const loadLayoutsFromLocalStorage = () => {
  try {
    const storedLayouts = localStorage.getItem('myGridLayouts')
    if (storedLayouts) {
      return JSON.parse(storedLayouts)
    }
  } catch (err) {
    console.error('Failed to load layouts from localStorage:', err)
  }
}
const saveLayoutsToLocalStorage = (layouts: any) => {
  try {
    localStorage.setItem('myGridLayouts', JSON.stringify(layouts))
  } catch (err) {
    console.error('Failed to save layouts to localStorage:', err)
  }
}

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

interface ILayoutGeneralSettings {
  padding: number
}
export const BlogIndividualPost = () => {
  const { user, postId, blog } = useParams()
  const { user: userState } = useSelector((state: RootState) => state.auth)
  const [avatarUrl, setAvatarUrl] = React.useState<string>('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [currAudio, setCurrAudio] = React.useState<number | null>(null)
  const [layouts, setLayouts] = React.useState<any>({ md, sm, xs })
  const [count, setCount] = React.useState<number>(1)
  const [layoutGeneralSettings, setLayoutGeneralSettings] =
    React.useState<ILayoutGeneralSettings | null>(null)
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<any>()
  const handleLayoutChange = (layout: any, layoutss: any) => {
    // const redoLayouts = setAutoHeight(layoutss)
    setLayouts(layoutss)
    // saveLayoutsToLocalStorage(layoutss)
  }
  const [blogContent, setBlogContent] = React.useState<BlogContent | null>(null)

  const getBlogPost = React.useCallback(async () => {
    try {
      dispatch(setIsLoadingGlobal(true))
      const url = `/arbitrary/BLOG_POST/${user}/${postId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      console.log({ response })
      const responseData = await response.json()
      console.log({ responseData })
      if (checkStructure(responseData)) {
        setBlogContent(responseData)
        if (responseData?.layouts) {
          setLayouts(responseData?.layouts)
        }
        if (responseData?.layoutGeneralSettings) {
          setLayoutGeneralSettings(responseData.layoutGeneralSettings)
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false))
    }
  }, [user, postId])
  React.useEffect(() => {
    getBlogPost()
  }, [])

  const getAvatar = React.useCallback(async () => {
    try {
      let url = await qortalRequest({
        action: 'GET_QDN_RESOURCE_URL',
        name: user,
        service: 'THUMBNAIL',
        identifier: 'qortal_avatar'
      })

      console.log({ url })
      setAvatarUrl(url)
    } catch (error) {}
  }, [user])
  React.useEffect(() => {
    getAvatar()
  }, [])

  const onBreakpointChange = React.useCallback((newBreakpoint: any) => {
    setCurrentBreakpoint(newBreakpoint)
  }, [])

  const onResizeStop = React.useCallback((layout: any, layoutItem: any) => {
    console.log({ layoutItem })
    // Update the layout state with the new position and size of the component
    setCount((prev) => prev + 1)
  }, [])

  const audios = React.useMemo<IPlaylist[]>(() => {
    const filteredAudios = (blogContent?.postContent || []).filter(
      (content) => content.type === 'audio'
    )

    return filteredAudios.map((fa) => {
      return {
        ...fa.content,
        id: fa.id
      }
    })
  }, [blogContent])
  console.log({ blogContent, audios })

  const handleResize = () => {
    setCount((prev) => prev + 1)
  }

  React.useEffect(() => {
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleCount = React.useCallback(() => {
    // Update the layout state with the new position and size of the component
    setCount((prev) => prev + 1)
  }, [])
  if (!blogContent) return null

  console.log({ layoutGeneralSettings })

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
          maxWidth: '1400px',
          // margin: '15px',
          width: '95%',
          paddingBottom: '50px'
        }}
      >
        {user === userState?.name && (
          <Button
            onClick={() => {
              navigate(`/${user}/${blog}/${postId}/edit`)
            }}
          >
            Edit Post
          </Button>
        )}
        <CardHeader
          onClick={() => {
            navigate(`/${user}/${blog}`)
          }}
          sx={{
            cursor: 'pointer',
            '& .MuiCardHeader-content': {
              overflow: 'hidden'
            },
            padding: '10px 0px'
          }}
          avatar={<Avatar src={avatarUrl} alt={`${user}'s avatar`} />}
          subheader={`Author: ${user}`}
        />
        <Typography
          variant="h1"
          color="textPrimary"
          sx={{
            textAlign: 'center'
          }}
        >
          {blogContent?.title}
        </Typography>
        <Content
          layouts={layouts}
          blogContent={blogContent}
          onResizeStop={onResizeStop}
          onBreakpointChange={onBreakpointChange}
          handleLayoutChange={handleLayoutChange}
        >
          {blogContent?.postContent?.map((section: any) => {
            if (section.type === 'editor') {
              return (
                <div key={section.id} className="grid-item-view">
                  <DynamicHeightItem
                    layouts={layouts}
                    setLayouts={setLayouts}
                    i={section.id}
                    breakpoint={currentBreakpoint}
                    count={count}
                    padding={layoutGeneralSettings?.padding}
                  >
                    <ReadOnlySlate content={section.content} />
                  </DynamicHeightItem>
                </div>
              )
            }
            if (section.type === 'image') {
              return (
                <div key={section.id} className="grid-item-view">
                  <DynamicHeightItem
                    layouts={layouts}
                    setLayouts={setLayouts}
                    i={section.id}
                    breakpoint={currentBreakpoint}
                    count={count}
                    padding={layoutGeneralSettings?.padding}
                  >
                    <img src={section.content.image} className="post-image" />
                  </DynamicHeightItem>
                </div>
              )
            }
            if (section.type === 'video') {
              return (
                <div key={section.id} className="grid-item-view">
                  <DynamicHeightItem
                    layouts={layouts}
                    setLayouts={setLayouts}
                    i={section.id}
                    breakpoint={currentBreakpoint}
                    count={count}
                    padding={layoutGeneralSettings?.padding}
                  >
                    <VideoPlayer
                      name={section.content.name}
                      service={section.content.service}
                      identifier={section.content.identifier}
                      setCount={handleCount}
                    />
                  </DynamicHeightItem>
                </div>
              )
            }
            if (section.type === 'audio') {
              return (
                <div key={section.id} className="grid-item-view">
                  <DynamicHeightItem
                    layouts={layouts}
                    setLayouts={setLayouts}
                    i={section.id}
                    breakpoint={currentBreakpoint}
                    count={count}
                    padding={layoutGeneralSettings?.padding}
                  >
                    <Box
                      onClick={() => {
                        const findIndex = audios.findIndex(
                          (item) =>
                            item.identifier === section.content.identifier
                        )
                        if (findIndex >= 0) {
                          setCurrAudio(findIndex)
                        }
                      }}
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
        </Content>
        {audios.length > 0 && (
          <AudioPlayer currAudio={currAudio} playlist={audios} />
        )}
      </Box>
    </Box>
  )
}

const Content = ({
  children,
  layouts,
  blogContent,
  onResizeStop,
  onBreakpointChange,
  handleLayoutChange
}: any) => {
  if (layouts && blogContent?.layouts) {
    return (
      <ResponsiveGridLayout
        layouts={layouts}
        breakpoints={{ md: 996, sm: 768, xs: 480 }}
        cols={{ md: 4, sm: 3, xs: 1 }}
        measureBeforeMount={false}
        onLayoutChange={handleLayoutChange}
        autoSize={true}
        compactType={null}
        isBounded={true}
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        rowHeight={25}
        onResizeStop={onResizeStop}
        onBreakpointChange={onBreakpointChange}
        isDraggable={false}
        isResizable={false}
        margin={[0, 0]}
      >
        {children}
      </ResponsiveGridLayout>
    )
  }
  return children
}