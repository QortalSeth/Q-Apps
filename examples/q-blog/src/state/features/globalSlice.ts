import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


interface GlobalState {
  isOpenPublishBlogModal: boolean;
  isLoadingCurrentBlog: boolean;
  currentBlog: {
    createdAt: number;
    blogId: string;
    title: string;
    description: string;
    blogImage: string;
  } | null
}
const initialState: GlobalState = {
  isOpenPublishBlogModal: false,
  isLoadingCurrentBlog: true,
  currentBlog: null
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    togglePublishBlogModal: (state, action) => {
      state.isOpenPublishBlogModal = action.payload;
    },
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload
      state.isLoadingCurrentBlog = false
    }
  },
});

export const { togglePublishBlogModal, setCurrentBlog } = globalSlice.actions;

export default globalSlice.reducer;