import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import CustomerDetailSheet from '../src/Modal and Sheets/CustomerDetailSheet';
import { 
  clearSelectedCustomer, 
  updateCustomerStage, 
  updateCustomerStageAPI, 
  updateCustomerProperties 
} from '../src/store/slices/customersSlice';
import { addDeal, setSelectedDeal } from '../src/store/slices/dealsSlice';
import { deleteFollowUp, addFollowUp } from '../src/store/slices/followUpsSlice';
import { setEditItem, setModalOpen, setModalType } from '../src/store/slices/uiSlice';
import { showToast } from '../src/utils/toast';
import { dealsAPI, tasksAPI, visitsAPI, customersAPI } from '../src/config/api';

export default function CustomerDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const customer = useSelector(state => state.customers.selectedCustomer);
  const { properties } = useSelector(state => state.properties);

  const handleClose = useCallback(() => {
    dispatch(clearSelectedCustomer());
    router.navigate('/customers');
  }, [dispatch, router]);

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

  const handleStartDeal = useCallback(async (selectedCustomer, selectedProperty) => {
    try {
      if (String(selectedCustomer.id).startsWith('mock-')) {
        const mockNewDeal = {
          id: `mock-deal-${Date.now()}`,
          customerId: selectedCustomer.id,
          propertyId: selectedProperty.id,
          stage: 'In-Process',
          status: 'In-Process',
          startedAt: new Date().toISOString(),
          meetings: [],
          client_name: selectedCustomer.name,
          client_phone: selectedCustomer.phone,
          property_title: selectedProperty.title,
          cover_image_url: selectedProperty.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
          final_price: selectedProperty.price,
          listing_price: selectedProperty.price
        };
        dispatch(addDeal(mockNewDeal));
        dispatch(setSelectedDeal(mockNewDeal));
        dispatch(updateCustomerStage({ id: selectedCustomer.id, stage: 'In-Process' }));
        showToast.success('Deal started successfully!');
        router.push('/deal-page');
        return;
      }

      const response = await dealsAPI.create({
        client_id: selectedCustomer.id,
        property_id: selectedProperty.id
      });

      if (response.data.success) {
        showToast.success('Deal started successfully!');
        const newDeal = {
          id: response.data.data.id,
          customerId: selectedCustomer.id,
          propertyId: selectedProperty.id,
          stage: response.data.data.status || 'Meeting',
          startedAt: response.data.data.created_at,
          meetings: []
        };
        dispatch(addDeal(newDeal));
        dispatch(setSelectedDeal(newDeal));
        router.push('/deal-page');
      }
    } catch (error) {
      showToast.error('Failed to start deal.');
    }
  }, [dispatch, router]);

  const handleOpenDealFromSheet = useCallback((deal) => {
    dispatch(setSelectedDeal(deal));
    router.push('/deal-page');
  }, [dispatch, router]);

  const handleUpdateStage = useCallback(async (id, stage) => {
    const previousStage = customer?.stage || 'New';
    dispatch(updateCustomerStage({ id, stage }));
    try {
      if (!String(id).startsWith('mock-')) {
        await dispatch(updateCustomerStageAPI({ id, stage })).unwrap();
      }
    } catch (error) {
      dispatch(updateCustomerStage({ id, stage: previousStage }));
      showToast.error('Failed to update stage');
    }
  }, [dispatch, customer]);

  const handleSelectProperties = useCallback(async (id, selectedProperties, interestedProperties, holdProperties) => {
    try {
      const updateData = { selectedProperties };
      if (interestedProperties !== undefined) updateData.interestedProperties = interestedProperties;
      if (holdProperties !== undefined) updateData.holdProperties = holdProperties;
      
      if (String(id).startsWith('mock-')) {
        dispatch(updateCustomerProperties({ id, data: updateData }));
        return;
      }

      await customersAPI.updateProperties(id, {
        selected_properties: selectedProperties,
        interested_properties: interestedProperties,
        hold_properties: holdProperties
      });
      dispatch(updateCustomerProperties({ id, data: updateData }));
    } catch (error) {
      console.error('Error updating properties:', error);
      showToast.error('Failed to update properties');
    }
  }, [dispatch]);

  if (!customer) return null;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <CustomerDetailSheet
        customer={customer}
        onClose={handleClose}
        properties={properties}
        onAddFollowUp={handleAddFollowUpFromCustomer}
        onStartDeal={handleStartDeal}
        onOpenDeal={handleOpenDealFromSheet}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onUpdateStage={handleUpdateStage}
        onSelectProperties={handleSelectProperties}
        asScreen={true}
      />
    </View>
  );
}
