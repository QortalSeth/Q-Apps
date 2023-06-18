import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface GlobalState {
  products: Product[]
  filteredProducts: Product[]
  hashMapProducts: Record<string, Product>
  isFiltering: boolean
  filterValue: string
  hashMapStores: Record<string, Store>
}
const initialState: GlobalState = {
  products: [],
  filteredProducts: [],
  hashMapProducts: {},
  isFiltering: false,
  filterValue: '',
  hashMapStores: {}
}

export interface Price {
  currency: string
  value: number
}
export interface Product {
  title?: string
  description?: string
  created: number
  user: string
  id: string
  category?: string
  categoryName?: string
  tags?: string[]
  updated?: number
  isValid?: boolean
  price?: Price[]
  images?: string[]
  type?: string
  catalogueId: string
  status?: string
  mainImageIndex?: number
  isUpdate?: boolean
}

export interface Store {
  title: string
  description: string
  created: number
  owner: string
  id: string
  category?: string
  categoryName?: string
  tags?: string[]
  updated?: number
  isValid?: boolean
  logo?: string
  location?: string
  shipsTo?: string
}

export const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setIsFiltering: (state, action) => {
      state.isFiltering = action.payload
    },
    setFilterValue: (state, action) => {
      state.filterValue = action.payload
    },
    addPosts: (state, action) => {
      state.products = action.payload
    },
    addFilteredPosts: (state, action) => {
      state.filteredProducts = action.payload
    },
    removePost: (state, action) => {
      const idToDelete = action.payload
      state.products = state.products.filter((item) => item.id !== idToDelete)
      state.filteredProducts = state.filteredProducts.filter(
        (item) => item.id !== idToDelete
      )
    },
    addPostToBeginning: (state, action) => {
      state.products.unshift(action.payload)
    },
    updatePost: (state, action) => {
      const { id } = action.payload
      const index = state.products.findIndex((post) => post.id === id)
      if (index !== -1) {
        state.products[index] = { ...action.payload }
      }
      const index2 = state.filteredProducts.findIndex((post) => post.id === id)
      if (index2 !== -1) {
        state.filteredProducts[index2] = { ...action.payload }
      }
    },
    addToHashMap: (state, action) => {
      const post = action.payload
      state.hashMapProducts[post.id] = post
    },
    addToHashMapStores: (state, action) => {
      const store = action.payload
      state.hashMapStores[store.id] = store
    },
    updateInHashMap: (state, action) => {
      const { id } = action.payload
      const post = action.payload
      state.hashMapProducts[id] = { ...post }
    },
    removeFromHashMap: (state, action) => {
      const idToDelete = action.payload
      delete state.hashMapProducts[idToDelete]
    },
    addArrayToHashMap: (state, action) => {
      const products = action.payload
      products.forEach((post: Product) => {
        state.hashMapProducts[post.id] = post
      })
    },
    upsertPosts: (state, action) => {
      action.payload.forEach((post: Product) => {
        const index = state.products.findIndex((p) => p.id === post.id)
        if (index !== -1) {
          state.products[index] = post
        } else {
          state.products.push(post)
        }
      })
    },
    upsertFilteredPosts: (state, action) => {
      action.payload.forEach((post: Product) => {
        const index = state.filteredProducts.findIndex((p) => p.id === post.id)
        if (index !== -1) {
          state.filteredProducts[index] = post
        } else {
          state.filteredProducts.push(post)
        }
      })
    },
    upsertPostsBeginning: (state, action) => {
      action.payload.reverse().forEach((post: Product) => {
        const index = state.products.findIndex((p) => p.id === post.id)
        if (index !== -1) {
          state.products[index] = post
        } else {
          state.products.unshift(post)
        }
      })
    },

    blockUser: (state, action) => {
      const username = action.payload
      state.products = state.products.filter((item) => item.user !== username)
      state.filteredProducts = state.filteredProducts.filter(
        (item) => item.user !== username
      )
    }
  }
})

export const {
  addPosts,
  updatePost,
  removePost,
  addToHashMap,
  updateInHashMap,
  removeFromHashMap,
  upsertPosts,
  blockUser,
  addPostToBeginning,
  upsertPostsBeginning,
  upsertFilteredPosts,
  addFilteredPosts,
  setIsFiltering,
  setFilterValue,
  addToHashMapStores
} = storeSlice.actions

export default storeSlice.reducer
