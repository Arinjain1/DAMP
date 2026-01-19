import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_FOLLOWUPS } from '../../MockData/Mockdata';

const followUpsSlice = createSlice({
  name: 'followUps',
  initialState: {
    items: INITIAL_FOLLOWUPS,
    loading: false,
    error: null,
  },
  reducers: {
    addFollowUp: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateFollowUp: (state, action) => {
      const index = state.items.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteFollowUp: (state, action) => {
      state.items = state.items.filter(f => f.id !== action.payload);
    },
    updateFollowUpStatus: (state, action) => {
      const { id, status } = action.payload;
      const followUp = state.items.find(f => f.id === id);
      if (followUp) {
        followUp.status = status;
      }
    },
    addTask: (state, action) => {
      const newTask = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
      };
      state.items.unshift(newTask);
    },
    resetFollowUps: (state) => {
      state.items = INITIAL_FOLLOWUPS;
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
  addFollowUp,
  updateFollowUp,
  deleteFollowUp,
  updateFollowUpStatus,
  addTask,
  resetFollowUps,
  setLoading,
  setError,
} = followUpsSlice.actions;

// Selectors
export const selectFollowUps = (state) => state.followUps.items;
export const selectPendingFollowUps = (state) => 
  state.followUps.items.filter(f => f.status === 'Pending');
export const selectFollowUpsLoading = (state) => state.followUps.loading;
export const selectFollowUpsError = (state) => state.followUps.error;

export default followUpsSlice.reducer;