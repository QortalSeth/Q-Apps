import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface GlobalState {
  isOpenPublishBlogModal: boolean
  isLoadingCurrentBlog: boolean
  isLoadingGlobal: boolean
  isOpenEditBlogModal: boolean
  currentStore: {
    createdAt: number
    id: string
    title: string
    description: string
    blogImage: string
    category?: string
    tags?: string[]
    navbarConfig?: any
  } | null

  downloads: any

  userAvatarHash: Record<string, string>
}
const initialState: GlobalState = {
  isOpenPublishBlogModal: false,
  isLoadingCurrentBlog: true,
  isLoadingGlobal: false,
  currentStore: null,
  isOpenEditBlogModal: false,
  downloads: {},
  userAvatarHash: {}
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
    setCurrentStore: (state, action) => {
      state.currentStore = action.payload
      state.isLoadingCurrentBlog = false
    },

    setIsLoadingGlobal: (state, action) => {
      state.isLoadingGlobal = action.payload
    },
    setAddToDownloads: (state, action) => {
      const download = action.payload
      state.downloads[download.identifier] = download
    },
    updateDownloads: (state, action) => {
      const { identifier } = action.payload
      const download = action.payload
      state.downloads[identifier] = {
        ...state.downloads[identifier],
        ...download
      }
    },
    setUserAvatarHash: (state, action) => {
      const avatar = action.payload
      if (avatar?.name && avatar?.url) {
        state.userAvatarHash[avatar?.name] = avatar?.url
      }
    }
  }
})

export const {
  togglePublishBlogModal,
  setCurrentStore,
  setIsLoadingGlobal,
  toggleEditBlogModal,

  setAddToDownloads,
  updateDownloads,

  setUserAvatarHash
} = globalSlice.actions

export default globalSlice.reducer
