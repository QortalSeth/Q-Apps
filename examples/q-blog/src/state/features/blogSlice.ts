import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface GlobalState {
  posts: BlogPost[]
}
const initialState: GlobalState = {
  posts: []
};

export interface BlogPost {
  title: string;
  description: string;
  createdAt: number | string;
  user: string;
  postImage?: string;
  id: string;
  category?: string;
  categoryName?: string;
  tags?: string[];
}

export const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    addPosts: (state, action) => {
      state.posts = action.payload;
    },
    removePost: (state, action) => {
      const idToDelete = action.payload;
      state.posts = state.posts.filter((item) => item.id !== idToDelete);
    },
    updatePost: (state, action) => {
      const { id } = action.payload;
      const index = state.posts.findIndex(post => post.id === id);
      if (index !== -1) {
        state.posts[index] = { ...action.payload};
      }
   
    },

  },
});

export const { addPosts, updatePost, removePost} = blogSlice.actions;

export default blogSlice.reducer;