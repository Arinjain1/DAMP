import { useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import AddModal from '../src/Modal and Sheets/AddModal';
import CustomerDetailSheet from '../src/Modal and Sheets/CustomerDetailSheet';
import CustomersList from '../src/Views/CustomersList';

// Redux actions
import { addCustomer, clearSelectedCustomer, setSelectedCustomer, updateCustomer, updateCustomerStatus, setCustomers, setLoading, setError } from '../src/store/slices/customersSlice';
import { addDeal, clearSelectedDeal, closeDeal, setSelectedDeal, updateDeal, setDeals } from '../src/store/slices/dealsSlice';
import { addFollowUp, deleteFollowUp, updateFollowUp } from '../src/store/slices/followUpsSlice';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '../src/store/slices/uiSlice';

// API
import { customersAPI, tasksAPI, visitsAPI, dealsAPI } from '../src/config/api';

export default function Customers() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { properties } = useSelector(state => state.properties);
  const { customers, selectedCustomer, loading } = useSelector(state => state.customers);
  const { deals, selectedDeal } = useSelector(state => state.deals);
  const { followUps } = useSelector(state => state.followUps);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    fetchDeals();
  }, []);

  const fetchCustomers = async () => {
    try {
      dispatch(setLoading(true));
      const response = await customersAPI.getAll();
      
      if (response.data.success) {
        
        
        // Map backend data to frontend format
        const mappedCustomers = response.data.data.map(client => {
          // Use status directly as stage (backend already has proper status values)
          const stage = client.status || 'New Lead';
          
          
          
          return {
            id: client.id,
            name: client.name,
            phone: client.phone,
            status: client.status,
            stage: stage,
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
          };
        });
        
        
        dispatch(setCustomers(mappedCustomers));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customers'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await dealsAPI.getAll();
      
      if (response.data.success) {
        
        
        // Map backend deals to frontend format
        const mappedDeals = response.data.data.map(deal => ({
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
        
       
        
        // Set all deals at once using setDeals
        dispatch(setDeals(mappedDeals));
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleAddCustomer = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('Customer'));
    // Add a small delay to ensure smooth animation
    setTimeout(() => {
      dispatch(setModalOpen(true));
    }, 50);
  };

  const handleEditCustomer = (customer) => {
    
    
    // Map customer data to form format
    const editData = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      listingType: customer.requirement === 'Rent' ? 'Rent/Lease' : 'Buy',
      category: customer.category,
      type: customer.type,
      bhk: customer.bhk,
      commercialConfig: customer.bhk,
      furnishing: customer.furnishing,
      preferredLocation: customer.location,
      details: customer.notes,
      budgetMin: customer.budgetMin,
      budgetMax: customer.budgetMax,
    };
    
   
    
    dispatch(setEditItem(editData));
    dispatch(setModalType('Customer'));
    setTimeout(() => {
      dispatch(setModalOpen(true));
    }, 50);
  };

  const handleAdd = async (data) => {
    try {
      // Map customer form data to API structure
      const apiPayload = {
        name: data.name || '',
        phone: data.phone || '',
        requirement_type: data.listingType === 'Buy' ? 'Buy' : 'Rent',
        property_category: data.category || 'Residential',
        property_type: data.type || '',
        configuration: data.bhk || data.commercialConfig || null,
        furnishing_status: data.furnishing || null,
        budget_min: data.budgetMin || 0,
        budget_max: data.budgetMax || 0,
        preferred_location: data.preferredLocation || '',
        notes: data.details || '',
      };

      const response = await customersAPI.create(apiPayload);
      
      if (response.data.success) {
        // Map backend response to frontend format
        const mappedCustomer = {
          id: response.data.data.id,
          name: response.data.data.name,
          phone: response.data.data.phone,
          status: response.data.data.status,
          requirement: response.data.data.requirement_type,
          category: response.data.data.property_category,
          type: response.data.data.property_type,
          bhk: response.data.data.configuration,
          furnishing: response.data.data.furnishing_status,
          budgetMin: response.data.data.budget_min,
          budgetMax: response.data.data.budget_max,
          location: response.data.data.preferred_location,
          notes: response.data.data.notes,
        };
        
        dispatch(addCustomer(mappedCustomer));
        dispatch(setModalOpen(false));
        Alert.alert('Success', 'Customer added successfully!');
        // Refresh customers list
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add customer. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleUpdate = async (updatedItem) => {
    
    
    if (modalType === 'FollowUp') {
      try {
        // Prepare data for API
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
          dispatch(updateFollowUp(response.data.data));
          dispatch(clearEditItem());
          dispatch(setModalOpen(false));
          Alert.alert('Success', 'Task updated successfully!');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
      }
    } else if (modalType === 'Customer') {
      try {
        // Map form data to API structure
        const apiPayload = {
          name: updatedItem.name || '',
          phone: updatedItem.phone || '',
          requirement_type: updatedItem.listingType === 'Buy' ? 'Buy' : 'Rent',
          property_category: updatedItem.category || 'Residential',
          property_type: updatedItem.type || '',
          configuration: updatedItem.bhk || updatedItem.commercialConfig || null,
          furnishing_status: updatedItem.furnishing || null,
          budget_min: updatedItem.budgetMin || 0,
          budget_max: updatedItem.budgetMax || 0,
          preferred_location: updatedItem.preferredLocation || '',
          notes: updatedItem.details || '',
        };

        

        const response = await customersAPI.update(updatedItem.id, apiPayload);
        
        
        
        if (response.data.success) {
          // Map backend response to frontend format
          const mappedCustomer = {
            id: response.data.data.id,
            name: response.data.data.name,
            phone: response.data.data.phone,
            status: response.data.data.status,
            requirement: response.data.data.requirement_type,
            category: response.data.data.property_category,
            type: response.data.data.property_type,
            bhk: response.data.data.configuration,
            furnishing: response.data.data.furnishing_status,
            budgetMin: response.data.data.budget_min,
            budgetMax: response.data.data.budget_max,
            location: response.data.data.preferred_location,
            notes: response.data.data.notes,
          };
          
          dispatch(updateCustomer(mappedCustomer));
          dispatch(clearEditItem());
          dispatch(setModalOpen(false));
          Alert.alert('Success', 'Customer updated successfully!');
          fetchCustomers();
        }
      } catch (error) {
        console.error('=== Error updating customer ===', error);
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.message || 'Failed to update customer. Please try again.';
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleAddFollowUpFromCustomer = async (taskData) => {
    try {
      // If taskData is a full task object, create it in backend
      if (taskData && taskData.customerId) {
        // Check if it's a site visit with multiple properties
        if ((taskData.type === 'Site Visit' || taskData.type === 'Visit') && taskData.propertyIds?.length > 0) {
          // Create site visit (this will also create task in backend)
          const visitResponse = await visitsAPI.create({
            client_id: taskData.customerId,
            property_ids: taskData.propertyIds,
            scheduled_date: taskData.date.split('T')[0],
            scheduled_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00'
          });
          
          if (visitResponse.data.success) {
            Alert.alert('Success', 'Site visit scheduled!');
            
            // Fetch updated tasks and add to Redux
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
              
              // Update Redux with all tasks
              dispatch({ type: 'followUps/setFollowUps', payload: transformedTasks });
            }
          }
        } else {
          // Create regular task
          const taskResponse = await tasksAPI.create({
            client_id: taskData.customerId,
            property_id: taskData.propertyIds?.[0] || null,
            task_type: taskData.type || 'Meeting',
            schedule_date: taskData.date.split('T')[0],
            schedule_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00',
            notes: taskData.note || ''
          });
          
          if (taskResponse.data.success) {
            Alert.alert('Success', 'Task created!');
            
            // Transform and add to Redux for immediate UI update
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
        // Otherwise, open modal for adding new task
        dispatch(setEditItem({ customerId: taskData?.id })); 
        dispatch(setModalType('FollowUp'));
        dispatch(setModalOpen(true));
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
    
  };

  const handleDeleteTask = (taskId) => {
    dispatch(deleteFollowUp(taskId));
  };

  const handleStartDeal = async (customer, property) => {
    try {
      // Call backend API to create deal
      const response = await dealsAPI.create({
        client_id: customer.id,
        property_id: property.id
      });

      if (response.data.success) {
        Alert.alert('Success', response.data.message || 'Deal started successfully!');
        
        // Add deal to Redux
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
        
        // Navigate to deal page
        router.push('/deal-page');
      }
    } catch (error) {
      console.error('Error starting deal:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start deal. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleUpdateDeal = (id, updatedDeal) => {
    dispatch(updateDeal({ id, deal: updatedDeal }));
  };

  const handleCloseDeal = (deal) => {
    dispatch(closeDeal(deal.id));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <CustomersList 
        customers={customers} 
        loading={loading}
        onSelect={(customer) => dispatch(setSelectedCustomer(customer))} 
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
        onOpenDeal={(customer) => {
          
          // Find the deal for this customer
          const customerDeal = deals.find(d => d.customerId === customer.id);
          
          
          if (customerDeal) {
            dispatch(setSelectedDeal(customerDeal));
            router.push('/deal-page');
          } else {
            
            // If no deal found, open customer details
            dispatch(setSelectedCustomer(customer));
          }
        }}
      />

      <AddModal 
        isOpen={modalOpen} 
        type={modalType} 
        onClose={() => {
         
          dispatch(setModalOpen(false));
        }} 
        onSave={handleAdd} 
        onUpdate={handleUpdate} 
        editItem={editItem} 
        properties={properties} 
        customers={customers} 
        initialCustomer={selectedCustomer} 
      />
      
      {selectedCustomer && (
        (() => {
          // Check if customer is In-Process and has a deal
          const isInProcess = selectedCustomer.stage === 'In-Process';
          const customerDeal = deals.find(d => d.customerId === selectedCustomer.id);
          
          
          
          // If In-Process and has deal, open deal page directly
          if (isInProcess && customerDeal) {
            
            dispatch(setSelectedDeal(customerDeal));
            dispatch(clearSelectedCustomer());
            router.push('/deal-page');
            return null;
          }
          
          // Otherwise show customer detail sheet
          return (
            <CustomerDetailSheet 
              customer={selectedCustomer} 
              onClose={() => dispatch(clearSelectedCustomer())} 
              properties={properties} 
              activeDeals={deals} 
              followUps={followUps} 
              onAddFollowUp={handleAddFollowUpFromCustomer} 
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateStatus={(id, status) => dispatch(updateCustomerStatus({ id, status }))}
              onUpdateStage={async (id, stage) => {
                try {
                  const response = await customersAPI.updateStage(id, stage);
                  if (response.data.success) {
                    const customer = customers.find(c => c.id === id);
                    if (customer) {
                      dispatch(updateCustomer({ ...customer, stage }));
                    }
                    Alert.alert('Success', `Moved to ${stage}`);
                  }
                } catch (error) {
                  console.error('Error updating stage:', error);
                  Alert.alert('Error', error.response?.data?.message || 'Failed to update stage');
                }
              }}
              onSelectProperties={(id, selectedProperties, interestedProperties, holdProperties) => {
                const customer = customers.find(c => c.id === id);
                if (customer) {
                  const updates = { selectedProperties };
                  if (interestedProperties !== undefined) {
                    updates.interestedProperties = interestedProperties;
                  }
                  if (holdProperties !== undefined) {
                    updates.holdProperties = holdProperties;
                  }
                  dispatch(updateCustomer({ ...customer, ...updates }));
                }
              }}
              onStartDeal={handleStartDeal}
              onOpenDeal={(deal) => {
                dispatch(setSelectedDeal(deal));
                router.push('/deal-page');
              }}
            />
          );
        })()
      )}
    </View>
  );
}