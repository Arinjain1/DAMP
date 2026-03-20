import React, { memo, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { Search, X, MapPin, Check, Plus } from 'lucide-react-native';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const PropertyPickerModal = memo(({
  visible,
  customer,
  properties,
  selectedPropertyIds,
  dealtPropertyIds,
  searchQuery,
  onSearchChange,
  onClose,
  onToggleProperty,
  onStartDeal,
  onUpdateStage,
  styles
}) => {
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const customerPropertyType = customer.propertyType || customer.type;
      
      if (customer.stage === 'Contacted' || customer.stage === 'Site Visit') {
        const matchesType = !customerPropertyType || p.type === customerPropertyType;
        return matchesSearch && matchesType && p.status !== 'Sold';
      } else {
        return matchesSearch && p.status === 'Available' && !dealtPropertyIds.includes(p.id);
      }
    });
  }, [properties, searchQuery, customer, dealtPropertyIds]);

  const handlePropertyPress = (p) => {
    const canToggle = customer.stage === 'Contacted' || customer.stage === 'Site Visit';
    
    if (canToggle) {
      onToggleProperty(p.id);
    } else {
      Alert.alert(
        '🤝 Start Deal',
        `Are you sure you want to start a deal for "${p.title}" with ${customer.name}?\n\nThis will move the customer to In-Process stage.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Start Deal',
            onPress: () => {
              onStartDeal(customer, p);
              if (onUpdateStage) {
                onUpdateStage(customer.id, 'In-Process');
              }
              onClose();
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.pickerOverlay}>
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>
              {customer.stage === 'Contacted' ? 'Select Properties to Show' : 'Select Property'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search properties..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={onSearchChange}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <X size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.pickerContent} contentContainerStyle={{ paddingBottom: 100 }}>
            {filteredProperties.map(p => {
              const isSelected = selectedPropertyIds.includes(p.id);
              const canToggle = customer.stage === 'Contacted' || customer.stage === 'Site Visit';
              
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => handlePropertyPress(p)}
                  style={[
                    styles.pickerItem,
                    canToggle && isSelected && styles.pickerItemSelected
                  ]}
                >
                  <Image source={{ uri: p.image }} style={styles.pickerImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerItemTitle}>{p.title}</Text>
                    <View style={styles.rowCenter}>
                      <MapPin size={10} color="#9ca3af" />
                      <Text style={styles.pickerItemLocation}>{p.location}</Text>
                    </View>
                    <Text style={styles.pickerItemPrice}>{formatCurrency(p.price)}</Text>
                  </View>
                  {canToggle ? (
                    <View style={[
                      styles.checkboxCircle,
                      isSelected && styles.checkboxCircleSelected
                    ]}>
                      {isSelected && <Check size={16} color="#ffffff" />}
                    </View>
                  ) : (
                    <Plus size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              );
            })}
            {filteredProperties.length === 0 && (
              <View style={styles.emptyPropertiesContainer}>
                <Text style={styles.emptyPropertiesText}>
                  {searchQuery ? 'No properties found matching your search.' : 'No properties available. Please add properties first.'}
                </Text>
              </View>
            )}
          </ScrollView>

          {(customer.stage === 'Contacted' || customer.stage === 'Site Visit') && (
            <View style={styles.pickerFooter}>
              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneButtonText}>Done ({selectedPropertyIds.length} selected)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});

PropertyPickerModal.displayName = 'PropertyPickerModal';

export default PropertyPickerModal;
