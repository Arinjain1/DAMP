import { createSlice } from '@reduxjs/toolkit';

const dealsSlice = createSlice({
  name: 'deals',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    addDeal: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateDeal: (state, action) => {
      const index = state.items.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteDeal: (state, action) => {
      state.items = state.items.filter(d => d.id !== action.payload);
    },
    startDeal: (state, action) => {
      const { customer, property } = action.payload;
      const newDeal = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: customer.id,
        propertyId: property.id,
        stage: 'Meeting',
        startedAt: new Date().toISOString(),
        meetings: [],
        visits: [],
      };
      state.items.unshift(newDeal);
    },
    closeDeal: (state, action) => {
      const deal = state.items.find(d => d.id === action.payload);
      if (deal) {
        deal.stage = 'Closed';
        deal.closedAt = new Date().toISOString();
      }
    },
    addVisitToDeal: (state, action) => {
      const { dealId, visit } = action.payload;
      const deal = state.items.find(d => d.id === dealId);
      if (deal) {
        if (!deal.visits) deal.visits = [];
        deal.visits.push(visit);
      }
    },
    updateDealStage: (state, action) => {
      const { id, stage } = action.payload;
      const deal = state.items.find(d => d.id === id);
      if (deal) {
        deal.stage = stage;
      }
    },
    resetDeals: (state) => {
      state.items = [];
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
  addDeal,
  updateDeal,
  deleteDeal,
  startDeal,
  closeDeal,
  addVisitToDeal,
  updateDealStage,
  resetDeals,
  setLoading,
  setError,
} = dealsSlice.actions;

// Selectors
export const selectDeals = (state) => state.deals.items;
export const selectActiveDeals = (state) => 
  state.deals.items.filter(d => d.stage !== 'Closed');
export const selectClosedDeals = (state) => 
  state.deals.items.filter(d => d.stage === 'Closed');
export const selectDealsLoading = (state) => state.deals.loading;
export const selectDealsError = (state) => state.deals.error;

export default dealsSlice.reducer;