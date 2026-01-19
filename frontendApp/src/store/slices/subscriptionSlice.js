import { createSlice } from '@reduxjs/toolkit';

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    subscription: {
      active: false,
      plan: null,
      expiry: null,
      price: 0,
    },
    showPaywall: false,
    loading: false,
    error: null,
  },
  reducers: {
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    updateSubscription: (state, action) => {
      state.subscription = { ...state.subscription, ...action.payload };
    },
    activateSubscription: (state, action) => {
      const { plan } = action.payload;
      state.subscription = {
        active: true,
        plan: plan.name,
        price: plan.price,
        expiry: new Date(Date.now() + (plan.duration === '1 Month' ? 30 : 90) * 24 * 60 * 60 * 1000).toLocaleDateString()
      };
      state.showPaywall = false;
    },
    deactivateSubscription: (state) => {
      state.subscription = {
        active: false,
        plan: null,
        expiry: null,
        price: 0,
      };
      state.showPaywall = true;
    },
    setShowPaywall: (state, action) => {
      state.showPaywall = action.payload;
    },
    renewSubscription: (state, action) => {
      const { plan } = action.payload;
      state.subscription.expiry = new Date(Date.now() + (plan.duration === '1 Month' ? 30 : 90) * 24 * 60 * 60 * 1000).toLocaleDateString();
      state.subscription.price = plan.price;
      state.showPaywall = false;
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
  setSubscription,
  updateSubscription,
  activateSubscription,
  deactivateSubscription,
  setShowPaywall,
  renewSubscription,
  setLoading,
  setError,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;