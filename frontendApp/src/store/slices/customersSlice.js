import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { INITIAL_CUSTOMERS } from '../../MockData/Mockdata';
import { customersAPI } from '../../config/api';

// Async Thunks for API calls

// Fetch all customers/clients
export const fetchCustomers = createAsyncThunk(
  'customers/fetchAll',
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await customersAPI.getAll(searchQuery ? { search: searchQuery } : {});
      if (response.data.success) {
        return response.data.data.map(client => ({
          id: client.id,
          name: client.name,
          phone: client.phone,
          stage: client.status, // Backend uses 'status', frontend uses 'stage'
          requirementType: client.requirement_type,
          propertyCategory: client.property_category,
          propertyType: client.property_type,
          configuration: client.configuration,
          furnishingStatus: client.furnishing_status,
          budgetMin: client.budget_min,
          budgetMax: client.budget_max,
          preferredLocation: client.preferred_location,
          notes: client.notes,
          selectedProperties: client.selectedProperties || [],
          interestedProperties: client.interestedProperties || [],
          holdProperties: client.holdProperties || [],
          activeDealCount: client.active_deal_count || 0,
          nextTask: client.next_task,
          createdAt: client.created_at,
          updatedAt: client.updated_at
        }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

// Create new customer
export const createCustomer = createAsyncThunk(
  'customers/create',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await customersAPI.create({
        name: customerData.name,
        phone: customerData.phone,
        requirement_type: customerData.requirementType,
        property_category: customerData.propertyCategory,
        property_type: customerData.propertyType,
        configuration: customerData.configuration,
        furnishing_status: customerData.furnishingStatus,
        budget_min: customerData.budgetMin,
        budget_max: customerData.budgetMax,
        preferred_location: customerData.preferredLocation,
        notes: customerData.notes
      });
      if (response.data.success) {
        const client = response.data.data;
        return {
          id: client.id,
          name: client.name,
          phone: client.phone,
          stage: client.status || 'New',
          requirementType: client.requirement_type,
          propertyCategory: client.property_category,
          propertyType: client.property_type,
          configuration: client.configuration,
          furnishingStatus: client.furnishing_status,
          budgetMin: client.budget_min,
          budgetMax: client.budget_max,
          preferredLocation: client.preferred_location,
          notes: client.notes,
          selectedProperties: [],
          interestedProperties: [],
          holdProperties: [],
          createdAt: client.created_at
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customersAPI.update(id, {
        name: data.name,
        phone: data.phone,
        requirement_type: data.requirementType,
        property_category: data.propertyCategory,
        property_type: data.propertyType,
        configuration: data.configuration,
        furnishing_status: data.furnishingStatus,
        budget_min: data.budgetMin,
        budget_max: data.budgetMax,
        preferred_location: data.preferredLocation,
        notes: data.notes,
        selected_properties: data.selectedProperties,
        interested_properties: data.interestedProperties,
        hold_properties: data.holdProperties
      });
      if (response.data.success) {
        const client = response.data.data;
        return {
          id: client.id,
          name: client.name,
          phone: client.phone,
          stage: client.status,
          requirementType: client.requirement_type,
          propertyCategory: client.property_category,
          propertyType: client.property_type,
          configuration: client.configuration,
          furnishingStatus: client.furnishing_status,
          budgetMin: client.budget_min,
          budgetMax: client.budget_max,
          preferredLocation: client.preferred_location,
          notes: client.notes,
          selectedProperties: client.selected_properties || [],
          interestedProperties: client.interested_properties || [],
          holdProperties: client.hold_properties || []
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

// Update customer stage
export const updateCustomerStageAPI = createAsyncThunk(
  'customers/updateStage',
  async ({ id, stage }, { rejectWithValue }) => {
    try {
      const response = await customersAPI.updateStage(id, stage);
      if (response.data.success) {
        return { id, stage };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer stage');
    }
  }
);

// Update customer properties
export const updateCustomerProperties = createAsyncThunk(
  'customers/updateProperties',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customersAPI.updateProperties(id, {
        selected_properties: data.selectedProperties,
        interested_properties: data.interestedProperties,
        hold_properties: data.holdProperties
      });
      if (response.data.success) {
        const client = response.data.data;
        return {
          id: client.id,
          selectedProperties: client.selectedProperties || [],
          interestedProperties: client.interestedProperties || [],
          holdProperties: client.holdProperties || []
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer properties');
    }
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customersAPI.delete(id);
      if (response.data.success) {
        return id;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: INITIAL_CUSTOMERS,
    selectedCustomer: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    addCustomer: (state, action) => {
      const newCustomer = {
        ...action.payload,
        stage: action.payload.stage || 'New',
      };
      state.customers.unshift(newCustomer);
    },
    updateCustomerLocal: (state, action) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers = [
          ...state.customers.slice(0, index),
          { ...state.customers[index], ...action.payload },
          ...state.customers.slice(index + 1)
        ];
      }
      if (state.selectedCustomer?.id === action.payload.id) {
        state.selectedCustomer = { ...state.selectedCustomer, ...action.payload };
      }
    },
    deleteCustomerLocal: (state, action) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
      if (state.selectedCustomer?.id === action.payload) {
        state.selectedCustomer = null;
      }
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    updateCustomerStatus: (state, action) => {
      const { id, status } = action.payload;
      const customer = state.customers.find(c => c.id === id);
      if (customer) {
        customer.status = status;
      }
      if (state.selectedCustomer?.id === id) {
        state.selectedCustomer.status = status;
      }
    },
    updateCustomerStage: (state, action) => {
      const { id, stage } = action.payload;
      const index = state.customers.findIndex(c => c.id === id);
      if (index !== -1) {
        const updatedCustomer = { ...state.customers[index], stage };
        if (stage === 'Completed' && !updatedCustomer.completedAt) {
          updatedCustomer.completedAt = new Date().toISOString();
        }
        state.customers = [
          ...state.customers.slice(0, index),
          updatedCustomer,
          ...state.customers.slice(index + 1)
        ];
      }
      if (state.selectedCustomer?.id === id) {
        state.selectedCustomer = { ...state.selectedCustomer, stage };
        if (stage === 'Completed' && !state.selectedCustomer.completedAt) {
          state.selectedCustomer.completedAt = new Date().toISOString();
        }
      }
    },
    transitionToInProcess: (state, action) => {
      const customerId = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer) {
        customer.stage = 'In-Process';
      }
      if (state.selectedCustomer?.id === customerId) {
        state.selectedCustomer.stage = 'In-Process';
      }
    },
    completeAgreement: (state, action) => {
      const customerId = action.payload;
      const customer = state.customers.find(c => c.id === customerId);
      if (customer && customer.stage === 'In-Process') {
        customer.stage = 'Completed';
        customer.completedAt = new Date().toISOString();
      }
      if (state.selectedCustomer?.id === customerId && state.selectedCustomer.stage === 'In-Process') {
        state.selectedCustomer.stage = 'Completed';
        state.selectedCustomer.completedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers = [
            ...state.customers.slice(0, index),
            { ...state.customers[index], ...action.payload },
            ...state.customers.slice(index + 1)
          ];
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = { ...state.selectedCustomer, ...action.payload };
        }
        state.loading = false;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Customer Stage
    builder
      .addCase(updateCustomerStageAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerStageAPI.fulfilled, (state, action) => {
        const { id, stage } = action.payload;
        const index = state.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          const updatedCustomer = { ...state.customers[index], stage };
          if (stage === 'Completed' && !updatedCustomer.completedAt) {
            updatedCustomer.completedAt = new Date().toISOString();
          }
          state.customers = [
            ...state.customers.slice(0, index),
            updatedCustomer,
            ...state.customers.slice(index + 1)
          ];
        }
        if (state.selectedCustomer?.id === id) {
          state.selectedCustomer = { ...state.selectedCustomer, stage };
          if (stage === 'Completed' && !state.selectedCustomer.completedAt) {
            state.selectedCustomer.completedAt = new Date().toISOString();
          }
        }
        state.loading = false;
      })
      .addCase(updateCustomerStageAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Customer Properties
    builder
      .addCase(updateCustomerProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProperties.fulfilled, (state, action) => {
        const { id, selectedProperties, interestedProperties, holdProperties } = action.payload;
        const index = state.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          state.customers[index] = {
            ...state.customers[index],
            selectedProperties,
            interestedProperties,
            holdProperties
          };
        }
        if (state.selectedCustomer?.id === id) {
          state.selectedCustomer = {
            ...state.selectedCustomer,
            selectedProperties,
            interestedProperties,
            holdProperties
          };
        }
        state.loading = false;
      })
      .addCase(updateCustomerProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        // Don't set global loading for delete — avoids full list re-render
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(c => c.id !== action.payload);
        if (state.selectedCustomer?.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomerLocal,
  deleteCustomerLocal,
  setSelectedCustomer,
  clearSelectedCustomer,
  updateCustomerStatus,
  updateCustomerStage,
  transitionToInProcess,
  completeAgreement,
  setLoading,
  setError,
  clearError,
} = customersSlice.actions;

export default customersSlice.reducer;