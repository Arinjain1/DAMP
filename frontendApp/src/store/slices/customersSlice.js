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
      state.customers.unshift(action.payload);
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
  setLoading,
  setError,
} = customersSlice.actions;

export default customersSlice.reducer;