import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store'


interface GlobalState {
  hashMapCrowdfunds: Record<string, Video>
  crowdfunds: Crowdfund[]
}
const initialState: GlobalState = {
  hashMapCrowdfunds: {},
  crowdfunds: []
}

export interface Video {
  title: string
  description: string
  created: number | string
  user: string
  id: string
  category?: string
  categoryName?: string
  tags?: string[]
  updated?: number | string
  isValid?: boolean
}
export interface Crowdfund {
  title: string
  description: string
  created: number | string
  user: string
  attachments?: any[]
  id: string
  category?: string
  categoryName?: string
  tags?: string[]
  updated?: number | string
  isValid?: boolean
  inlineContent?: string
}


export const crowdfundSlice = createSlice({
  name: 'crowdfund',
  initialState,
  reducers: {
    addCrowdfundToBeginning: (state, action) => {
      state.crowdfunds.unshift(action.payload)
    },
    addToHashMap: (state, action) => {
      const crowdfund = action.payload
      state.hashMapCrowdfunds[crowdfund.id] = crowdfund
    },
    updateInHashMap: (state, action) => {
      const { id } = action.payload
      const crowdfund = action.payload
      state.hashMapCrowdfunds[id] = { ...crowdfund }
    },
    removeFromHashMap: (state, action) => {
      const idToDelete = action.payload
      delete state.hashMapCrowdfunds[idToDelete]
    },
    addArrayToHashMap: (state, action) => {
      const crowdfunds = action.payload
      crowdfunds.forEach((video: Video) => {
        state.hashMapCrowdfunds[video.id] = video
      })
    },
    upsertCrowdfunds: (state, action) => {
      action.payload.forEach((crowdfund: Crowdfund) => {
        const index = state.crowdfunds.findIndex((p) => p.id === crowdfund.id)
        if (index !== -1) {
          state.crowdfunds[index] = crowdfund
        } else {
          state.crowdfunds.push(crowdfund)
        }
      })
    },
  }
})

export const {
  addCrowdfundToBeginning,
  addToHashMap,
  updateInHashMap,
  removeFromHashMap,
  addArrayToHashMap,
  upsertCrowdfunds
} = crowdfundSlice.actions

export default crowdfundSlice.reducer
