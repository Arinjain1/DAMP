import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistence middleware for AsyncStorage
export const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save specific slices to AsyncStorage
  const state = store.getState();
  
  // Save properties
  if (action.type.startsWith('properties/')) {
    AsyncStorage.setItem('b1_properties', JSON.stringify(state.properties.properties));
  }
  
  // Save customers
  if (action.type.startsWith('customers/')) {
    AsyncStorage.setItem('b1_customers', JSON.stringify(state.customers.customers));
  }
  
  // Save followUps
  if (action.type.startsWith('followUps/')) {
    AsyncStorage.setItem('b1_followups', JSON.stringify(state.followUps.followUps));
  }
  
  // Save deals
  if (action.type.startsWith('deals/')) {
    AsyncStorage.setItem('b1_deals', JSON.stringify(state.deals.deals));
  }
  
  // Save subscription
  if (action.type.startsWith('subscription/')) {
    AsyncStorage.setItem('b1_subscription', JSON.stringify(state.subscription.subscription));
  }
  
  return result;
};

// Load data from AsyncStorage
export const loadPersistedData = async () => {
  try {
    const [properties, customers, followUps, deals, subscription] = await Promise.all([
      AsyncStorage.getItem('b1_properties'),
      AsyncStorage.getItem('b1_customers'),
      AsyncStorage.getItem('b1_followups'),
      AsyncStorage.getItem('b1_deals'),
      AsyncStorage.getItem('b1_subscription'),
    ]);

    return {
      properties: properties ? JSON.parse(properties) : null,
      customers: customers ? JSON.parse(customers) : null,
      followUps: followUps ? JSON.parse(followUps) : null,
      deals: deals ? JSON.parse(deals) : null,
      subscription: subscription ? JSON.parse(subscription) : null,
    };
  } catch (error) {
    console.error('Failed to load persisted data:', error);
    return {};
  }
};

// Clear all persisted data
export const clearPersistedData = async () => {
  try {
    await AsyncStorage.multiRemove([
      'b1_properties',
      'b1_customers', 
      'b1_followups',
      'b1_deals',
      'b1_subscription'
    ]);
  } catch (error) {
    console.error('Failed to clear persisted data:', error);
  }
};