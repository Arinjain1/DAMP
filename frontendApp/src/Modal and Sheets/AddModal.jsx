import { ChevronDown, CloudUpload, Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { getAmenitiesForType } from '../MockData/Mockdata';

// Mock Structure Data
const PROPERTY_STRUCTURE = {
  Residential: { types: ['Apartment/Flats', 'Villa', 'Plot', 'Duplex'] },
  Commercial: { types: ['Office Space', 'Shop', 'Showroom', 'Warehouse'] },
  Agriculture: { types: ['Farm Land', 'Farm House'] },
};

const AddModal = ({
  type,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editItem,
  properties,
  customers,
  initialCustomer,
}) => {
  const generateId = () => Math.random().toString(36).substring(2, 11);

  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [propertySearchText, setPropertySearchText] = useState('');

  useEffect(() => {
    console.log('AddModal useEffect - type:', type, 'editItem:', editItem, 'isOpen:', isOpen);
    if (editItem) {
      // Convert single propertyId to propertyIds array for backward compatibility
      const updatedEditItem = { ...editItem };
      if (editItem.propertyId && !editItem.propertyIds) {
        updatedEditItem.propertyIds = [editItem.propertyId];
        delete updatedEditItem.propertyId;
      } else if (!editItem.propertyIds) {
        updatedEditItem.propertyIds = [];
      }
      setFormData(updatedEditItem);
    } else {
      if (type === 'Property') {
        setFormData({
          status: 'Available',
          listingType: 'Sell',
          category: 'Residential',
          type: 'Apartment/Flats',
          bhk: '2 BHK',
          furnishing: 'Semi',
          image: '',
          location: '',
          price: '',
          size: '',
          owner: '',
          ownerPhone: '',
          title: '',
          amenities: [],
        });
      } else if (type === 'Customer') {
        setFormData({
          status: 'New Lead',
          type: 'Apartment/Flats',
          budget: '',
          name: '',
          phone: '',
        });
      } else if (type === 'FollowUp') {
        setFormData({
          status: 'Pending',
          type: 'Call',
          date: new Date().toISOString(), // Use ISO string instead of Date object
          customerId: initialCustomer?.id || '',
          propertyIds: [], // Changed to array for multiple properties
          note: '',
        });
      }
    }
  }, [editItem, type, initialCustomer, isOpen]); // Reset on open

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData((prev) => {
      let processedValue;
      
      if (['price', 'size', 'budget'].includes(name)) {
        processedValue = value === '' ? '' : Number(value) || 0;
      } else if (name === 'date' && value instanceof Date) {
        // Convert Date to ISO string to avoid serialization issues
        processedValue = value.toISOString();
      } else {
        processedValue = value;
      }

      const newData = { ...prev, [name]: processedValue };

      if (name === 'category' && type === 'Property') {
        if (PROPERTY_STRUCTURE[value]) {
          newData.type = PROPERTY_STRUCTURE[value].types[0];
        }
        if (value !== 'Residential') newData.bhk = '';
      }

      return newData;
    });
  };

  const pickImage = () => {
    const mockImage =
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
    handleChange('image', mockImage);
  };

  const handleSubmit = () => {
    if (editItem) {
      onUpdate(formData);
    } else {
      const finalData = { ...formData, id: generateId() };
      if (type === 'Property') {
        if (!finalData.title)
          finalData.title = `${finalData.bhk ? finalData.bhk + ' ' : ''}${finalData.type}`;
        if (!finalData.image)
          finalData.image =
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
      }
      onSave(finalData);
    }
    onClose();
  };

  const Chip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
        selected ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
      }`}
    >
      <Text className={`text-xs font-bold ${selected ? 'text-white' : 'text-gray-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event?.type === 'set' && selectedDate) {
        setTempDate(selectedDate);
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
        handleChange('date', selectedDate);
      }
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event?.type === 'set' && selectedTime) {
      const combinedDateTime = new Date(tempDate);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());
      handleChange('date', combinedDateTime);
    } else if (Platform.OS === 'android' && event?.type === 'dismissed') {
      handleChange('date', tempDate);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      style={{ zIndex: 9999 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/60">
          <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />

          {/* Modal Container */}
          <View className="bg-white w-full h-[80%] rounded-t-3xl overflow-hidden shadow-2xl">
            
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white z-10">
              <View>
                <Text className="font-bold text-xl text-gray-900">
                  {editItem ? 'Edit' : 'New'} {type}
                </Text>
                <Text className="text-xs text-gray-400 font-medium mt-0.5">
                  Fill in the details below
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                <X size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
              
              {/* === PROPERTY FORM === */}
              {type === 'Property' && (
                <View style={styles.formContainer}>
                  {/* Image Picker */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Image</Text>
                    <TouchableOpacity
                      onPress={pickImage}
                      style={[styles.imageUpload, formData.image ? styles.imageUploaded : styles.imageEmpty]}
                    >
                      {formData.image ? (
                        <Image source={{ uri: formData.image }} style={styles.uploadedImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.uploadPlaceholder}>
                          <CloudUpload size={24} color="#9ca3af" />
                          <Text style={styles.uploadText}>Upload Image</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Sell/Rent Toggle */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Listing Type</Text>
                    <View style={styles.toggleContainer}>
                      {['Sell', 'Rent'].map((opt) => (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => handleChange('listingType', opt)}
                          style={[
                            styles.toggleButton,
                            formData.listingType === opt && styles.toggleButtonActive
                          ]}
                        >
                          <Text style={[
                            styles.toggleText,
                            formData.listingType === opt ? styles.toggleTextActive : styles.toggleTextInactive
                          ]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Category */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Category</Text>
                    <View style={styles.chipContainer}>
                      {Object.keys(PROPERTY_STRUCTURE).map((cat) => (
                        <Chip key={cat} label={cat} selected={formData.category === cat} onPress={() => handleChange('category', cat)} />
                      ))}
                    </View>
                  </View>

                  {/* Property Type */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Property Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.chipContainer}>
                        {PROPERTY_STRUCTURE[formData.category]?.types.map((t) => (
                          <Chip key={t} label={t} selected={formData.type === t} onPress={() => handleChange('type', t)} />
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* BHK Configuration (Only for Residential) */}
                  {formData.category === 'Residential' && (formData.type === 'Apartment/Flats' || formData.type === 'Villa' || formData.type === 'Duplex') && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Configuration</Text>
                      <View style={styles.chipContainer}>
                        {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'].map((bhk) => (
                          <Chip key={bhk} label={bhk} selected={formData.bhk === bhk} onPress={() => handleChange('bhk', bhk)} />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Furnishing (Only for Residential) */}
                  {formData.category === 'Residential' && (
                    <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Furnishing</Text>
                      <View style={styles.chipContainer}>
                        {['Unfurnished', 'Semi', 'Furnished'].map((furn) => (
                          <Chip key={furn} label={furn} selected={formData.furnishing === furn} onPress={() => handleChange('furnishing', furn)} />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Location */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Location</Text>
                    <TextInput
                        value={formData.location || ''}
                        onChangeText={(t) => handleChange('location', t)}
                        placeholder="e.g. MG Road, Indiranagar, Bangalore"
                        style={styles.textInputFull}
                    />
                  </View>

                  {/* Price and Size */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Property Details</Text>
                    <View style={styles.rowContainer}>
                        <View style={styles.halfWidth}>
                            <Text style={styles.inputLabel}>Price (₹)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={String(formData.price || '')}
                                onChangeText={(t) => handleChange('price', t)}
                                placeholder="0"
                                style={styles.textInputFull}
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <Text style={styles.inputLabel}>Size (sqft)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={String(formData.size || '')}
                                onChangeText={(t) => handleChange('size', t)}
                                placeholder="0"
                                style={styles.textInputFull}
                            />
                        </View>
                    </View>
                  </View>

                  {/* Owner Details */}
                  <View style={styles.section}>
                      <Text style={styles.sectionLabel}>Owner Details</Text>
                      <TextInput
                          value={formData.owner || ''}
                          onChangeText={(t) => handleChange('owner', t)}
                          placeholder="Owner Name"
                          style={styles.textInputFull}
                      />
                      <TextInput
                          keyboardType="phone-pad"
                          value={formData.ownerPhone || ''}
                          onChangeText={(t) => handleChange('ownerPhone', t)}
                          placeholder="Owner Phone Number"
                          style={styles.textInputFull}
                      />
                  </View>

                  {/* Amenities */}
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Amenities</Text>
                    <Text style={styles.inputLabel}>Select available amenities for {formData.type}</Text>
                    
                    {/* Type-specific Amenities */}
                    {(() => {
                      const typeAmenities = getAmenitiesForType(formData.type);
                      
                      if (typeAmenities.length === 0) {
                        return (
                          <View style={styles.noAmenitiesContainer}>
                            <Text style={styles.noAmenitiesText}>
                              No specific amenities available for {formData.type}
                            </Text>
                          </View>
                        );
                      }
                      
                      return (
                        <View style={styles.amenityGrid}>
                          {typeAmenities.map((amenity) => {
                            const isSelected = formData.amenities?.includes(amenity.id);
                            return (
                              <TouchableOpacity
                                key={amenity.id}
                                onPress={() => {
                                  const currentAmenities = formData.amenities || [];
                                  let newAmenities;
                                  
                                  if (isSelected) {
                                    newAmenities = currentAmenities.filter(id => id !== amenity.id);
                                  } else {
                                    newAmenities = [...currentAmenities, amenity.id];
                                  }
                                  
                                  handleChange('amenities', newAmenities);
                                }}
                                style={[
                                  styles.amenityChipCompact,
                                  isSelected ? styles.amenityChipSelected : styles.amenityChipUnselected
                                ]}
                              >
                                <Text style={[
                                  styles.amenityTextCompact,
                                  isSelected ? styles.amenityTextSelected : styles.amenityTextUnselected
                                ]} numberOfLines={1}>
                                  {amenity.name}
                                </Text>
                                {isSelected && (
                                  <View style={styles.amenityCheckmarkCompact}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      );
                    })()}
                    
                    {/* Selected Amenities Count */}
                    {formData.amenities?.length > 0 && (
                      <View style={styles.amenitySummary}>
                        <Text style={styles.amenitySummaryText}>
                          {formData.amenities.length} amenities selected
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* === CUSTOMER / FOLLOWUP FORM === */}
              {(type === 'Customer' || type === 'FollowUp') && (
                <View className="gap-5">
                  
                  {type === 'Customer' && (
                    <>
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Name</Text>
                        <TextInput
                          value={formData.name || ''}
                          onChangeText={(t) => handleChange('name', t)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800"
                          placeholder="Client Name"
                        />
                      </View>
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Phone</Text>
                        <TextInput
                          keyboardType="phone-pad"
                          value={formData.phone || ''}
                          onChangeText={(t) => handleChange('phone', t)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800"
                          placeholder="Phone Number"
                        />
                      </View>
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Max Budget</Text>
                        <TextInput
                          keyboardType="numeric"
                          value={String(formData.budget || '')}
                          onChangeText={(t) => handleChange('budget', t)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800"
                          placeholder="0"
                        />
                      </View>
                    </>
                  )}

                  {/* === UPDATED FOLLOWUP SECTION === */}
                  {type === 'FollowUp' && (
                    <>
                      {/* Customer Selection */}
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Customer</Text>
                        {initialCustomer || (editItem && formData.customerId) ? (
                          <View className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <Text className="text-sm font-bold text-gray-800">
                              {initialCustomer?.name || customers.find(c => c.id === formData.customerId)?.name || 'Unknown Customer'}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            {/* Customer Dropdown Button */}
                            <TouchableOpacity
                              onPress={() => setShowCustomerDropdown(!showCustomerDropdown)}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex-row justify-between items-center"
                            >
                              <Text className={`text-sm ${formData.customerId ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                                {formData.customerId 
                                  ? customers.find(c => c.id === formData.customerId)?.name 
                                  : 'Select Customer'
                                }
                              </Text>
                              <ChevronDown size={16} color="#9ca3af" />
                            </TouchableOpacity>

                            {/* Customer Dropdown */}
                            {showCustomerDropdown && (
                              <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                                {/* Search Input */}
                                <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
                                  <Search size={16} color="#9ca3af" />
                                  <TextInput
                                    value={customerSearchText}
                                    onChangeText={setCustomerSearchText}
                                    placeholder="Search customers..."
                                    className="flex-1 ml-2 text-sm text-gray-800"
                                  />
                                </View>

                                {/* Customer List */}
                                <ScrollView style={{ maxHeight: 200 }}>
                                  {customers
                                    .filter(c => 
                                      c.name.toLowerCase().includes(customerSearchText.toLowerCase()) ||
                                      c.phone.includes(customerSearchText)
                                    )
                                    .map((customer) => (
                                      <TouchableOpacity
                                        key={customer.id}
                                        onPress={() => {
                                          handleChange('customerId', customer.id);
                                          setShowCustomerDropdown(false);
                                          setCustomerSearchText('');
                                        }}
                                        className={`px-4 py-3 border-b border-gray-50 ${
                                          formData.customerId === customer.id ? 'bg-blue-50' : ''
                                        }`}
                                      >
                                        <Text className={`text-sm font-bold ${
                                          formData.customerId === customer.id ? 'text-blue-700' : 'text-gray-800'
                                        }`}>
                                          {customer.name}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1">
                                          {customer.phone} • {customer.type}
                                        </Text>
                                      </TouchableOpacity>
                                    ))
                                  }
                                </ScrollView>
                              </View>
                            )}
                          </View>
                        )}
                      </View>

                      {/* Type Selection */}
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Task Type</Text>
                        <View className="flex-row">
                          {['Call', 'Meeting', 'Visit'].map((t) => (
                            <Chip key={t} label={t} selected={formData.type === t} onPress={() => handleChange('type', t)} />
                          ))}
                        </View>
                      </View>

                      {/* Task Preview Card */}
                      {formData.type && (
                        <View>
                          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preview</Text>
                          <View className="p-4 bg-white border border-gray-200 rounded-xl">
                            <View className="flex-row justify-between items-center mb-2">
                              <View className={`px-2 py-1 rounded ${
                                formData.type === 'Visit' || formData.type === 'Meeting' 
                                  ? 'bg-yellow-50' 
                                  : 'bg-blue-50'
                              }`}>
                                <Text className={`text-xs font-bold ${
                                  formData.type === 'Visit' || formData.type === 'Meeting'
                                    ? 'text-yellow-700'
                                    : 'text-blue-700'
                                }`}>
                                  {formData.type === 'Visit' || formData.type === 'Meeting' 
                                    ? 'Site Visit' 
                                    : 'Call / Follow-up'}
                                </Text>
                              </View>
                              <View className="px-2 py-1 bg-orange-500 rounded">
                                <Text className="text-xs font-bold text-white">Pending</Text>
                              </View>
                            </View>
                            <Text className="text-sm text-gray-700 mb-2">
                              {formData.note || 'Task description will appear here...'}
                            </Text>
                            <Text className="text-xs text-gray-500">
                              {formData.date ? new Date(formData.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Date & time will appear here...'}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Note */}
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Task Note</Text>
                        <TextInput
                          value={formData.note || ''}
                          onChangeText={(t) => handleChange('note', t)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800"
                          placeholder="What needs to be done?"
                          multiline
                        />
                      </View>

                      {/* Property Selection */}
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Properties</Text>
                        
                        {/* Property Dropdown Button */}
                        <TouchableOpacity
                          onPress={() => setShowPropertyDropdown(!showPropertyDropdown)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex-row justify-between items-center"
                        >
                          <Text className={`text-sm ${formData.propertyIds?.length > 0 ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                            {formData.propertyIds?.length > 0 
                              ? `${formData.propertyIds.length} Properties Selected`
                              : 'Select Properties'
                            }
                          </Text>
                          <ChevronDown size={16} color="#9ca3af" />
                        </TouchableOpacity>

                        {/* Selected Properties Display */}
                        {formData.propertyIds?.length > 0 && (
                          <View className="mt-2 flex-row flex-wrap gap-2">
                            {formData.propertyIds.map(propId => {
                              const property = properties.find(p => p.id === propId);
                              return property ? (
                                <View key={propId} className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                                  <Text className="text-xs text-blue-700 font-bold mr-2">{property.title}</Text>
                                  <TouchableOpacity
                                    onPress={() => {
                                      const newPropertyIds = formData.propertyIds.filter(id => id !== propId);
                                      handleChange('propertyIds', newPropertyIds);
                                    }}
                                  >
                                    <X size={12} color="#1d4ed8" />
                                  </TouchableOpacity>
                                </View>
                              ) : null;
                            })}
                          </View>
                        )}

                        {/* Property Dropdown */}
                        {showPropertyDropdown && (
                          <View className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                            {/* Search Input */}
                            <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
                              <Search size={16} color="#9ca3af" />
                              <TextInput
                                value={propertySearchText}
                                onChangeText={setPropertySearchText}
                                placeholder="Search properties..."
                                className="flex-1 ml-2 text-sm text-gray-800"
                              />
                            </View>

                            {/* Property List */}
                            <ScrollView style={{ maxHeight: 200 }}>
                              {properties
                                .filter(p => 
                                  p.title.toLowerCase().includes(propertySearchText.toLowerCase()) ||
                                  p.location.toLowerCase().includes(propertySearchText.toLowerCase()) ||
                                  p.type.toLowerCase().includes(propertySearchText.toLowerCase())
                                )
                                .map((property) => {
                                  const isSelected = formData.propertyIds?.includes(property.id);
                                  return (
                                    <TouchableOpacity
                                      key={property.id}
                                      onPress={() => {
                                        const currentIds = formData.propertyIds || [];
                                        let newPropertyIds;
                                        
                                        if (isSelected) {
                                          // Remove if already selected
                                          newPropertyIds = currentIds.filter(id => id !== property.id);
                                        } else {
                                          // Add if not selected
                                          newPropertyIds = [...currentIds, property.id];
                                        }
                                        
                                        handleChange('propertyIds', newPropertyIds);
                                      }}
                                      className={`px-4 py-3 border-b border-gray-50 flex-row items-center ${
                                        isSelected ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <View className="flex-1">
                                        <Text className={`text-sm font-bold ${
                                          isSelected ? 'text-blue-700' : 'text-gray-800'
                                        }`}>
                                          {property.title}
                                        </Text>
                                        <Text className="text-xs text-gray-500 mt-1">
                                          {property.location} • {property.type}
                                        </Text>
                                      </View>
                                      {isSelected && (
                                        <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
                                          <Text className="text-white text-xs font-bold">✓</Text>
                                        </View>
                                      )}
                                    </TouchableOpacity>
                                  );
                                })
                              }
                            </ScrollView>
                          </View>
                        )}
                      </View>

                      {/* Date & Time */}
                      <View>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Date & Time</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setTempDate(formData.date ? new Date(formData.date) : new Date());
                            setShowDatePicker(true);
                          }}
                          className="px-4 py-3 bg-white border border-gray-200 rounded-xl"
                        >
                          <Text className="text-sm font-bold text-gray-800">
                            {formData.date ? new Date(formData.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select Date & Time'}
                          </Text>
                        </TouchableOpacity>

                        {/* Pickers */}
                        {showDatePicker && (
                          <DateTimePicker
                            value={tempDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                          />
                        )}
                        {showTimePicker && (
                          <DateTimePicker
                            value={tempDate || new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleTimeChange}
                          />
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                className="w-full py-4 bg-gray-900 rounded-xl mt-8 shadow-lg items-center active:scale-95"
              >
                <Text className="text-white font-bold text-sm">
                    {editItem ? 'Update' : 'Save'} {type === 'FollowUp' ? 'Task' : type}
                </Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Form Layout
  formContainer: {
    gap: 20,
  },
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Image Upload
  imageUpload: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageEmpty: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  imageUploaded: {
    borderColor: '#e5e7eb',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginTop: 8,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#111827',
  },
  toggleTextInactive: {
    color: '#9ca3af',
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Text Inputs
  textInputFull: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },

  // Row Layout
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },

  // Amenities - Flexible grid layout
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  amenityChipCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
  },
  amenityChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  amenityChipUnselected: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
  },
  amenityTextCompact: {
    fontSize: 11,
    fontWeight: '600',
  },
  amenityTextSelected: {
    color: 'white',
  },
  amenityTextUnselected: {
    color: '#374151',
  },
  amenityCheckmarkCompact: {
    marginLeft: 6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  amenitySummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  amenitySummaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  noAmenitiesContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    alignItems: 'center',
  },
  noAmenitiesText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default AddModal;