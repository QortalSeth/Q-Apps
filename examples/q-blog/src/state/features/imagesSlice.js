import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { setNotification } from "state/features/notificationSlice";
// import { API_STATUS } from "common/Constants";

const initialState = {
  value: [],
  importedImages: [],
  uploadStatus: null,
};



export const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {
    uploadImage: (state, action) => {
      state.value.push(action.payload);
    },
    addImportedImage: (state, action) => {
      state.importedImages.push({
        base64: action.payload.base64,
      });
    },
    replaceImage: (state, action) => {
      state.value = action.payload;
    },
    deleteImage: (state, action) => {
      state.value.splice(action.payload, 1);
    },
  },
});

export const { uploadImage, replaceImage, deleteImage, addImportedImage } =
  imagesSlice.actions;

export default imagesSlice.reducer;
