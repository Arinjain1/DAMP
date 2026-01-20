import { configureStore } from '@reduxjs/toolkit';
import { persistenceMiddleware } from './middleware/persistenceMiddleware';
import authReducer from './slices/authSlice';
import customersReducer from './slices/customersSlice';
import dealsReducer from './slices/dealsSlice';
import followUpsReducer from './slices/followUpsSlice';
import notificationsReducer from './slices/notificationsSlice';
import propertiesReducer from './slices/propertiesSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    customers: customersReducer,
    followUps: followUpsReducer,
    deals: dealsReducer,
    notifications: notificationsReducer,
    subscription: subscriptionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(persistenceMiddleware),
});