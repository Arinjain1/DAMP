import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import FAB from '../src/Components/FAB.jsx';
import AddModal from '../src/Modal and Sheets/AddModal';
import CustomerDetailSheet from '../src/Modal and Sheets/CustomerDetailSheet';
import DealSheet from '../src/Modal and Sheets/DealSheet';
import CustomersList from '../src/Views/CustomersList';

// Redux actions
import { addCustomer, clearSelectedCustomer, setSelectedCustomer, updateCustomer, updateCustomerStatus } from '../src/store/slices/customersSlice';
import { addDeal, clearSelectedDeal, closeDeal, setSelectedDeal, updateDeal } from '../src/store/slices/dealsSlice';
import { addFollowUp } from '../src/store/slices/followUpsSlice';
import { clearEditItem, setEditItem, setModalOpen, setModalType } from '../src/store/slices/uiSlice';

export default function Customers() {
  const dispatch = useDispatch();
  
  const { properties } = useSelector(state => state.properties);
  const { customers, selectedCustomer } = useSelector(state => state.customers);
  const { deals, selectedDeal } = useSelector(state => state.deals);
  const { followUps } = useSelector(state => state.followUps);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const handleFABClick = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('Customer'));
    dispatch(setModalOpen(true));
  };

  const handleAdd = (data) => {
    const newCustomer = { ...data, id: generateId() };
    dispatch(addCustomer(newCustomer));
    dispatch(setModalOpen(false));
  };

  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = (updatedItem) => {
    dispatch(updateCustomer(updatedItem));
    dispatch(clearEditItem());
    dispatch(setModalOpen(false));
  };

  const handleAddFollowUpFromCustomer = () => {
    dispatch(clearSelectedCustomer());
    dispatch(setModalType('FollowUp'));
    dispatch(setModalOpen(true));
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <CustomersList 
        customers={customers} 
        onSelect={(customer) => dispatch(setSelectedCustomer(customer))} 
      />

      <FAB onClick={handleFABClick} />

      <AddModal 
        isOpen={modalOpen} 
        type={modalType} 
        onClose={() => dispatch(setModalOpen(false))} 
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
          onUpdateStatus={(id, status) => dispatch(updateCustomerStatus({ id, status }))}
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