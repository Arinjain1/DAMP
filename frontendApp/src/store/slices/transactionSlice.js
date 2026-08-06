import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsAPI } from '../../config/api';

// Async Thunks for Transaction operations

// Add new transaction (Token/Installment/Final Payment)
export const addTransaction = createAsyncThunk(
  'transactions/add',
  async ({ dealId, transactionData }, { rejectWithValue }) => {
    if (dealId === 99 || dealId === '99') {
      return { 
        dealId, 
        transaction: {
          id: `tx_${Date.now()}`,
          deal_id: dealId,
          amount: transactionData.amount,
          type: transactionData.type || 'Token',
          status: 'completed',
          payment_mode: transactionData.payment_mode || 'Cash',
          created_at: new Date().toISOString()
        }
      };
    }
    try {
      const response = await dealsAPI.addTransaction(dealId, transactionData);
      if (response.data.success) {
        return { 
          dealId, 
          transaction: response.data.data 
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add transaction');
    }
  }
);

// Complete/Update transaction
export const completeTransaction = createAsyncThunk(
  'transactions/complete',
  async ({ transactionId, data }, { rejectWithValue }) => {
    if (String(transactionId).startsWith('tx_')) {
      return { 
        transactionId, 
        transaction: {
          id: transactionId,
          status: 'completed',
          ...data
        }
      };
    }
    try {
      const response = await dealsAPI.completeTransaction(transactionId, data);
      if (response.data.success) {
        return { 
          transactionId, 
          transaction: response.data.data 
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete transaction');
    }
  }
);

// Fetch transaction history for a deal
export const fetchTransactionHistory = createAsyncThunk(
  'transactions/fetchHistory',
  async (dealId, { rejectWithValue }) => {
    if (dealId === 99 || dealId === '99') {
      return { 
        dealId, 
        finalPrice: 12200000,
        transactions: [] 
      };
    }
    try {
      const response = await dealsAPI.getHistory(dealId);
      if (response.data.success) {
        return { 
          dealId, 
          finalPrice: response.data.data.final_price,
          transactions: response.data.data.transactions 
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    // Transactions grouped by dealId
    transactionsByDeal: {},
    // Current deal's transaction summary
    currentDealSummary: {
      dealId: null,
      finalPrice: 0,
      totalPaid: 0,
      totalPending: 0,
      transactions: []
    },
    loading: false,
    error: null,
  },
  reducers: {
    // Set current deal for transaction view
    setCurrentDeal: (state, action) => {
      const { dealId, finalPrice } = action.payload;
      state.currentDealSummary.dealId = dealId;
      state.currentDealSummary.finalPrice = finalPrice || 0;
      
      // Load transactions if available
      const transactions = state.transactionsByDeal[dealId] || [];
      state.currentDealSummary.transactions = transactions;
      
      // Calculate totals
      const totals = calculateTotals(transactions);
      state.currentDealSummary.totalPaid = totals.paid;
      state.currentDealSummary.totalPending = totals.pending;
    },
    
    // Clear current deal
    clearCurrentDeal: (state) => {
      state.currentDealSummary = {
        dealId: null,
        finalPrice: 0,
        totalPaid: 0,
        totalPending: 0,
        transactions: []
      };
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Add Transaction
    builder
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        const { dealId, transaction } = action.payload;
        
        // Add to transactionsByDeal
        if (!state.transactionsByDeal[dealId]) {
          state.transactionsByDeal[dealId] = [];
        }
        state.transactionsByDeal[dealId].push(transaction);
        
        // Update current deal summary if it's the active deal
        if (state.currentDealSummary.dealId === dealId) {
          state.currentDealSummary.transactions.push(transaction);
          const totals = calculateTotals(state.currentDealSummary.transactions);
          state.currentDealSummary.totalPaid = totals.paid;
          state.currentDealSummary.totalPending = totals.pending;
        }
        
        state.loading = false;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Complete Transaction
    builder
      .addCase(completeTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTransaction.fulfilled, (state, action) => {
        const { transactionId, transaction } = action.payload;
        
        // Update in transactionsByDeal
        Object.keys(state.transactionsByDeal).forEach(dealId => {
          const index = state.transactionsByDeal[dealId].findIndex(t => t.id === transactionId);
          if (index !== -1) {
            state.transactionsByDeal[dealId][index] = transaction;
            
            // Update current deal summary if it's the active deal
            if (state.currentDealSummary.dealId === parseInt(dealId)) {
              const summaryIndex = state.currentDealSummary.transactions.findIndex(t => t.id === transactionId);
              if (summaryIndex !== -1) {
                state.currentDealSummary.transactions[summaryIndex] = transaction;
                const totals = calculateTotals(state.currentDealSummary.transactions);
                state.currentDealSummary.totalPaid = totals.paid;
                state.currentDealSummary.totalPending = totals.pending;
              }
            }
          }
        });
        
        state.loading = false;
      })
      .addCase(completeTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Transaction History
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        const { dealId, finalPrice, transactions } = action.payload;
        const validTransactions = transactions || [];
        
        // Store in transactionsByDeal
        state.transactionsByDeal[dealId] = validTransactions;
        
        // Update current deal summary if it's the active deal
        if (state.currentDealSummary.dealId === dealId) {
          state.currentDealSummary.finalPrice = finalPrice;
          state.currentDealSummary.transactions = validTransactions;
          const totals = calculateTotals(validTransactions);
          state.currentDealSummary.totalPaid = totals.paid;
          state.currentDealSummary.totalPending = totals.pending;
        }
        
        state.loading = false;
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Helper function to calculate totals
const calculateTotals = (transactions) => {
  let paid = 0;
  let pending = 0;
  
  if (!transactions || !Array.isArray(transactions)) {
    return { paid, pending };
  }
  
  transactions.forEach(transaction => {
    const amount = parseFloat(transaction.amount) || 0;
    if (transaction.status === 'Completed') {
      paid += amount;
    } else if (transaction.status === 'Pending') {
      pending += amount;
    }
  });
  
  return { paid, pending };
};

export const {
  setCurrentDeal,
  clearCurrentDeal,
  clearError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
