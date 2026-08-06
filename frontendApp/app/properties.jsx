import { useEffect, useCallback } from 'react';
import { StatusBar, View, InteractionManager } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

// Components
import AddModal from '../src/Modal and Sheets/AddModal.jsx';

// Redux actions
import { addDeal } from '@/src/store/slices/dealsSlice.js';
import InventoryPageBasic from '@/src/Views/InventoryPageBasic.jsx';
import {
  fetchProperties,
  createProperty,
  updatePropertyAPI,
  deleteProperty,
  setSelectedProperty
} from '../src/store/slices/propertiesSlice.js';
import {
  clearEditItem,
  setEditItem,
  setModalOpen,
  setModalType
} from '../src/store/slices/uiSlice.js';

// API
import { showToast } from '../src/utils/toast.js';

export default function Properties() {
  const dispatch = useDispatch();

  // Redux state
  const { properties, loading } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  // Fetch properties on component mount
  useEffect(() => {
    dispatch(fetchProperties());
  }, []);

  // Refresh properties when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        dispatch(fetchProperties());
      });
      return () => task.cancel();
    }, [])
  );

  // FAB (Floating Action Button) logic
  const handleFABClick = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('Property'));
    dispatch(setModalOpen(true));
  };

  // Helper function to calculate price based on unit
  const calculatePrice = (value, unit) => {
    if (!value) return 0;
    const numValue = parseFloat(value);

    switch (unit) {
      case 'Thousands':
        return numValue * 1000;
      case 'Lakh':
        return numValue * 100000;
      case 'Crore':
        return numValue * 10000000;
      default:
        return numValue;
    }
  };

  const handleAdd = async (data) => {
    if (modalType !== 'Property') return;
    try {
      await dispatch(createProperty({
        listingType: data.listingType || 'Sell',
        category: data.category || 'Residential',
        propertyCategory: data.category || 'Residential',
        type: data.type || '',
        configuration: data.bhk || data.commercialConfig || null,
        furnishingStatus: data.furnishing || null,
        state: data.state || '',
        city: data.city || '',
        locality: data.location || '',
        projectName: data.title || '',
        address: data.owner || '',
        price: calculatePrice(data.priceValue, data.priceUnit),
        size: parseFloat(data.sizeValue) || 0,
        sizeUnit: data.sizeUnit || 'Sq. Ft.',
        lengthFt: parseFloat(data.length) || 0,
        widthFt: parseFloat(data.width) || 0,
        ownerName: data.ownerName || '',
        ownerPhone: data.ownerPhone || '',
        amenities: data.amenities || [],
        bond: data.bond ? parseFloat(data.bond) : null,
        image: data.image || null
      })).unwrap();

      dispatch(setModalOpen(false));
      showToast.success('Property created successfully!');
      dispatch(fetchProperties()); // Refresh list
    } catch (error) {
      console.error('Error creating property:', error);
      showToast.error(error || 'Failed to create property. Please try again.');
    }
  };

  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = async (data) => {
    if (modalType !== 'Property') return;
    try {
      await dispatch(updatePropertyAPI({
        id: data.id,
        data: {
          listingType: data.listingType || 'Sell',
          category: data.category || 'Residential',
          propertyCategory: data.category || 'Residential',
          type: data.type || '',
          configuration: data.bhk || data.commercialConfig || null,
          furnishingStatus: data.furnishing || null,
          state: data.state || '',
          city: data.city || '',
          locality: data.location || '',
          projectName: data.title || '',
          address: data.owner || '',
          price: calculatePrice(data.priceValue, data.priceUnit),
          size: parseFloat(data.sizeValue) || 0,
          sizeUnit: data.sizeUnit || 'Sq. Ft.',
          lengthFt: parseFloat(data.length) || 0,
          widthFt: parseFloat(data.width) || 0,
          ownerName: data.ownerName || '',
          ownerPhone: data.ownerPhone || '',
          amenities: data.amenities || [],
          bond: data.bond ? parseFloat(data.bond) : null,
          image: data.image || null
        }
      })).unwrap();

      dispatch(clearEditItem());
      dispatch(setModalOpen(false));
      showToast.success('Property updated successfully!');
      dispatch(fetchProperties()); // Refresh list
    } catch (error) {
      console.error('Error updating property:', error);
      showToast.error(error || 'Failed to update property. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProperty(id)).unwrap();
      showToast.success('Property deleted successfully');
    } catch (error) {
      showToast.error(error || 'Failed to delete property');
    }
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
        onSelect={(property) => {
          dispatch(setSelectedProperty(property));
          router.push('/property-detail');
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddProperty={handleFABClick}
      />

      {/* Action Components */}

      <AddModal
        isOpen={modalOpen && modalType === 'Property'}
        type={modalType}
        onClose={() => dispatch(setModalOpen(false))}
        onSave={handleAdd}
        onUpdate={handleUpdate}
        editItem={editItem}
        properties={properties}
        customers={customers}
      />
    </View>
  );
}