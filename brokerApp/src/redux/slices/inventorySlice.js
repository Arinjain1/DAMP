import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeCategory: 'All',
  properties: [
    {
      id: '1',
      title: 'Grand Arch Residences',
      type: 'Apartment',
      bhk: '3 BHK Luxury',
      area: '1980 sq.ft',
      price: '₹ 1.65 Cr',
      location: 'Sector 58, Gurgaon',
      status: 'Available',
    },
    {
      id: '2',
      title: 'Palm Spring Villas',
      type: 'Villas',
      bhk: '4 BHK Duplex',
      area: '3400 sq.ft',
      price: '₹ 3.80 Cr',
      location: 'Golf Course Ext.',
      status: 'Under Offer',
    },
    {
      id: '3',
      title: 'Cyber One Commercial Tower',
      type: 'Commercial',
      bhk: 'Office Space',
      area: '1450 sq.ft',
      price: '₹ 95 Lakh',
      location: 'Udyog Vihar',
      status: 'Available',
    },
    {
      id: '4',
      title: 'Godrej Horizon Heights',
      type: 'Apartment',
      bhk: '4 BHK Premium',
      area: '2800 sq.ft',
      price: '₹ 2.40 Cr',
      location: 'Golf Course Road',
      status: 'Available',
    },
  ],
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    addProperty: (state, action) => {
      state.properties.unshift(action.payload);
    },
    togglePropertyStatus: (state, action) => {
      const prop = state.properties.find((p) => p.id === action.payload);
      if (prop) {
        prop.status = prop.status === 'Available' ? 'Under Offer' : 'Available';
      }
    },
  },
});

export const { setActiveCategory, addProperty, togglePropertyStatus } =
  inventorySlice.actions;
export default inventorySlice.reducer;
