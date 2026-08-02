import { syncDealStageWithCustomer } from '../slices/dealsSlice';
import { updateCustomerStage } from '../slices/customersSlice';

/**
 * Middleware to synchronize stage changes between customers and deals
 * Ensures bidirectional consistency when either customer or deal stage is updated
 */
const stageSyncMiddleware = (store) => (next) => (action) => {
  // Execute the action first
  const result = next(action);

  // Get current state after action
  const state = store.getState();

  // Handle customer stage updates - sync to deal
  if (
    action.type === 'customers/updateCustomerStage' ||
    action.type === 'customers/updateStage/fulfilled' ||
    action.type === 'customers/transitionToInProcess' ||
    action.type === 'customers/completeAgreement'
  ) {
    const customerId = action.payload.id || action.payload;
    const customer = state.customers.customers.find(c => c.id === customerId);
    
    if (customer) {
      // Find associated deal and sync stage
      const deal = state.deals.deals.find(d => d.customerId === customerId);
      if (deal) {
        store.dispatch(syncDealStageWithCustomer({
          customerId: customerId,
          stage: customer.stage
        }));
      }
    }
  }

  // Handle deal stage updates - sync to customer
  if (action.type === 'deals/updateDealStage') {
    const { id } = action.payload;
    const deal = state.deals.deals.find(d => d.id === id);
    
    if (deal) {
      // Find associated customer and sync stage
      const customer = state.customers.customers.find(c => c.id === deal.customerId);
      if (customer && customer.stage !== deal.stage) {
        store.dispatch(updateCustomerStage({
          id: deal.customerId,
          stage: deal.stage
        }));
      }
    }
  }

  return result;
};

export default stageSyncMiddleware;
