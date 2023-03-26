import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface GlobalState {
  posts: BlogPost[]
  hashMapPosts: Record<string, BlogPost>
  blogListPageNumber: number
}
const initialState: GlobalState = {
  posts: [],
  hashMapPosts: {},
  blogListPageNumber: 0
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

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setPlogListPageNumber: (state, action) => {
      state.blogListPageNumber = action.payload
    },
    addPosts: (state, action) => {
      state.posts = action.payload
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
  setPlogListPageNumber,
  upsertPosts
} = blogSlice.actions

export default blogSlice.reducer;