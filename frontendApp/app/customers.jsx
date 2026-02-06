import { View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AddModal from '../src/Modal and Sheets/AddModal';
import CustomerDetailSheet from '../src/Modal and Sheets/CustomerDetailSheet';
import DealSheet from '../src/Modal and Sheets/DealSheet';
import CustomersList from '../src/Views/CustomersList';

// Redux actions
import { addCustomer, clearSelectedCustomer, setSelectedCustomer, updateCustomer, updateCustomerStatus } from '../src/store/slices/customersSlice';
import { addDeal, clearSelectedDeal, closeDeal, setSelectedDeal, updateDeal } from '../src/store/slices/dealsSlice';
import { addFollowUp, deleteFollowUp, updateFollowUp } from '../src/store/slices/followUpsSlice';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '../src/store/slices/uiSlice';

export default function Customers() {
  const dispatch = useDispatch();
  
  const { properties } = useSelector(state => state.properties);
  const { customers, selectedCustomer } = useSelector(state => state.customers);
  const { deals, selectedDeal } = useSelector(state => state.deals);
  const { followUps } = useSelector(state => state.followUps);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleAddCustomer = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('Customer'));
    // Add a small delay to ensure smooth animation
    setTimeout(() => {
      dispatch(setModalOpen(true));
    }, 50);
  };

  const handleAdd = (data) => {
    const newCustomer = { ...data, id: generateId() };
    dispatch(addCustomer(newCustomer));
    dispatch(setModalOpen(false));
  };

  const handleUpdate = (updatedItem) => {
    if (modalType === 'FollowUp') {
      dispatch(updateFollowUp(updatedItem));
    } else {
      dispatch(updateCustomer(updatedItem));
    }
    dispatch(clearEditItem());
    dispatch(setModalOpen(false));
  };

  const handleAddFollowUpFromCustomer = (customer) => {
    // Don't clear the selected customer, keep it for initialCustomer
    dispatch(setEditItem({ customerId: customer.id })); // Set the customer for the follow-up
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
  };

  const handleEditTask = (task) => {
    console.log('🔥 handleEditTask called with:', task);
    console.log('🔥 Task ID:', task?.id, 'Customer ID:', task?.customerId);
    console.log('🔥 Current modal state - isOpen:', modalOpen, 'type:', modalType);
    // Don't close customer detail sheet, just open modal on top
    dispatch(setEditItem(task));
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
    console.log('🔥 Dispatched modal open actions');
  };

  const handleDeleteTask = (taskId) => {
    dispatch(deleteFollowUp(taskId));
  };

  const handleStartDeal = (customer, property) => {
    const newDeal = {
      id: generateId(),
      customerId: customer.id,
      propertyId: property.id,
      stage: 'Meeting',
      startedAt: new Date().toISOString(),
      meetings: []
    };
    dispatch(addDeal(newDeal));
    dispatch(clearSelectedCustomer());
    dispatch(setSelectedDeal(newDeal));
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
        onSelect={(customer) => dispatch(setSelectedCustomer(customer))} 
        onAddCustomer={handleAddCustomer}
      />

      <AddModal 
        isOpen={modalOpen} 
        type={modalType} 
        onClose={() => {
          console.log('🔥 AddModal closing');
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
          onUpdateStage={(id, stage) => {
            const customer = customers.find(c => c.id === id);
            if (customer) {
              dispatch(updateCustomer({ ...customer, stage }));
            }
          }}
          onSelectProperties={(id, selectedProperties) => {
            const customer = customers.find(c => c.id === id);
            if (customer) {
              dispatch(updateCustomer({ ...customer, selectedProperties }));
            }
          }}
          onStartDeal={handleStartDeal}
          onOpenDeal={(deal) => dispatch(setSelectedDeal(deal))}
        />
      )}

      {selectedDeal && (
        <DealSheet 
          deal={selectedDeal} 
          properties={properties} 
          customers={customers} 
          onClose={() => dispatch(clearSelectedDeal())} 
          onUpdateDeal={handleUpdateDeal} 
          onCloseDeal={handleCloseDeal}
          onAddTask={(task) => dispatch(addFollowUp({ ...task, id: generateId() }))}
        />
      )}
    </View>
  );
}