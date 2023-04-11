import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface GlobalState {
  isOpenPublishBlogModal: boolean
  isLoadingCurrentBlog: boolean
  isLoadingGlobal: boolean
  isOpenEditBlogModal: boolean
  currentBlog: {
    createdAt: number
    blogId: string
    title: string
    description: string
    blogImage: string
    category?: string
    tags?: string[]
    navbarConfig?: any
  } | null
  visitingBlog: {
    createdAt: number
    blogId: string
    title: string
    description: string
    blogImage: string
    category?: string
    tags?: string[]
    navbarConfig?: any
    name?: string
  } | null
  audios: any[] | null
  currAudio: any
  audioPostId: string
}
const initialState: GlobalState = {
  isOpenPublishBlogModal: false,
  isLoadingCurrentBlog: true,
  isLoadingGlobal: false,
  currentBlog: null,
  isOpenEditBlogModal: false,
  visitingBlog: null,
  audios: null,
  currAudio: null,
  audioPostId: ''
}

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    togglePublishBlogModal: (state, action) => {
      state.isOpenPublishBlogModal = action.payload
    },
    toggleEditBlogModal: (state, action) => {
      state.isOpenEditBlogModal = action.payload
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload
      state.isLoadingCurrentBlog = false
    },
    setVisitingBlog: (state, action) => {
      state.visitingBlog = action.payload
      state.isLoadingCurrentBlog = false
    },
    setAudio: (state, action) => {
      state.audios = action.payload.audios
      state.audioPostId = action.payload.postId
    },

    setCurrAudio: (state, action) => {
      state.currAudio = action.payload
    },
    removeAudio: (state, action) => {
      state.audios = null
      state.currAudio = null
    },
    setIsLoadingGlobal: (state, action) => {
      state.isLoadingGlobal = action.payload
    }
  }
})

export const {
  togglePublishBlogModal,
  setCurrentBlog,
  setIsLoadingGlobal,
  toggleEditBlogModal,
  setVisitingBlog,
  setAudio,
  setCurrAudio,
  removeAudio
} = globalSlice.actions

export default globalSlice.reducer;