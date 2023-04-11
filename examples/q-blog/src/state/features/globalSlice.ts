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
}
const initialState: GlobalState = {
  isOpenPublishBlogModal: false,
  isLoadingCurrentBlog: true,
  isLoadingGlobal: false,
  currentBlog: null,
  isOpenEditBlogModal: false,
  visitingBlog: null
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
  setVisitingBlog
} = globalSlice.actions

export default globalSlice.reducer;