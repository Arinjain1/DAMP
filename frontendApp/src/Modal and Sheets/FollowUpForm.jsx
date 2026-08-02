import { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronDown, Calendar, Clock, Check, X } from 'lucide-react-native';

// Memoized TextInput Component
const MemoizedTextInput = memo(function MemoizedTextInput({ label, name, value, onChange, placeholder, keyboardType, multiline, numberOfLines, styles }) {
  const TextInputClass = require('react-native').TextInput;
  return (
    <View style={styles.section}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInputClass
        value={value || ''}
        onChangeText={(text) => onChange(name, text)}
        placeholder={placeholder}
        keyboardType={keyboardType || 'default'}
        style={[styles.textInputStyled, multiline && styles.textAreaInput]}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
    </View>
  );
});

// Memoized Radio Group Component
const MemoizedRadioGroup = memo(function MemoizedRadioGroup({ label, name, options, selectedValue, onChange, isSmall, styles }) {
  return (
    <View style={styles.section}>
      <Text style={styles.inputLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={isSmall ? styles.bhkScrollContainer : styles.listingTypeScrollContainer}>
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <TouchableOpacity key={option} onPress={() => onChange(name, option)} style={[styles.radioOption, isSelected && styles.radioOptionSelected]}>
              <View style={[isSmall ? styles.radioButtonSmall : styles.radioButton, isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected]}>
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
              <Text style={[isSmall ? styles.radioTextSmall : styles.radioText, isSelected ? styles.radioTextSelected : styles.radioTextUnselected]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const FollowUpForm = memo(({
  formData,
  handleChange,
  styles,
  customers = [],
  properties = [],
  showCustomerDropdown,
  setShowCustomerDropdown,
  showPropertyDropdown,
  setShowPropertyDropdown,
  setShowDatePicker,
  setShowTimePicker,
  initialCustomer
}) => {
  return (
    <View style={styles.formContainer}>
      {/* Customer Selection */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Customer</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, initialCustomer && { backgroundColor: '#f9fafb' }]}
          onPress={() => !initialCustomer && setShowCustomerDropdown(!showCustomerDropdown)}
        >
          <Text style={formData.customerId ? styles.dropdownSelected : styles.dropdownPlaceholder}>
            {customers.find(c => c.id === formData.customerId)?.name || 'Select Customer'}
          </Text>
          {!initialCustomer && <ChevronDown size={18} color="#9ca3af" />}
        </TouchableOpacity>

        {showCustomerDropdown && (
          <View style={styles.customerDropdown}>
            <ScrollView style={styles.customerScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
              {customers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.customerItem}
                  onPress={() => {
                    handleChange('customerId', customer.id);
                    setShowCustomerDropdown(false);
                  }}
                >
                  <View style={styles.customerItemContent}>
                    <Text style={styles.customerText}>{customer.name}</Text>
                    {customer.phone && (
                      <Text style={styles.customerSubText}>{customer.phone}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Task Type */}
      <MemoizedRadioGroup label="Task Type" name="type" options={['Call', 'Meeting', 'Site Visit', 'Follow-up']} selectedValue={formData.type} onChange={handleChange} styles={styles} />

      {/* Date and Time */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Schedule</Text>
        <View style={styles.rowContainer}>
          <TouchableOpacity style={[styles.halfWidth, styles.dropdownButton]} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dropdownSelected}>
              {new Date(formData.date || Date.now()).toLocaleDateString()}
            </Text>
            <Calendar size={16} color="#bfb7fd" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.halfWidth, styles.dropdownButton]} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dropdownSelected}>
              {new Date(formData.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Clock size={16} color="#bfb7fd" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Properties (Optional) */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Related Properties (Optional)</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowPropertyDropdown(!showPropertyDropdown)}>
          <Text style={formData.propertyIds?.length > 0 ? styles.dropdownSelected : styles.dropdownPlaceholder}>
            {formData.propertyIds?.length > 0
              ? `${formData.propertyIds.length} ${formData.propertyIds.length === 1 ? 'property' : 'properties'} selected`
              : 'Select properties'}
          </Text>
          <ChevronDown size={18} color="#9ca3af" />
        </TouchableOpacity>

        {showPropertyDropdown && (
          <View style={styles.propertyDropdown}>
            <ScrollView style={styles.propertyScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
              {properties.map((property) => {
                const isSelected = formData.propertyIds?.includes(property.id);
                return (
                  <TouchableOpacity
                    key={property.id}
                    style={styles.propertyItem}
                    onPress={() => {
                      const currentIds = formData.propertyIds || [];
                      const newIds = isSelected
                        ? currentIds.filter(id => id !== property.id)
                        : [...currentIds, property.id];
                      handleChange('propertyIds', newIds);
                    }}
                  >
                    <View style={styles.propertyItemContent}>
                      <Text style={styles.propertyText}>{property.title}</Text>
                      {isSelected && <Check size={16} color="#bfb7fd" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Selected Properties Grid */}
        {formData.propertyIds?.length > 0 && (
          <View style={{ marginTop: 12, gap: 8 }}>
            {properties.filter(p => formData.propertyIds.includes(p.id)).map((property) => (
              <View key={property.id} style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 }}>{property.title}</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>{property.location}</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  const newIds = formData.propertyIds.filter(id => id !== property.id);
                  handleChange('propertyIds', newIds);
                }} style={{ backgroundColor: '#fee2e2', borderRadius: 8, padding: 6 }}>
                  <X size={16} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <MemoizedTextInput label="Notes" name="note" value={formData.note} onChange={handleChange} placeholder="Add task details..." multiline numberOfLines={4} styles={styles} />
    </View>
  );
});

FollowUpForm.displayName = 'FollowUpForm';

export default FollowUpForm;
