import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCustomers } from '../store/slices/customersSlice';
import { setDeals } from '../store/slices/dealsSlice';
import { customersAPI, dealsAPI } from '../config/api';

/**
 * Hook to initialize app data from the backend
 * Fetches customers and deals on mount
 * Only runs when user is authenticated with a valid token
 */
export const useInitializeData = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only fetch if authenticated and token exists
    if (!isAuthenticated || !user?.token) {
      return;
    }

    const fetchInitialData = async () => {
      try {
        // Fetch customers
        const customersResponse = await customersAPI.getAll();
        if (customersResponse.data.success) {
          const mappedCustomers = customersResponse.data.data.map(client => ({
            id: client.id,
            name: client.name,
            phone: client.phone,
            stage: client.status || 'New',
            requirementType: client.requirement_type,
            propertyCategory: client.property_category,
            propertyType: client.property_type,
            configuration: client.configuration,
            furnishingStatus: client.furnishing_status,
            budgetMin: client.budget_min,
            budgetMax: client.budget_max,
            preferredLocation: client.preferred_location,
            city: client.city,
            state: client.state,
            pincode: client.pincode,
            notes: client.notes,
            createdAt: client.created_at,
            updatedAt: client.updated_at,
            selectedProperties: client.selected_properties || client.selectedProperties || [],
            interestedProperties: client.interested_properties || client.interestedProperties || [],
            holdProperties: client.hold_properties || client.holdProperties || [],
            activeDealCount: client.active_deal_count || 0,
            nextTask: client.next_task,
            image: client.profile_image || null,
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
        // Silently fail - the dashboard will handle retries if needed
      }
    };

    // Delay to ensure token is properly set in API headers after login
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated, user?.token]);
};
