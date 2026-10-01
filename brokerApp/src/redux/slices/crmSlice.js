import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filter: 'All',
  searchQuery: '',
  leads: [
    {
      id: '1',
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      type: 'Buyer',
      budget: '₹ 1.85 Cr',
      status: 'Follow Up',
      statusColor: '#F59E0B',
      property: 'Prestige Green Heights',
    },
    {
      id: '2',
      name: 'Ananya Verma',
      phone: '+91 99887 76655',
      type: 'Investor',
      budget: '₹ 3.50 Cr',
      status: 'Site Visit Scheduled',
      statusColor: '#05DF8E',
      property: 'Golf Estate Sector 65',
    },
    {
      id: '3',
      name: 'Vikram Malhotra',
      phone: '+91 98112 23344',
      type: 'Seller',
      budget: '₹ 2.10 Cr',
      status: 'Negotiation',
      statusColor: '#3B82F6',
      property: 'Cyber City Duplex',
    },
  ],
};

const crmSlice = createSlice({
  name: 'crm',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addLead: (state, action) => {
      state.leads.unshift(action.payload);
    },
    updateLeadStatus: (state, action) => {
      const { id, status, statusColor } = action.payload;
      const lead = state.leads.find((l) => l.id === id);
      if (lead) {
        lead.status = status;
        if (statusColor) lead.statusColor = statusColor;
      }
    },
  },
});

export const { setFilter, setSearchQuery, addLead, updateLeadStatus } = crmSlice.actions;
export default crmSlice.reducer;
