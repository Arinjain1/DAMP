import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Components
import AddModal from '../src/Modal and Sheets/AddModal.jsx';
import PropertyDetailSheet from '../src/Modal and Sheets/PropertyDetailSheet.jsx';

// Redux actions
import { addDeal } from '@/src/store/slices/dealsSlice.js';
import InventoryPageBasic from '@/src/Views/InventoryPageBasic.jsx';
import {
    addProperty,
    clearSelectedProperty,
    setSelectedProperty,
    updateProperty
} from '../src/store/slices/propertiesSlice.js';
import {
    clearEditItem,
    setEditItem,
    setModalOpen,
    setModalType
} from '../src/store/slices/uiSlice.js';

export default function Properties() {
  const dispatch = useDispatch();
  
  // Redux state
  const { properties, selectedProperty } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // FAB (Floating Action Button) logic
  const handleFABClick = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('Property'));
    dispatch(setModalOpen(true));
  };

  const handleAdd = (data) => {
    const newProperty = { ...data, id: generateId() };
    dispatch(addProperty(newProperty));
    dispatch(setModalOpen(false));
  };

  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = (updatedItem) => {
    dispatch(updateProperty(updatedItem));
    dispatch(clearEditItem());
    dispatch(setModalOpen(false));
  };

  // Handle deal creation from property detail sheet
  const handleCreateDeal = (dealData) => {
    dispatch(addDeal(dealData));
    
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Dynamic StatusBar for clean UI */}
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Main Content - Using basic version without className */}
      <InventoryPageBasic 
        properties={properties} 
        onSelect={(property) => dispatch(setSelectedProperty(property))} 
        onEdit={handleEdit}
        onAddProperty={handleFABClick}
      />

      {/* Action Components */}

      <AddModal 
        isOpen={modalOpen} 
        type={modalType} 
        onClose={() => dispatch(setModalOpen(false))} 
        onSave={handleAdd} 
        onUpdate={handleUpdate} 
        editItem={editItem} 
        properties={properties} 
        customers={customers} 
      />
      
      {/* Detail Bottom Sheet */}
      {selectedProperty && (
        <PropertyDetailSheet 
          property={selectedProperty} 
          onClose={() => dispatch(clearSelectedProperty())} 
          onEdit={handleEdit}
          customers={customers}
          properties={properties}
          onCreateDeal={handleCreateDeal}
        />
      )}
    </View>
  );
}