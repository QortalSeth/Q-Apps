import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import localForage from 'localforage'
import { RootState } from '../store'
const favoritesLocal = localForage.createInstance({
  name: 'q-blog-favorites'
})
const instanceCache = new Map<string, LocalForage>()

interface GlobalState {
  posts: BlogPost[]
  hashMapPosts: Record<string, BlogPost>
  blogListPageNumber: number
  favorites: any[]
  favoritesLocal: any[] | null
}
const initialState: GlobalState = {
  posts: [],
  hashMapPosts: {},
  blogListPageNumber: 0,
  favorites: [],
  favoritesLocal: null
}

export interface BlogPost {
  title: string
  description: string
  createdAt: number | string
  user: string
  postImage?: string
  id: string
  category?: string
  categoryName?: string
  tags?: string[]
  updated?: number | string
}

export const removeFavorites = createAsyncThunk<
  string,
  string,
  { state: RootState }
>('favorites/remove', async (id, thunkAPI) => {
  const state = thunkAPI.getState() // Get the current state
  const username = state?.auth?.user?.name // Access the user.name property
  if (!username) return ''
  let favoritesLocal = instanceCache.get(`q-blog-favorites-${username}`)
  if (!favoritesLocal) {
    favoritesLocal = localForage.createInstance({
      name: `q-blog-favorites-${username}`
    })
  }
  await favoritesLocal.removeItem(id)
  return id
})

export const upsertFavorites = createAsyncThunk<
  any[],
  any[],
  { state: RootState }
>('favorites/upsert', async (payload: any, thunkAPI) => {
  const state = thunkAPI.getState() // Get the current state
  const username = state?.auth?.user?.name // Access the user.name property
  if (!username) return ''
  let favoritesLocal = instanceCache.get(`q-blog-favorites-${username}`)
  if (!favoritesLocal) {
    favoritesLocal = localForage.createInstance({
      name: `q-blog-favorites-${username}`
    })
  }
  if (!favoritesLocal) {
    return []
  }
  payload.forEach((favorite: BlogPost) => {
    favoritesLocal?.setItem(favorite.id, {
      user: favorite.user,
      id: favorite.id
    })
  })
  return payload
})

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setBlogListPageNumber: (state, action) => {
      state.blogListPageNumber = action.payload
    },
    addPosts: (state, action) => {
      state.posts = action.payload
    },
    addFavorites: (state, action) => {
      state.favoritesLocal = action.payload
    },
    addFavorite: (state, action) => {
      state.favorites = action.payload
    },
    removePost: (state, action) => {
      const idToDelete = action.payload
      state.posts = state.posts.filter((item) => item.id !== idToDelete)
    },
    updatePost: (state, action) => {
      const { id } = action.payload
      const index = state.posts.findIndex((post) => post.id === id)
      if (index !== -1) {
        state.posts[index] = { ...action.payload }
      }
    },
    addToHashMap: (state, action) => {
      const post = action.payload
      state.hashMapPosts[post.id] = post
    },
    updateInHashMap: (state, action) => {
      const { id } = action.payload
      const post = action.payload
      state.hashMapPosts[id] = { ...post }
    },
    removeFromHashMap: (state, action) => {
      const idToDelete = action.payload
      delete state.hashMapPosts[idToDelete]
    },
    addArrayToHashMap: (state, action) => {
      const posts = action.payload
      posts.forEach((post: BlogPost) => {
        state.hashMapPosts[post.id] = post
      })
    },
    upsertPosts: (state, action) => {
      action.payload.forEach((post: BlogPost) => {
        const index = state.posts.findIndex((p) => p.id === post.id)
        if (index !== -1) {
          state.posts[index] = post
        } else {
          state.posts.push(post)
        }
      })
    },

    populateFavorites: (state, action) => {
      action.payload.forEach((favorite: BlogPost) => {
        const index = state.favorites.findIndex((p) => p.id === favorite.id)
        if (index !== -1) {
          state.favorites[index] = favorite
        } else {
          state.favorites.push(favorite)
        }
      })
    }
  },
  extraReducers: (builder) => {
    builder.addCase(removeFavorites.fulfilled, (state, action) => {
      console.log({ action })
      const idToDelete = action.payload
      if (!idToDelete) return state
      state.favorites = state.favorites.filter((item) => item.id !== idToDelete)
      state.favoritesLocal = state?.favorites?.filter(
        (item) => item.id !== idToDelete
      )
    }),
      builder.addCase(upsertFavorites.fulfilled, (state, action) => {
        ;(action.payload || []).forEach((favorite: BlogPost) => {
          favoritesLocal.setItem(favorite.id, {
            user: favorite.user,
            id: favorite.id
          })
          const index = state.favorites.findIndex((p) => p.id === favorite.id)
          if (index !== -1) {
            state.favorites[index] = favorite
          } else {
            state.favorites.push(favorite)
          }
          const index2 = state?.favoritesLocal?.findIndex(
            (p) => p.id === favorite.id
          )
          if (index2 !== -1) {
            state.favorites[index] = favorite
          } else {
            state?.favoritesLocal?.push(favorite)
          }
        })
      })
  }
})

export const {
  addPosts,
  updatePost,
  removePost,
  addToHashMap,
  updateInHashMap,
  removeFromHashMap,
  setBlogListPageNumber,
  upsertPosts,
  addFavorites,
  populateFavorites
} = blogSlice.actions

export default blogSlice.reducer

