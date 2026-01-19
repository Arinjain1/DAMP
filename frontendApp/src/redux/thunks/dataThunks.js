import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Alert } from 'react-native';

// Import actions
import { resetCustomers, updateCustomerStatus } from '../slices/customersSlice';
import { closeDeal, resetDeals, startDeal, updateDeal } from '../slices/dealsSlice';
import { resetFollowUps, updateFollowUpStatus } from '../slices/followUpsSlice';
import { resetNotifications } from '../slices/notificationsSlice';
import { resetProperties, setPropertyStatus } from '../slices/propertiesSlice';
import { subscribe } from '../slices/subscriptionSlice';
import { closeFeedback, selectCustomer, selectDeal } from '../slices/uiSlice';

// Reset all data to mock data
export const resetToMockData = createAsyncThunk(
  'data/resetToMockData',
  async (_, { dispatch }) => {
    try {
      await AsyncStorage.multiRemove(['b1_properties', 'b1_customers', 'b1_followups', 'b1_deals']);
      
      dispatch(resetProperties());
      dispatch(resetCustomers());
      dispatch(resetFollowUps());
      dispatch(resetDeals());
      dispatch(resetNotifications());
      
      Alert.alert("Success", "Data reset to mock data!");
    } catch (error) {
      console.error("Failed to reset data", error);
      throw error;
    }
  }
);

// Handle subscription
export const handleSubscribe = createAsyncThunk(
  'subscription/handleSubscribe',
  async (plan, { dispatch }) => {
    try {
      dispatch(subscribe({ plan }));
      Alert.alert("Success", "Payment Successful! Welcome to BrokerOne Pro.");
    } catch (error) {
      console.error("Failed to subscribe", error);
      throw error;
    }
  }
);

// Handle deal operations
export const handleStartDeal = createAsyncThunk(
  'deals/handleStartDeal',
  async ({ customer, property }, { dispatch }) => {
    try {
      dispatch(startDeal({ customer, property }));
      dispatch(selectCustomer(null));
      
      // Get the newly created deal (this is a simplified approach)
      // In a real app, you'd return the deal ID from the action
      const newDealId = Math.random().toString(36).substr(2, 9);
      dispatch(selectDeal({ id: newDealId, customerId: customer.id, propertyId: property.id }));
    } catch (error) {
      console.error("Failed to start deal", error);
      throw error;
    }
  }
);

export const handleCloseDeal = createAsyncThunk(
  'deals/handleCloseDeal',
  async (deal, { dispatch }) => {
    try {
      dispatch(closeDeal(deal.id));
      dispatch(setPropertyStatus({ id: deal.propertyId, status: 'Sold' }));
      dispatch(updateCustomerStatus({ id: deal.customerId, status: 'Closed' }));
      
      Alert.alert("Success", "Deal Closed Successfully!");
    } catch (error) {
      console.error("Failed to close deal", error);
      throw error;
    }
  }
);

export const handleSubmitFeedback = createAsyncThunk(
  'deals/handleSubmitFeedback',
  async (feedbackData, { dispatch, getState }) => {
    try {
      const { deals } = getState();
      const existingDeal = deals.items.find(
        d => d.customerId === feedbackData.customer.id && d.propertyId === feedbackData.property.id
      );
      
      if (existingDeal) {
        const stage = feedbackData.feedback.sentiment === 'interested' ? 'Negotiation' : 
                     feedbackData.feedback.sentiment === 'hold' ? 'Meeting' : 'Dropped';
        
        dispatch(updateDeal({
          ...existingDeal,
          stage,
          visits: [...(existingDeal.visits || []), feedbackData.feedback]
        }));
      } else {
        if (feedbackData.feedback.sentiment !== 'not_interested') {
          dispatch(handleStartDeal({ 
            customer: feedbackData.customer, 
            property: feedbackData.property 
          }));
        }
      }

      if (feedbackData.taskId) {
        dispatch(updateFollowUpStatus({ id: feedbackData.taskId, status: 'Done' }));
      }

      dispatch(closeFeedback());
      Alert.alert("Success", "Feedback Recorded Successfully!");
    } catch (error) {
      console.error("Failed to submit feedback", error);
      throw error;
    }
  }
);