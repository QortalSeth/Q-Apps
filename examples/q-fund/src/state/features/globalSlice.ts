import { createSlice } from '@reduxjs/toolkit'

interface GlobalState {
  isLoadingGlobal: boolean
  downloads: any
  userAvatarHash: Record<string, string>
  videoPlaying: any | null
}
const initialState: GlobalState = {
  isLoadingGlobal: false,
  downloads: {},
  userAvatarHash: {},
  videoPlaying: null
}

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
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
    },
    setVideoPlaying: (state, action) => {
      state.videoPlaying = action.payload
    },
  }
})

export const {
  setIsLoadingGlobal,
  setAddToDownloads,
  updateDownloads,
  setUserAvatarHash,
  setVideoPlaying
} = globalSlice.actions

export default globalSlice.reducer
