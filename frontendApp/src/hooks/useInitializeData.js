import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCustomers } from '../store/slices/customersSlice';
import { setDeals } from '../store/slices/dealsSlice';
import { customersAPI, dealsAPI } from '../config/api';

/**
 * Hook to initialize app data from the backend
 * Fetches customers and deals on mount
 */
export const useInitializeData = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch customers
        const customersResponse = await customersAPI.getAll();
        if (customersResponse.data.success) {
          const mappedCustomers = customersResponse.data.data.map(client => ({
            id: client.id,
            name: client.name,
            phone: client.phone,
            status: client.status,
            stage: client.status || 'New Lead',
            requirement: client.requirement_type,
            category: client.property_category,
            type: client.property_type,
            bhk: client.configuration,
            furnishing: client.furnishing_status,
            budgetMin: client.budget_min,
            budgetMax: client.budget_max,
            location: client.preferred_location,
            notes: client.notes,
            createdAt: client.created_at,
            selectedProperties: client.selectedProperties || [],
            interestedProperties: client.interestedProperties || [],
            holdProperties: client.holdProperties || [],
            activeDealCount: client.active_deal_count || 0,
            nextTask: client.next_task,
          }));
          dispatch(setCustomers(mappedCustomers));
        }

        // Fetch deals
        const dealsResponse = await dealsAPI.getAll();
        if (dealsResponse.data.success) {
          const mappedDeals = dealsResponse.data.data.map(deal => ({
            id: deal.id,
            customerId: deal.client_id,
            propertyId: deal.property_id,
            stage: deal.status,
            status: deal.status,
            startedAt: deal.created_at,
            finalPrice: deal.final_price,
            tokenAmount: deal.token_amount,
            meetings: []
          }));
          dispatch(setDeals(mappedDeals));
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, [dispatch]);
};
