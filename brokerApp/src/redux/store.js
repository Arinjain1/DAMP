import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import crmReducer from './slices/crmSlice.js';
import inventoryReducer from './slices/inventorySlice.js';
import tasksReducer from './slices/tasksSlice.js';
import meetingsReducer from './slices/meetingsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crm: crmReducer,
    inventory: inventoryReducer,
    tasks: tasksReducer,
    meetings: meetingsReducer,
  },
});

export default store;
