import { createSlice } from '@reduxjs/toolkit'
import notification from "../components/common/Notification/Notification";

export interface NotificationState
    {
      alertTypes: {
        alertSuccess: string,
        alertError: string,
        alertInfo: string
      }
    }
const initialState: NotificationState = {
  alertTypes: {
    alertSuccess: '',
    alertError: '',
    alertInfo: ''
  }
}
export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotification: (state, action) => {
      if (action.payload.alertType === 'success') {
        return {
          ...state,
          alertTypes: {
            ...state.alertTypes,
            alertSuccess: action.payload.msg
          }
        }
      } else if (action.payload.alertType === 'error') {
        return {
          ...state,
          alertTypes: {
            ...state.alertTypes,
            alertError: action.payload.msg
          }
        }
      } else if (action.payload.alertType === 'info') {
        return {
          ...state,
          alertTypes: {
            ...state.alertTypes,
            alertInfo: action.payload.msg
          }
        }
      }
      return state
    },
    removeNotification: (state) => {
      return {
        ...state,
        alertTypes: {
          ...state.alertTypes,
          alertSuccess: '',
          alertError: '',
          alertInfo: ''
        }
      }
    }
  }
})

export const { setNotification, removeNotification } =
  notificationsSlice.actions

export default notificationsSlice.reducer
