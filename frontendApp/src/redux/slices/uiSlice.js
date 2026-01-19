import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Modal states
    modalOpen: false,
    modalType: 'Property',
    editItem: null,
    
    // Selected items
    selectedProperty: null,
    selectedCustomer: null,
    selectedDeal: null,
    
    // Sheet states
    collabOpen: false,
    
    // Site visit states
    activeSiteVisit: null,
    showFeedback: null,
    
    // Loading states
    loading: false,
    error: null,
  },
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      state.modalOpen = true;
      state.modalType = action.payload.type || 'Property';
      state.editItem = action.payload.editItem || null;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.editItem = null;
    },
    setModalType: (state, action) => {
      state.modalType = action.payload;
    },
    setEditItem: (state, action) => {
      state.editItem = action.payload;
    },
    
    // Selection actions
    selectProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    selectCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    selectDeal: (state, action) => {
      state.selectedDeal = action.payload;
    },
    clearSelections: (state) => {
      state.selectedProperty = null;
      state.selectedCustomer = null;
      state.selectedDeal = null;
    },
    
    // Sheet actions
    openCollabSheet: (state) => {
      state.collabOpen = true;
    },
    closeCollabSheet: (state) => {
      state.collabOpen = false;
    },
    
    // Site visit actions
    startSiteVisit: (state, action) => {
      state.activeSiteVisit = action.payload;
    },
    finishSiteVisit: (state, action) => {
      state.activeSiteVisit = null;
      state.showFeedback = action.payload;
    },
    closeFeedback: (state) => {
      state.showFeedback = null;
    },
    
    // General UI actions
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
  // Modal actions
  openModal,
  closeModal,
  setModalType,
  setEditItem,
  
  // Selection actions
  selectProperty,
  selectCustomer,
  selectDeal,
  clearSelections,
  
  // Sheet actions
  openCollabSheet,
  closeCollabSheet,
  
  // Site visit actions
  startSiteVisit,
  finishSiteVisit,
  closeFeedback,
  
  // General UI actions
  setLoading,
  setError,
  clearError,
} = uiSlice.actions;

// Selectors
export const selectModalState = (state) => ({
  isOpen: state.ui.modalOpen,
  type: state.ui.modalType,
  editItem: state.ui.editItem,
});

export const selectSelectedItems = (state) => ({
  property: state.ui.selectedProperty,
  customer: state.ui.selectedCustomer,
  deal: state.ui.selectedDeal,
});

export const selectSheetStates = (state) => ({
  collabOpen: state.ui.collabOpen,
});

export const selectSiteVisitState = (state) => ({
  activeSiteVisit: state.ui.activeSiteVisit,
  showFeedback: state.ui.showFeedback,
});

export const selectUILoading = (state) => state.ui.loading;
export const selectUIError = (state) => state.ui.error;

export default uiSlice.reducer;