import { createSlice } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    active: false,
    plan: null,
    expiry: null,
    price: 0,
    showPaywall: false,
    loading: false,
    error: null,
  },
  reducers: {
    subscribe: (state, action) => {
      const { plan } = action.payload;
      state.active = true;
      state.plan = plan.name;
      state.price = plan.price;
      state.expiry = new Date(
        Date.now() + (plan.duration === '1 Month' ? 30 : 90) * 24 * 60 * 60 * 1000
      ).toLocaleDateString();
      state.showPaywall = false;
    },
    unsubscribe: (state) => {
      state.active = false;
      state.plan = null;
      state.expiry = null;
      state.price = 0;
    },
    showPaywall: (state) => {
      state.showPaywall = true;
    },
    hidePaywall: (state) => {
      state.showPaywall = false;
    },
    setSubscriptionData: (state, action) => {
      const { active, plan, expiry, price } = action.payload;
      state.active = active;
      state.plan = plan;
      state.expiry = expiry;
      state.price = price;
      if (!active) {
        state.showPaywall = true;
      }
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
  subscribe,
  unsubscribe,
  showPaywall,
  hidePaywall,
  setSubscriptionData,
  setLoading,
  setError,
} = subscriptionSlice.actions;

// Selectors
export const selectSubscription = (state) => state.subscription;
export const selectIsSubscribed = (state) => state.subscription.active;
export const selectShowPaywall = (state) => state.subscription.showPaywall;
export const selectSubscriptionLoading = (state) => state.subscription.loading;
export const selectSubscriptionError = (state) => state.subscription.error;

export default subscriptionSlice.reducer;