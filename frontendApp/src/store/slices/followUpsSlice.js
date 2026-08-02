import { createSlice } from '@reduxjs/toolkit';

const followUpsSlice = createSlice({
  name: 'followUps',
  initialState: {
    followUps: [],
    activeSiteVisit: null,
    showFeedback: null,
    loading: false,
    error: null,
  },
  reducers: {
    setFollowUps: (state, action) => {
      state.followUps = action.payload;
    },
    addFollowUp: (state, action) => {
      state.followUps.unshift(action.payload);
    },
    updateFollowUp: (state, action) => {
      const index = state.followUps.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.followUps[index] = action.payload;
      }
    },
    deleteFollowUp: (state, action) => {
      state.followUps = state.followUps.filter(f => f.id !== action.payload);
    },
    updateFollowUpStatus: (state, action) => {
      const { id, status } = action.payload;
      const followUp = state.followUps.find(f => f.id === id);
      if (followUp) {
        followUp.status = status;
      }
    },
    setActiveSiteVisit: (state, action) => {
      state.activeSiteVisit = action.payload;
    },
    clearActiveSiteVisit: (state) => {
      state.activeSiteVisit = null;
    },
    setShowFeedback: (state, action) => {
      state.showFeedback = action.payload;
    },
    clearShowFeedback: (state) => {
      state.showFeedback = null;
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
  setFollowUps,
  addFollowUp,
  updateFollowUp,
  deleteFollowUp,
  updateFollowUpStatus,
  setActiveSiteVisit,
  clearActiveSiteVisit,
  setShowFeedback,
  clearShowFeedback,
  setLoading,
  setError,
} = followUpsSlice.actions;

export default followUpsSlice.reducer;