import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_NOTIFICATIONS } from '../../MockData/Mockdata';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: INITIAL_NOTIFICATIONS,
    loading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    },
    markAsRead: (state, action) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(notification => {
        notification.read = true;
      });
    },
    deleteNotification: (state, action) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },
    resetNotifications: (state) => {
      state.items = INITIAL_NOTIFICATIONS;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  resetNotifications,
  setLoading,
  setError,
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadNotifications = (state) => 
  state.notifications.items.filter(n => !n.read);
export const selectUnreadCount = (state) => 
  state.notifications.items.filter(n => !n.read).length;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectNotificationsError = (state) => state.notifications.error;

export default notificationsSlice.reducer;