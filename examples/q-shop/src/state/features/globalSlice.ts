import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { Product } from './storeSlice'

interface ProductDataContainer {
  created: number
  priceQort: number
  category: string
  catalogueId: string
}

export interface DataContainer {
  storeId: string
  shortStoreId: string
  owner: string
  products: Record<string, ProductDataContainer>
  catalogues: CatalogueDataContainer[]
}

export interface CatalogueDataContainer {
  id: string
  products: Record<string, true>
}
export interface Catalogue {
  id: string
  products: Record<string, Product>
}
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
  dataContainer: DataContainer | null
  productsToSave: Record<string, Product>
}
const initialState: GlobalState = {
  isOpenPublishBlogModal: false,
  isLoadingCurrentBlog: true,
  isLoadingGlobal: false,
  currentStore: null,
  isOpenEditBlogModal: false,
  downloads: {},
  userAvatarHash: {},
  dataContainer: null,
  productsToSave: {}
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
    setDataContainer: (state, action) => {
      state.dataContainer = action.payload
    },
    setIsLoadingGlobal: (state, action) => {
      state.isLoadingGlobal = action.payload
    },
    setAddToDownloads: (state, action) => {
      const download = action.payload
      state.downloads[download.identifier] = download
    },
    setProductsToSave: (state, action) => {
      const product = action.payload
      state.productsToSave[product.id] = product
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
  setDataContainer,
  setIsLoadingGlobal,
  toggleEditBlogModal,

  setAddToDownloads,
  updateDownloads,

  setUserAvatarHash,
  setProductsToSave
} = globalSlice.actions

export default globalSlice.reducer
