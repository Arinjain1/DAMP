import { useEffect, lazy, Suspense, useCallback } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Components
import AddModal from '../src/Modal and Sheets/AddModal.jsx';
const PropertyDetailSheet = lazy(() => import('../src/Modal and Sheets/PropertyDetailSheet.jsx'));

// Redux actions
import { addDeal } from '@/src/store/slices/dealsSlice.js';
import InventoryPageBasic from '@/src/Views/InventoryPageBasic.jsx';
import {
  addProperty,
  clearSelectedProperty,
  setSelectedProperty,
  updateProperty,
  setProperties,
  setLoading,
  setError
} from '../src/store/slices/propertiesSlice.js';
import {
  clearEditItem,
  setEditItem,
  setModalOpen,
  setModalType
} from '../src/store/slices/uiSlice.js';

// API
import { propertiesAPI } from '../src/config/api.js';
import { showToast } from '../src/utils/toast.js';

export default function Properties() {
  const dispatch = useDispatch();

  // Redux state
  const { properties, selectedProperty, loading } = useSelector(state => state.properties);
  const { customers } = useSelector(state => state.customers);
  const { modalOpen, modalType, editItem } = useSelector(state => state.ui);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Refresh properties when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const fetchProperties = async () => {
    try {
      dispatch(setLoading(true));

      const response = await propertiesAPI.getAll();

      if (response.data.success) {
        // Map backend data to frontend format
        const mappedProperties = response.data.data.map(prop => ({
          id: prop.id,
          title: prop.title,
          listingType: prop.listing_type,
          category: prop.category || prop.property_category,
          type: prop.property_type,
          bhk: prop.configuration,
          furnishing: prop.furnishing_status,
          location: prop.locality || prop.city,
          city: prop.city,
          state: prop.state,
          price: prop.price,
          size: `${prop.size_sqft} ${prop.size_unit}`,
          image: prop.cover_image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
          status: prop.status,
          owner: prop.owner_name,
          ownerPhone: prop.owner_phone,
          amenities: prop.amenities || [],
        }));

        dispatch(setProperties(mappedProperties));
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      dispatch(setError(error.response?.data?.message || 'Failed to fetch properties'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  // FAB (Floating Action Button) logic
  const handleFABClick = () => {
    dispatch(clearEditItem());
    dispatch(setModalType('Property'));
    dispatch(setModalOpen(true));
  };

  const handleAdd = async (data) => {
    try {
      // Map form data to API structure
      const apiPayload = {
        listing_type: data.listingType || 'Sell',
        category: data.category || 'Residential', // Required NOT NULL field
        property_category: data.category || 'Residential', // Additional field
        property_type: data.type || '',
        configuration: data.bhk || data.commercialConfig || null,
        furnishing_status: data.furnishing || null,
        state: data.state || '',
        city: data.city || '',
        locality: data.location || '',
        project_name: data.title || '',
        address: data.owner || '',
        price: calculatePrice(data.priceValue, data.priceUnit),
        size: parseFloat(data.sizeValue) || 0,
        size_unit: data.sizeUnit || 'Sq. Ft.',
        length_ft: parseFloat(data.length) || 0,
        width_ft: parseFloat(data.width) || 0,
        owner_name: data.ownerName || '',
        owner_phone: data.ownerPhone || '',
        amenities: data.amenities || [],
        bond: data.bond ? parseFloat(data.bond) : null,
        image_url: data.image || null,
      };

      const response = await propertiesAPI.create(apiPayload);

      if (response.data.success) {
        // Add the property returned from backend to Redux store
        dispatch(addProperty(response.data.data));
        dispatch(setModalOpen(false));
        showToast.success('Property created successfully!');
        // Refresh the properties list
        fetchProperties();
      }
    } catch (error) {
      console.error('Error creating property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create property. Please try again.';
      showToast.error(errorMessage);
    }
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

  const handleEdit = (item, type) => {
    dispatch(setEditItem(item));
    dispatch(setModalType(type));
    dispatch(setModalOpen(true));
  };

  const handleUpdate = async (data) => {
    try {
      // Map form data to API structure
      const apiPayload = {
        listing_type: data.listingType || 'Sell',
        category: data.category || 'Residential',
        property_category: data.category || 'Residential',
        property_type: data.type || '',
        configuration: data.bhk || data.commercialConfig || null,
        furnishing_status: data.furnishing || null,
        state: data.state || '',
        city: data.city || '',
        locality: data.location || '',
        project_name: data.title || '',
        address: data.owner || '',
        price: calculatePrice(data.priceValue, data.priceUnit),
        size: parseFloat(data.sizeValue) || 0,
        size_unit: data.sizeUnit || 'Sq. Ft.',
        length_ft: parseFloat(data.length) || 0,
        width_ft: parseFloat(data.width) || 0,
        owner_name: data.ownerName || '',
        owner_phone: data.ownerPhone || '',
        amenities: data.amenities || [],
        bond: data.bond ? parseFloat(data.bond) : null,
        image_url: data.image || null,
      };

      const response = await propertiesAPI.update(data.id, apiPayload);

      if (response.data.success) {
        dispatch(updateProperty(response.data.data));
        dispatch(clearEditItem());
        dispatch(setModalOpen(false));
        showToast.success('Property updated successfully!');
        fetchProperties();
      }
    } catch (error) {
      console.error('Error updating property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update property. Please try again.';
      showToast.error(errorMessage);
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
        <Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#A78BFA" /></View>}>
          <PropertyDetailSheet
            property={selectedProperty}
            onClose={() => dispatch(clearSelectedProperty())}
            onEdit={handleEdit}
            customers={customers}
            properties={properties}
            onCreateDeal={handleCreateDeal}
          />
        </Suspense>
      )}
    </View>
  );
}