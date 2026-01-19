import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_DEALS } from '../../MockData/Mockdata';

const dealsSlice = createSlice({
  name: 'deals',
  initialState: {
    deals: INITIAL_DEALS,
    selectedDeal: null,
    loading: false,
    error: null,
  },
  reducers: {
    setDeals: (state, action) => {
      state.deals = action.payload;
    },
    addDeal: (state, action) => {
      state.deals.unshift(action.payload);
    },
    updateDeal: (state, action) => {
      const index = state.deals.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.deals[index] = action.payload;
      }
      if (state.selectedDeal?.id === action.payload.id) {
        state.selectedDeal = action.payload;
      }
    },
    deleteDeal: (state, action) => {
      state.deals = state.deals.filter(d => d.id !== action.payload);
      if (state.selectedDeal?.id === action.payload) {
        state.selectedDeal = null;
      }
    },
    setSelectedDeal: (state, action) => {
      state.selectedDeal = action.payload;
    },
    clearSelectedDeal: (state) => {
      state.selectedDeal = null;
    },
    updateDealStage: (state, action) => {
      const { id, stage } = action.payload;
      const deal = state.deals.find(d => d.id === id);
      if (deal) {
        deal.stage = stage;
      }
      if (state.selectedDeal?.id === id) {
        state.selectedDeal.stage = stage;
      }
    },
    closeDeal: (state, action) => {
      const deal = state.deals.find(d => d.id === action.payload);
      if (deal) {
        deal.stage = 'Closed';
        deal.closedAt = new Date().toISOString();
      }
      if (state.selectedDeal?.id === action.payload) {
        state.selectedDeal.stage = 'Closed';
        state.selectedDeal.closedAt = new Date().toISOString();
      }
    },
    addDealVisit: (state, action) => {
      const { dealId, visit } = action.payload;
      const deal = state.deals.find(d => d.id === dealId);
      if (deal) {
        if (!deal.visits) deal.visits = [];
        deal.visits.push(visit);
      }
      if (state.selectedDeal?.id === dealId) {
        if (!state.selectedDeal.visits) state.selectedDeal.visits = [];
        state.selectedDeal.visits.push(visit);
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
  setDeals,
  addDeal,
  updateDeal,
  deleteDeal,
  setSelectedDeal,
  clearSelectedDeal,
  updateDealStage,
  closeDeal,
  addDealVisit,
  setLoading,
  setError,
} = dealsSlice.actions;

export default dealsSlice.reducer;