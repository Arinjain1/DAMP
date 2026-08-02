import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsAPI } from '../../config/api';

// Async Thunks for API calls

// Fetch all deals
export const fetchDeals = createAsyncThunk(
  'deals/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dealsAPI.getAll();
      if (response.data.success) {
        return response.data.data.map(deal => ({
          id: deal.id,
          customerId: deal.client_id,
          propertyId: deal.property_id,
          stage: deal.status,
          status: deal.status,
          startedAt: deal.created_at,
          finalPrice: deal.final_price,
          tokenAmount: deal.token_amount,
          // Include customer info
          client_name: deal.client_name,
          client_phone: deal.client_phone,
          // Include property info
          property_title: deal.property_title,
          property_address: deal.property_address,
          city: deal.city,
          cover_image_url: deal.cover_image_url,
          listing_price: deal.final_price,
          meetings: []
        }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deals');
    }
  }
);

// Fetch single deal by ID
export const fetchDealById = createAsyncThunk(
  'deals/fetchById',
  async (dealId, { rejectWithValue }) => {
    try {
      const response = await dealsAPI.getById(dealId);
      if (response.data.success) {
        const deal = response.data.data;
        return {
          id: deal.id,
          customerId: deal.client_id,
          propertyId: deal.property_id,
          stage: deal.status,
          status: deal.status,
          startedAt: deal.created_at,
          finalPrice: deal.final_price,
          tokenAmount: deal.token_amount,
          // Include customer info
          client_name: deal.client_name,
          client_phone: deal.client_phone,
          // Include property info
          property_title: deal.property_title,
          property_address: deal.property_address,
          city: deal.city,
          cover_image_url: deal.cover_image_url,
          listing_price: deal.final_price,
          meetings: deal.meetings || []
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal');
    }
  }
);

// Create new deal
export const createDeal = createAsyncThunk(
  'deals/create',
  async (dealData, { rejectWithValue }) => {
    try {
      const response = await dealsAPI.create(dealData);
      if (response.data.success) {
        return {
          id: response.data.data.id,
          customerId: dealData.client_id,
          propertyId: dealData.property_id,
          stage: response.data.data.status || 'Interested',
          startedAt: response.data.data.created_at,
          meetings: []
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create deal');
    }
  }
);

// Update negotiation
export const updateNegotiation = createAsyncThunk(
  'deals/updateNegotiation',
  async ({ dealId, data }, { rejectWithValue }) => {
    try {
      const response = await dealsAPI.updateNegotiation(dealId, data);
      if (response.data.success) {
        return { dealId, data: response.data.data };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update negotiation');
    }
  }
);

// Update deal stage in DB
export const updateDealStageAPI = createAsyncThunk(
  'deals/updateStage',
  async ({ dealId, outcome }, { rejectWithValue }) => {
    try {
      const response = await dealsAPI.updateStage(dealId, outcome);
      if (response.data.success) {
        return { id: dealId, stage: response.data.data.status };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal stage');
    }
  }
);

// Note: Transaction operations moved to transactionSlice for better separation of concerns

const dealsSlice = createSlice({
  name: 'deals',
  initialState: {
    deals: [],
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
        if (stage === 'Completed' && !deal.completedAt) {
          deal.completedAt = new Date().toISOString();
        }
      }
      if (state.selectedDeal?.id === id) {
        state.selectedDeal.stage = stage;
        if (stage === 'Completed' && !state.selectedDeal.completedAt) {
          state.selectedDeal.completedAt = new Date().toISOString();
        }
      }
    },
    syncDealStageWithCustomer: (state, action) => {
      const { customerId, stage } = action.payload;
      const deal = state.deals.find(d => d.customerId === customerId);
      if (deal) {
        deal.stage = stage;
        if (stage === 'Completed' && !deal.completedAt) {
          deal.completedAt = new Date().toISOString();
        }
      }
      if (state.selectedDeal?.customerId === customerId) {
        state.selectedDeal.stage = stage;
        if (stage === 'Completed' && !state.selectedDeal.completedAt) {
          state.selectedDeal.completedAt = new Date().toISOString();
        }
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
  extraReducers: (builder) => {
    // Fetch Deals
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.deals = action.payload;
        state.loading = false;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Deal By ID
    builder
      .addCase(fetchDealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.selectedDeal = action.payload;
        // Also update in deals array if exists
        const index = state.deals.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(fetchDealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Deal
    builder
      .addCase(createDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.deals.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Negotiation
    builder
      .addCase(updateNegotiation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateNegotiation.fulfilled, (state, action) => {
        const { dealId, data } = action.payload;
        if (state.selectedDeal?.id === dealId) {
          state.selectedDeal = { ...state.selectedDeal, ...data };
        }
        state.loading = false;
      })
      .addCase(updateNegotiation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Deal Stage
    builder
      .addCase(updateDealStageAPI.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDealStageAPI.fulfilled, (state, action) => {
        const { id, stage } = action.payload;
        const index = state.deals.findIndex(d => d.id === id);
        if (index !== -1) {
          state.deals[index].stage = stage;
          state.deals[index].status = stage;
        }
        if (state.selectedDeal?.id === id) {
          state.selectedDeal.stage = stage;
          state.selectedDeal.status = stage;
        }
        state.loading = false;
      })
      .addCase(updateDealStageAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
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
  syncDealStageWithCustomer,
  closeDeal,
  addDealVisit,
  setLoading,
  setError,
} = dealsSlice.actions;

export default dealsSlice.reducer;