import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    modalOpen: false,
    modalType: 'Property',
    editItem: null,
    collabOpen: false,
    loading: false,
    error: null,
  },
  reducers: {
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },
    setModalType: (state, action) => {
      state.modalType = action.payload;
    },
    setEditItem: (state, action) => {
      state.editItem = action.payload;
    },
    clearEditItem: (state) => {
      state.editItem = null;
    },
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type || 'Property';
      state.editItem = action.payload.editItem || null;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.editItem = null;
    },
    setCollabOpen: (state, action) => {
      state.collabOpen = action.payload;
    },
    openCollab: (state) => {
      state.collabOpen = true;
    },
    closeCollab: (state) => {
      state.collabOpen = false;
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
});

export const {
  setModalOpen,
  setModalType,
  setEditItem,
  clearEditItem,
  openModal,
  closeModal,
  setCollabOpen,
  openCollab,
  closeCollab,
  setLoading,
  setError,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;