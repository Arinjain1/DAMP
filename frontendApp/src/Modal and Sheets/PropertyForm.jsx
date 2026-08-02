import { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown, CloudUpload } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { getAmenitiesForType } from '../MockData/Mockdata';

// Helper function to render Lucide Icons dynamically
const renderIcon = (iconName, size = 12, color = '#6b7280') => {
  // eslint-disable-next-line import/namespace
  const IconComponent = LucideIcons[iconName] || LucideIcons.Star;
  return <IconComponent size={size} color={color} />;
};

// Memoized TextInput Component
const MemoizedTextInput = memo(function MemoizedTextInput({ label, name, value, onChange, placeholder, keyboardType, multiline, numberOfLines, styles }) {
  return (
    <View style={styles.section}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
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

// Memoized Property Type Group Component
const MemoizedPropertyTypeGroup = memo(function MemoizedPropertyTypeGroup({ category, selectedValue, onChange, styles, PROPERTY_STRUCTURE }) {
  const types = PROPERTY_STRUCTURE[category]?.types || [];
  return (
    <View style={styles.section}>
      <Text style={styles.inputLabel}>Property Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propertyTypeScrollContainer}>
        {types.map((propertyType) => {
          const isSelected = selectedValue === propertyType;
          const iconMap = {
            'Apartment/Flats': 'Building',
            'Builder Floor': 'Building2',
            'House/Villa': 'Home',
            'Plot/Land': 'MapPin',
            'Farmhouse': 'TreePine',
            'Office': 'Briefcase',
            'Shop/Showroom': 'Store',
            'Storage': 'Warehouse',
            'Industry': 'Factory',
            'Hospitality': 'Hotel',
            'Farm Land': 'Wheat',
            'Farm House': 'Barn',
            'Other': 'MoreHorizontal'
          };
          const iconName = iconMap[propertyType] || 'Building';
          return (
            <TouchableOpacity key={propertyType} onPress={() => onChange('type', propertyType)} style={[styles.propertyTypeCardScroll, isSelected ? styles.propertyTypeCardSelected : styles.propertyTypeCardUnselected]}>
              <View style={styles.propertyTypeIconTop}>{renderIcon(iconName, 20, isSelected ? '#bfb7fd' : '#9ca3af')}</View>
              <Text style={[styles.propertyTypeTextBottom, isSelected ? styles.propertyTypeTextSelected : styles.propertyTypeTextUnselected]} numberOfLines={2}>{propertyType}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

// Memoized Amenities Component
const MemoizedAmenities = memo(function MemoizedAmenities({ type, selectedAmenities, onChange, styles }) {
  const typeAmenities = getAmenitiesForType(type);
  if (typeAmenities.length === 0) {
    return (
      <View style={styles.noAmenitiesContainer}>
        <Text style={styles.noAmenitiesText}>No amenities available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.inputLabel}>Amenities</Text>
      <View style={styles.amenityGrid}>
        {typeAmenities.map((amenity) => {
          const isSelected = selectedAmenities?.includes(amenity.id);
          return (
            <TouchableOpacity key={amenity.id} onPress={() => {
              const current = selectedAmenities || [];
              onChange('amenities', isSelected ? current.filter(id => id !== amenity.id) : [...current, amenity.id]);
            }} style={[styles.amenityChipCompact, isSelected ? styles.amenityChipSelected : styles.amenityChipUnselected]}>
              {renderIcon(amenity.icon, 12, isSelected ? 'white' : '#6b7280')}
              <Text style={[styles.amenityTextCompact, isSelected ? styles.amenityTextSelected : styles.amenityTextUnselected]}>{amenity.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const PropertyForm = memo(({
  formData,
  handleChange,
  styles,
  PROPERTY_STRUCTURE,
  INDIAN_STATES,
  showStateDropdown,
  setShowStateDropdown,
  showPriceUnitPicker,
  setShowPriceUnitPicker,
  showSizeUnitPicker,
  setShowSizeUnitPicker,
  pickImage,
  locationSuggestions,
  locationLoading,
  showLocationDropdown,
  selectLocation
}) => {
  return (
    <View style={styles.formContainer}>
      <MemoizedRadioGroup label="Listing Type" name="listingType" options={['Sell', 'Rent']} selectedValue={formData.listingType} onChange={handleChange} styles={styles} />
      <MemoizedRadioGroup label="Property Category" name="category" options={Object.keys(PROPERTY_STRUCTURE)} selectedValue={formData.category} onChange={handleChange} styles={styles} />
      <MemoizedPropertyTypeGroup category={formData.category} selectedValue={formData.type} onChange={handleChange} styles={styles} PROPERTY_STRUCTURE={PROPERTY_STRUCTURE} />

      {formData.category === 'Residential' && ['Apartment/Flats', 'Builder Floor', 'House/Villa'].includes(formData.type) && (
        <MemoizedRadioGroup label="Configuration" name="bhk" options={['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK']} selectedValue={formData.bhk} onChange={handleChange} isSmall styles={styles} />
      )}

      {formData.category === 'Commercial' && (
        <MemoizedRadioGroup label="Configuration" name="commercialConfig" selectedValue={formData.commercialConfig} onChange={handleChange} isSmall styles={styles}
          options={
            formData.type === 'Office' ? ['Co-working Space', 'Bareshell Office', 'Ready to Move Office'] :
            formData.type === 'Shop/Showroom' ? ['Shop', 'Showroom', 'Retail Space'] :
            formData.type === 'Storage' ? ['Cold Storage', 'Warehouse', 'Godown'] :
            formData.type === 'Industry' ? ['Manufacturing', 'Factory', 'Industrial Unit'] :
            formData.type === 'Hospitality' ? ['Guesthouse', 'Banquet Halls', 'Hotels/Resorts'] : []
          }
        />
      )}

      {((formData.category === 'Residential' && !['Plot', 'Farmhouse'].includes(formData.type)) ||
        (formData.category === 'Commercial' && ['Office', 'Shop/Showroom'].includes(formData.type) && formData.commercialConfig !== 'Bareshell Office')) && (
          <MemoizedRadioGroup label="Furnishing" name="furnishing" options={['Unfurnished', 'Semi', 'Furnished']} selectedValue={formData.furnishing} onChange={handleChange} isSmall styles={styles} />
      )}

      {/* State Dropdown */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>State*</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowStateDropdown(!showStateDropdown)}>
          <Text style={[styles.dropdownPlaceholder, formData.state && styles.dropdownSelected]}>{formData.state || 'Select state'}</Text>
          <ChevronDown size={16} color="#9ca3af" />
        </TouchableOpacity>
        {showStateDropdown && (
          <View style={styles.stateDropdown}>
            <ScrollView style={styles.stateScrollView} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
              {INDIAN_STATES.map((state) => (
                <TouchableOpacity key={state} style={styles.stateItem} onPress={() => { handleChange('state', state); setShowStateDropdown(false); }}>
                  <Text style={styles.stateText}>{state}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <MemoizedTextInput label="City*" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" styles={styles} />

      {/* Location Search */}
      <View style={[styles.section, { zIndex: 2000 }]}>
        <Text style={styles.inputLabel}>Property Location*</Text>
        <View style={styles.locationContainer}>
          <TextInput value={formData.location || ''} onChangeText={(text) => handleChange('location', text)} placeholder="Enter property location" style={styles.textInputStyled} />

          {locationLoading && (
            <View style={styles.locationDropdown}>
              <Text style={{ padding: 12, color: '#6b7280', fontSize: 14 }}>Searching...</Text>
            </View>
          )}

          {showLocationDropdown && locationSuggestions.length > 0 && !locationLoading && (
            <View style={styles.locationDropdown}>
              {locationSuggestions.map((loc) => (
                <TouchableOpacity key={loc.id} onPress={() => selectLocation(loc)} style={styles.locationItem}>
                  <View style={styles.locationIcon}><LucideIcons.MapPin size={16} color="#6b7280" /></View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationMainText}>{loc.main_text}</Text>
                    {loc.secondary_text && <Text style={styles.locationSecondaryText}>{loc.secondary_text}</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <MemoizedTextInput label="Project or Society Name" name="title" value={formData.title} onChange={handleChange} placeholder="Name of project/society" styles={styles} />
      <MemoizedTextInput label="Address*" name="owner" value={formData.owner} onChange={handleChange} placeholder="Complete address" styles={styles} />

      {/* Price Input */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Price</Text>
        <View style={styles.rowInputs}>
          <View style={styles.priceInputContainer}>
            <TextInput keyboardType="numeric" value={String(formData.priceValue || '')} onChangeText={(t) => handleChange('priceValue', t)} placeholder="Enter price" style={styles.textInputStyled} />
          </View>
          <View style={styles.priceUnitContainer}>
            <TouchableOpacity style={styles.dropdownStyled} onPress={() => setShowPriceUnitPicker(!showPriceUnitPicker)}>
              <Text style={formData.priceUnit ? styles.dropdownSelected : styles.dropdownPlaceholder}>{formData.priceUnit || 'Unit'}</Text>
              <ChevronDown size={18} color="#9ca3af" />
            </TouchableOpacity>
            {showPriceUnitPicker && (
              <View style={styles.dropdownOptions}>
                {['Thousands', 'Lakh', 'Crore'].map((unit) => (
                  <TouchableOpacity key={unit} style={styles.dropdownOption} onPress={() => { handleChange('priceUnit', unit); setShowPriceUnitPicker(false); }}>
                    <Text style={styles.dropdownOptionText}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {formData.listingType === 'Rent' && <MemoizedTextInput label="Bond" name="bond" value={String(formData.bond || '')} onChange={handleChange} placeholder="Enter bond" keyboardType="numeric" styles={styles} />}

      {/* Size Input */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Size</Text>
        <View style={styles.rowInputs}>
          <View style={styles.priceInputContainer}>
            <TextInput keyboardType="numeric" value={String(formData.sizeValue || '')} onChangeText={(t) => handleChange('sizeValue', t)} placeholder="Enter size" style={styles.textInputStyled} />
          </View>
          <View style={styles.priceUnitContainer}>
            <TouchableOpacity style={styles.dropdownStyled} onPress={() => setShowSizeUnitPicker(!showSizeUnitPicker)}>
              <Text style={formData.sizeUnit ? styles.dropdownSelected : styles.dropdownPlaceholder}>{formData.sizeUnit || 'Unit'}</Text>
              <ChevronDown size={18} color="#9ca3af" />
            </TouchableOpacity>
            {showSizeUnitPicker && (
              <View style={styles.dropdownOptions}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {['Sq. Ft.', 'Sq. M.', 'Sq. Yd.', 'Acre', 'Hectare'].map((unit) => (
                    <TouchableOpacity key={unit} style={styles.dropdownOption} onPress={() => { handleChange('sizeUnit', unit); setShowSizeUnitPicker(false); }}>
                      <Text style={styles.dropdownOptionText}>{unit}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>

      <MemoizedTextInput label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Property Owner Name" styles={styles} />
      <MemoizedTextInput label="Owner Phone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="Owner Phone Number" keyboardType="phone-pad" styles={styles} />

      {/* Image Upload */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Property Image</Text>
        <TouchableOpacity onPress={pickImage} style={[styles.imageUpload, formData.image ? styles.imageUploaded : styles.imageEmpty]}>
          {formData.image ? <Image source={{ uri: formData.image }} style={styles.uploadedImage} /> : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconContainer}><CloudUpload size={24} color="#9ca3af" /></View>
              <Text style={styles.uploadText}>Upload Image</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <MemoizedAmenities type={formData.type} selectedAmenities={formData.amenities} onChange={handleChange} styles={styles} />
      <MemoizedTextInput label="Details" name="details" value={formData.details} onChange={handleChange} placeholder="Add property detail here..." multiline numberOfLines={4} styles={styles} />
    </View>
  );
});

PropertyForm.displayName = 'PropertyForm';

export default PropertyForm;
