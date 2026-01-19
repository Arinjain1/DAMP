import { createSlice } from '@reduxjs/toolkit';
import { INITIAL_PROPERTIES } from '../../MockData/Mockdata';

const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    properties: INITIAL_PROPERTIES,
    selectedProperty: null,
    loading: false,
    error: null,
  },
  reducers: {
    setProperties: (state, action) => {
      state.properties = action.payload;
    },
    addProperty: (state, action) => {
      state.properties.unshift(action.payload);
    },
    updateProperty: (state, action) => {
      const index = state.properties.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
      if (state.selectedProperty?.id === action.payload.id) {
        state.selectedProperty = action.payload;
      }
    },
    deleteProperty: (state, action) => {
      state.properties = state.properties.filter(p => p.id !== action.payload);
      if (state.selectedProperty?.id === action.payload) {
        state.selectedProperty = null;
      }
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    setPropertyStatus: (state, action) => {
      const { id, status } = action.payload;
      const property = state.properties.find(p => p.id === id);
      if (property) {
        property.status = status;
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
  setProperties,
  addProperty,
  updateProperty,
  deleteProperty,
  setSelectedProperty,
  clearSelectedProperty,
  setPropertyStatus,
  setLoading,
  setError,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;