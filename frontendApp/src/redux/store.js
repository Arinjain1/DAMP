import { configureStore } from '@reduxjs/toolkit';

// Import your slices (Ensure these files exist in src/store/slices/)
import propertiesReducer from './slices/propertiesSlice';
import customersReducer from './slices/customersSlice';
import dealsReducer from './slices/dealsSlice';
import followUpsReducer from './slices/followUpsSlice';
import notificationsReducer from './slices/notificationsSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    properties: propertiesReducer,
    customers: customersReducer,
    deals: dealsReducer,
    followUps: followUpsReducer,
    notifications: notificationsReducer,
    subscription: subscriptionReducer,
    ui: uiReducer,
  },
  // We remove the persistenceMiddleware for now to prevent crashes
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});