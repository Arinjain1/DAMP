import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_CUSTOMERS } from '../../MockData/Mockdata';

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
        stage: action.payload.stage || 'New', // Default to 'New' if not specified
      };
      state.customers.unshift(newCustomer);
    },
    updateCustomer: (state, action) => {
      const index = state.customers.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.customers[index] = action.payload;
      }
      if (state.selectedCustomer?.id === action.payload.id) {
        state.selectedCustomer = action.payload;
      }
    },
    deleteCustomer: (state, action) => {
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
      const customer = state.customers.find(c => c.id === id);
      if (customer) {
        customer.stage = stage;
        // Add completedAt timestamp when transitioning to Completed
        if (stage === 'Completed' && !customer.completedAt) {
          customer.completedAt = new Date().toISOString();
        }
      }
      if (state.selectedCustomer?.id === id) {
        state.selectedCustomer.stage = stage;
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
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  clearSelectedCustomer,
  updateCustomerStatus,
  updateCustomerStage,
  transitionToInProcess,
  completeAgreement,
  setLoading,
  setError,
} = customersSlice.actions;

export default customersSlice.reducer;