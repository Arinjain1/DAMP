import { StatusBar, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Components
import FAB from '../src/Components/FAB.jsx';
import AddModal from '../src/Modal and Sheets/AddModal.jsx';
import PropertyDetailSheet from '../src/Modal and Sheets/PropertyDetailSheet.jsx';
import InventoryPage from '../src/Views/InventoryPage.jsx';

// Redux actions
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Dynamic StatusBar for clean UI */}
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Main Content:
          InventoryPage ab internal logic ke liye params use karega, 
          lekin Redux data hum yahan se pass kar rahe hain.
      */}
      <InventoryPage 
        properties={properties} 
        onSelect={(property) => dispatch(setSelectedProperty(property))} 
        onEdit={handleEdit} 
      />

      {/* Action Components */}
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
      />
      
      {/* Detail Bottom Sheet */}
      {selectedProperty && (
        <PropertyDetailSheet 
          property={selectedProperty} 
          onClose={() => dispatch(clearSelectedProperty())} 
          onEdit={handleEdit} 
        />
      )}
    </View>
  );
}