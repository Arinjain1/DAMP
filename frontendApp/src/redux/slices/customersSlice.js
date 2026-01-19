import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_CUSTOMERS } from '../../MockData/Mockdata';

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    items: INITIAL_CUSTOMERS,
    loading: false,
    error: null,
  },
  reducers: {
    addCustomer: (state, action) => {
      state.items.unshift(action.payload);
    },
    updateCustomer: (state, action) => {
      const index = state.items.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCustomer: (state, action) => {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
    updateCustomerStatus: (state, action) => {
      const { id, status } = action.payload;
      const customer = state.items.find(c => c.id === id);
      if (customer) {
        customer.status = status;
      }
    },
    resetCustomers: (state) => {
      state.items = INITIAL_CUSTOMERS;
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
  addCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  resetCustomers,
  setLoading,
  setError,
} = customersSlice.actions;

// Selectors
export const selectCustomers = (state) => state.customers.items;
export const selectActiveCustomers = (state) => 
  state.customers.items.filter(c => c.status !== 'Closed');
export const selectCustomersLoading = (state) => state.customers.loading;
export const selectCustomersError = (state) => state.customers.error;

export default customersSlice.reducer;