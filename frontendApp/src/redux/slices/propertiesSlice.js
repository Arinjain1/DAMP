import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_PROPERTIES } from '../../MockData/Mockdata';

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    // Renamed 'items' to 'properties' to match Properties.js
    properties: INITIAL_PROPERTIES || [], 
    // Added selectedProperty for the Bottom Sheet logic
    selectedProperty: null,
    loading: false,
    error: null,
  },
  reducers: {
    addProperty: (state, action) => {
      state.properties.unshift(action.payload);
    },
    updateProperty: (state, action) => {
      const index = state.properties.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
    },
    deleteProperty: (state, action) => {
      state.properties = state.properties.filter(p => p.id !== action.payload);
    },
    // --- New Actions for Selection (Required for Detail Sheet) ---
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    // -----------------------------------------------------------
    setPropertyStatus: (state, action) => {
      const { id, status } = action.payload;
      const property = state.properties.find(p => p.id === id);
      if (property) {
        property.status = status;
      }
    },
    resetProperties: (state) => {
      state.properties = INITIAL_PROPERTIES;
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
  addProperty,
  updateProperty,
  deleteProperty,
  setSelectedProperty, // Export this
  clearSelectedProperty, // Export this
  setPropertyStatus,
  resetProperties,
  setLoading,
  setError,
} = propertiesSlice.actions;

// Selectors
export const selectProperties = (state) => state.properties.properties;
export const selectSelectedProperty = (state) => state.properties.selectedProperty;
export const selectAvailableProperties = (state) => 
  state.properties.properties.filter(p => p.status === 'Available');
export const selectPropertiesLoading = (state) => state.properties.loading;
export const selectPropertiesError = (state) => state.properties.error;

export default propertiesSlice.reducer;