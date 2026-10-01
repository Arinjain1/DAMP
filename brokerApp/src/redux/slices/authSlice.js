import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: {
    name: 'Broker Partner',
    mobile: '+91 98765 43210',
    age: '29',
    city: 'Gurgaon',
    company: 'Prime Realty Advisors',
    reraNumber: 'HRERA-PKL-GGM-1249',
    verified: true,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    updateProfile: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;
