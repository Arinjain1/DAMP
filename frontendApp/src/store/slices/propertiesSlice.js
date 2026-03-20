import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { INITIAL_PROPERTIES } from '../../MockData/Mockdata';
import { propertiesAPI } from '../../config/api';

// Async Thunks for API calls

// Fetch all properties
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.getAll(filters);
      if (response.data.success) {
        return response.data.data.map(property => ({
          id: property.id,
          title: property.title,
          listingType: property.listing_type,
          category: property.category,
          propertyCategory: property.property_category,
          type: property.property_type,
          configuration: property.configuration,
          furnishingStatus: property.furnishing_status,
          state: property.state,
          city: property.city,
          locality: property.locality,
          location: property.locality || property.city,
          projectName: property.project_name,
          address: property.address,
          price: property.price,
          size: property.size_sqft,
          sizeUnit: property.size_unit,
          lengthFt: property.length_ft,
          widthFt: property.width_ft,
          ownerName: property.owner_name,
          ownerPhone: property.owner_phone,
          amenities: property.amenities || [],
          bond: property.bond_details,
          image: property.cover_image_url,
          status: property.status,
          createdAt: property.created_at,
          updatedAt: property.updated_at
        }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

// Create new property
export const createProperty = createAsyncThunk(
  'properties/create',
  async (propertyData, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.create({
        listing_type: propertyData.listingType,
        category: propertyData.category,
        property_category: propertyData.propertyCategory,
        property_type: propertyData.type,
        configuration: propertyData.configuration,
        furnishing_status: propertyData.furnishingStatus,
        state: propertyData.state,
        city: propertyData.city,
        locality: propertyData.locality,
        project_name: propertyData.projectName,
        address: propertyData.address,
        price: propertyData.price,
        size: propertyData.size,
        size_unit: propertyData.sizeUnit,
        length_ft: propertyData.lengthFt,
        width_ft: propertyData.widthFt,
        owner_name: propertyData.ownerName,
        owner_phone: propertyData.ownerPhone,
        amenities: propertyData.amenities,
        bond: propertyData.bond,
        image_url: propertyData.image
      });
      
      if (response.data.success) {
        const property = response.data.data;
        return {
          id: property.id,
          title: property.title,
          listingType: property.listing_type,
          category: property.category,
          propertyCategory: property.property_category,
          type: property.property_type,
          configuration: property.configuration,
          furnishingStatus: property.furnishing_status,
          state: property.state,
          city: property.city,
          locality: property.locality,
          location: property.locality || property.city,
          projectName: property.project_name,
          address: property.address,
          price: property.price,
          size: property.size_sqft,
          sizeUnit: property.size_unit,
          lengthFt: property.length_ft,
          widthFt: property.width_ft,
          ownerName: property.owner_name,
          ownerPhone: property.owner_phone,
          amenities: property.amenities || [],
          bond: property.bond_details,
          image: property.cover_image_url,
          status: property.status || 'Available',
          createdAt: property.created_at
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create property');
    }
  }
);

// Update property
export const updatePropertyAPI = createAsyncThunk(
  'properties/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.update(id, {
        listing_type: data.listingType,
        category: data.category,
        property_category: data.propertyCategory,
        property_type: data.type,
        configuration: data.configuration,
        furnishing_status: data.furnishingStatus,
        state: data.state,
        city: data.city,
        locality: data.locality,
        project_name: data.projectName,
        address: data.address,
        price: data.price,
        size: data.size,
        size_unit: data.sizeUnit,
        length_ft: data.lengthFt,
        width_ft: data.widthFt,
        owner_name: data.ownerName,
        owner_phone: data.ownerPhone,
        amenities: data.amenities,
        bond: data.bond,
        image_url: data.image
      });
      
      if (response.data.success) {
        const property = response.data.data;
        return {
          id: property.id,
          title: property.title,
          listingType: property.listing_type,
          category: property.category,
          propertyCategory: property.property_category,
          type: property.property_type,
          configuration: property.configuration,
          furnishingStatus: property.furnishing_status,
          state: property.state,
          city: property.city,
          locality: property.locality,
          location: property.locality || property.city,
          projectName: property.project_name,
          address: property.address,
          price: property.price,
          size: property.size_sqft,
          sizeUnit: property.size_unit,
          lengthFt: property.length_ft,
          widthFt: property.width_ft,
          ownerName: property.owner_name,
          ownerPhone: property.owner_phone,
          amenities: property.amenities || [],
          bond: property.bond_details,
          image: property.cover_image_url,
          status: property.status,
          updatedAt: property.updated_at
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property');
    }
  }
);

// Delete property
export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertiesAPI.delete(id);
      if (response.data.success) {
        return id;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

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
    deletePropertyLocal: (state, action) => {
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Properties
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.properties = action.payload;
        state.loading = false;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Property
    builder
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.properties.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Property
    builder
      .addCase(updatePropertyAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePropertyAPI.fulfilled, (state, action) => {
        const index = state.properties.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
        if (state.selectedProperty?.id === action.payload.id) {
          state.selectedProperty = action.payload;
        }
        state.loading = false;
      })
      .addCase(updatePropertyAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Property
    builder
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.properties = state.properties.filter(p => p.id !== action.payload);
        if (state.selectedProperty?.id === action.payload) {
          state.selectedProperty = null;
        }
        state.loading = false;
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setProperties,
  addProperty,
  updateProperty,
  deletePropertyLocal,
  setSelectedProperty,
  clearSelectedProperty,
  setPropertyStatus,
  setLoading,
  setError,
  clearError,
} = propertiesSlice.actions;

export default propertiesSlice.reducer;