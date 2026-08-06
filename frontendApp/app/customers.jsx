import { useEffect, useCallback, useMemo } from 'react';
import { View, InteractionManager } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import AddModal from '../src/Modal and Sheets/AddModal';
import CustomersList from '../src/Views/CustomersList';

// Redux actions
import { 
  fetchCustomers,
  createCustomer,
  updateCustomer,
  updateCustomerStageAPI,
  updateCustomerStage,
  updateCustomerProperties,
  deleteCustomer,
  clearSelectedCustomer, 
  setSelectedCustomer, 
  updateCustomerStatus,
  setLoading,
  setError
} from '../src/store/slices/customersSlice';
import { addDeal, setSelectedDeal, fetchDeals } from '../src/store/slices/dealsSlice';
import { addFollowUp, deleteFollowUp, updateFollowUp } from '../src/store/slices/followUpsSlice';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '../src/store/slices/uiSlice';

// API
import { customersAPI, tasksAPI, visitsAPI, dealsAPI } from '../src/config/api';
import { showToast } from '../src/utils/toast';

export default function Customers() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { properties } = useSelector(state => state.properties);
  const { customers, selectedCustomer, loading } = useSelector(state => state.customers);
  const { deals } = useSelector(state => state.deals);
  const { followUps } = useSelector(state => state.followUps);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  // Fetch tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getAll({ status: 'All' });
      if (response.data.success) {
        const transformedTasks = response.data.data.map(task => {
          let propertyIds = [];
          if (task.site_visit_properties && Array.isArray(task.site_visit_properties)) {
            propertyIds = task.site_visit_properties.map(p => p.property_id);
          } else if (task.property_id) {
            propertyIds = [task.property_id];
          }

          return {
            id: task.id,
            customerId: task.client_id,
            clientNameFallback: task.client?.name || task.client?.full_name || task.client_name,
            propertyIds: propertyIds,
            type: task.task_type || 'Meeting',
            date: task.due_date,
            note: task.description || '',
            status: task.status === 'completed' ? 'Done' : 'Pending',
            siteVisitId: task.site_visit_id,
            propertyCount: task.site_visit_property_count || 0,
            siteVisitProperties: task.site_visit_properties || []
          };
        });
        dispatch({ type: 'followUps/setFollowUps', payload: transformedTasks });
      }
    } catch (error) {
      console.error('Error fetching tasks in customers:', error);
    }
  }, [dispatch]);

  // Fetch customers and tasks on component mount and when screen comes into focus
  useEffect(() => {
    dispatch(fetchCustomers()); // Use Redux thunk
    dispatch(fetchDeals()); // Using Redux thunk
    fetchTasks();
    
    // Add focus listener to refresh data when returning to this screen
    const unsubscribe = router.addListener?.('focus', () => {
      InteractionManager.runAfterInteractions(() => {
        dispatch(fetchCustomers()); // Use Redux thunk
        dispatch(fetchDeals()); // Using Redux thunk
        fetchTasks();
      });
    });
    
  }, [fetchTasks]);

  // Redirect to full-page route when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      const dealStages = ['In-Process', 'Negotiation', 'Token', 'Settlement', 'Agreement', 'Completed'];
      const isInDealStage = dealStages.includes(selectedCustomer.stage);
      const customerDeal = deals.find(d => d.customerId === selectedCustomer.id);

      if (isInDealStage && customerDeal) {
        dispatch(setSelectedDeal(customerDeal));
        dispatch(clearSelectedCustomer());
        router.push('/deal-page');
      } else {
        router.push('/customer-detail');
      }
    }
  }, [selectedCustomer, deals, dispatch, router]);

  // 🚀 Memoized Handlers for List (Prevents List Re-renders)
  const handleAddCustomer = useCallback(() => {
    dispatch(clearEditItem());
    dispatch(setModalType('Customer'));
    setTimeout(() => {
      dispatch(setModalOpen(true));
    }, 50);
  }, [dispatch]);

  const handleEditCustomer = useCallback((customer) => {
    const editData = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      listingType: customer.requirementType === 'Rent' ? 'Rent/Lease' : 'Buy',
      category: customer.propertyCategory,
      type: customer.propertyType,
      bhk: customer.configuration,
      commercialConfig: customer.configuration,
      furnishing: customer.furnishingStatus,
      preferredLocation: customer.preferredLocation,
      details: customer.notes,
      budgetMin: customer.budgetMin,
      budgetMax: customer.budgetMax,
    };
    dispatch(setEditItem(editData));
    dispatch(setModalType('Customer'));
    setTimeout(() => {
      dispatch(setModalOpen(true));
    }, 50);
  }, [dispatch]);

  const handleSelectCustomer = useCallback((customer) => {
    dispatch(setSelectedCustomer(customer));
  }, [dispatch]);

  const handleOpenDealFromList = useCallback((customer) => {
    const customerDeal = deals.find(d => d.customerId === customer.id);
    if (customerDeal) {
      dispatch(setSelectedDeal(customerDeal));
      router.push('/deal-page');
    } else {
      const mockDeal = {
        id: 99,
        customerId: customer.id,
        propertyId: 'p1',
        stage: 'Negotiation',
        status: 'Negotiation',
        startedAt: new Date().toISOString(),
        meetings: []
      };
      dispatch(addDeal(mockDeal));
      dispatch(setSelectedDeal(mockDeal));
      router.push('/deal-page');
    }
  }, [deals, dispatch, router]);

  // 🚀 Memoized Modal Actions
  const handleAdd = useCallback(async (data) => {
    try {
      await dispatch(createCustomer({
        name: data.name || '',
        phone: data.phone || '',
        requirementType: data.listingType === 'Buy' ? 'Buy' : 'Rent',
        propertyCategory: data.category || 'Residential',
        propertyType: data.type || '',
        configuration: data.bhk || data.commercialConfig || null,
        furnishingStatus: data.furnishing || null,
        budgetMin: data.budgetMin || 0,
        budgetMax: data.budgetMax || 0,
        preferredLocation: data.preferredLocation || '',
        notes: data.details || ''
      })).unwrap();

      dispatch(setModalOpen(false));
      showToast.success('Customer added successfully!');
      dispatch(fetchCustomers()); // Refresh list
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast.error(error || 'Failed to add customer.');
    }
  }, [dispatch]);

  const handleUpdate = useCallback(async (updatedItem) => {
    if (modalType === 'FollowUp') {
      try {
        const updateData = {
          client_id: updatedItem.clientId,
          property_id: updatedItem.propertyIds?.[0] || null,
          task_type: updatedItem.type || updatedItem.task_type,
          schedule_date: updatedItem.date?.split('T')[0] || updatedItem.due_date?.split('T')[0],
          schedule_time: updatedItem.date?.split('T')[1]?.substring(0, 5) || updatedItem.due_date?.split('T')[1]?.substring(0, 5) || '10:00',
          notes: updatedItem.note || updatedItem.description || '',
          title: updatedItem.title
        };

        const response = await tasksAPI.update(updatedItem.id, updateData);
        if (response.data.success) {
          showToast.success('Task updated successfully!');
          await fetchTasks(); // Refresh tasks
          dispatch(clearEditItem());
          dispatch(setModalOpen(false));
        }
      } catch (error) {
        showToast.error(error.response?.data?.message || 'Failed to update task');
      }
    } else if (modalType === 'Customer') {
      try {
        await dispatch(updateCustomer({
          id: updatedItem.id,
          data: {
            name: updatedItem.name || '',
            phone: updatedItem.phone || '',
            requirementType: updatedItem.listingType === 'Buy' ? 'Buy' : 'Rent',
            propertyCategory: updatedItem.category || 'Residential',
            propertyType: updatedItem.type || '',
            configuration: updatedItem.bhk || updatedItem.commercialConfig || null,
            furnishingStatus: updatedItem.furnishing || null,
            budgetMin: updatedItem.budgetMin || 0,
            budgetMax: updatedItem.budgetMax || 0,
            preferredLocation: updatedItem.preferredLocation || '',
            notes: updatedItem.details || '',
            selectedProperties: updatedItem.selectedProperties || [],
            interestedProperties: updatedItem.interestedProperties || [],
            holdProperties: updatedItem.holdProperties || []
          }
        })).unwrap();

        dispatch(clearEditItem());
        dispatch(setModalOpen(false));
        showToast.success('Customer updated successfully!');
        dispatch(fetchCustomers()); // Refresh list
      } catch (error) {
        showToast.error(error || 'Failed to update customer.');
      }
    }
  }, [modalType, dispatch, fetchTasks]);

  // 🚀 Memoized Detail Sheet Handlers
  const handleAddFollowUpFromCustomer = useCallback(async (taskData) => {
    try {
      if (taskData && taskData.customerId) {
        if ((taskData.type === 'Site Visit' || taskData.type === 'Visit') && taskData.propertyIds?.length > 0) {
          const visitResponse = await visitsAPI.create({
            client_id: taskData.customerId,
            property_ids: taskData.propertyIds,
            scheduled_date: taskData.date.split('T')[0],
            scheduled_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00'
          });

          if (visitResponse.data.success) {
            showToast.success('Site visit scheduled!');
            const tasksResponse = await tasksAPI.getAll({ status: 'All' });
            if (tasksResponse.data.success) {
              const transformedTasks = tasksResponse.data.data.map(task => ({
                id: task.id,
                customerId: task.client_id,
                propertyIds: task.property_id ? [task.property_id] : [],
                type: task.task_type || 'Meeting',
                date: task.due_date,
                note: task.description || '',
                status: task.status === 'completed' ? 'Done' : 'Pending',
                siteVisitId: task.site_visit_id,
                propertyCount: task.site_visit_property_count || 0
              }));
              dispatch({ type: 'followUps/setFollowUps', payload: transformedTasks });
            }
          }
        } else {
          const taskResponse = await tasksAPI.create({
            client_id: taskData.customerId,
            property_id: taskData.propertyIds?.[0] || null,
            task_type: taskData.type || 'Meeting',
            schedule_date: taskData.date.split('T')[0],
            schedule_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00',
            notes: taskData.note || ''
          });

          if (taskResponse.data.success) {
            showToast.success('Task created!');
            const newTask = {
              id: taskResponse.data.data.id,
              customerId: taskData.customerId,
              propertyIds: taskData.propertyIds || [],
              type: taskData.type,
              date: taskData.date,
              note: taskData.note || '',
              status: 'Pending'
            };
            dispatch(addFollowUp(newTask));
          }
        }
      } else {
        dispatch(setEditItem({ customerId: taskData?.id }));
        dispatch(setModalType('FollowUp'));
        dispatch(setModalOpen(true));
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create task');
    }
  }, [dispatch]);

  const handleEditTask = useCallback((task) => {
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  }, [dispatch]);

  const handleDeleteTask = useCallback((taskId) => {
    dispatch(deleteFollowUp(taskId));
  }, [dispatch]);

  const handleStartDeal = useCallback(async (customer, property) => {
    try {
      const response = await dealsAPI.create({
        client_id: customer.id,
        property_id: property.id
      });

      if (response.data.success) {
        showToast.success(response.data.message || 'Deal started successfully!');
        const newDeal = {
          id: response.data.data.id,
          customerId: customer.id,
          propertyId: property.id,
          stage: response.data.data.status || 'Interested',
          startedAt: response.data.data.created_at,
          meetings: []
        };
        dispatch(addDeal(newDeal));
        dispatch(clearSelectedCustomer());
        dispatch(setSelectedDeal(newDeal));
        router.push('/deal-page');
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to start deal.');
    }
  }, [dispatch, router]);

  const handleUpdateStatus = useCallback((id, status) => {
    dispatch(updateCustomerStatus({ id, status }));
  }, [dispatch]);

  const handleUpdateStage = useCallback(async (id, stage) => {
    const previousStage = selectedCustomer?.stage || 'New';
    // 1. Optimistic Update (Immediate UI response)
    dispatch(updateCustomerStage({ id, stage }));

    try {
      // 2. Call API silently in background
      await dispatch(updateCustomerStageAPI({ id, stage })).unwrap();
    } catch (error) {
      // 3. Rollback on failure
      dispatch(updateCustomerStage({ id, stage: previousStage }));
      showToast.error(error || 'Failed to update stage');
    }
  }, [dispatch, selectedCustomer]);

  const handleSelectProperties = useCallback(async (id, selectedProperties, interestedProperties, holdProperties) => {
    try {
      const updateData = { selectedProperties };
      if (interestedProperties !== undefined) updateData.interestedProperties = interestedProperties;
      if (holdProperties !== undefined) updateData.holdProperties = holdProperties;
      
      await dispatch(updateCustomerProperties({ id, data: updateData })).unwrap();
    } catch (error) {
      console.error('Error updating properties:', error);
      showToast.error('Failed to update properties');
    }
  }, [dispatch]);

  const handleOpenDealFromSheet = useCallback((deal) => {
    dispatch(setSelectedDeal(deal));
    router.push('/deal-page');
  }, [dispatch, router]);

  const handleCloseSheet = useCallback(() => {
    dispatch(clearSelectedCustomer());
  }, [dispatch]);

  const handleCloseModal = useCallback(() => {
    dispatch(setModalOpen(false));
  }, [dispatch]);

  const handleDeleteCustomer = useCallback(async (id) => {
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      showToast.success('Client deleted successfully');
    } catch (error) {
      showToast.error(error || 'Failed to delete client');
    }
  }, [dispatch]);

  const mappedCustomers = useMemo(() => {
    return (customers || []).map(cust => {
      const isCollab = cust.name?.includes('Arin') || cust.name?.includes('Karan') || cust.collaborated;
      if (isCollab) {
        return {
          ...cust,
          collaborated: true,
          stage: 'In-Process'
        };
      }
      return cust;
    });
  }, [customers]);

  return (
    <View className="flex-1 bg-gray-50">
      <CustomersList
        customers={mappedCustomers}
        loading={loading}
        onSelect={handleSelectCustomer}
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onOpenDeal={handleOpenDealFromList}
      />

      <AddModal
        isOpen={modalOpen && (modalType === 'FollowUp' || modalType === 'Customer')}
        type={modalType}
        onClose={handleCloseModal}
        onSave={handleAdd}
        onUpdate={handleUpdate}
        editItem={editItem}
        properties={properties}
        customers={customers}
        initialCustomer={selectedCustomer}
      />

    </View>
  );
}