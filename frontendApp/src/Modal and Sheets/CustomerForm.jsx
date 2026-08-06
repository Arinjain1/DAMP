import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Dimensions, PanResponder, Image } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

// Helper to format budget text
const formatBudget = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString()}`;
};

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

// Memoized Budget Slider Component
const MemoizedBudgetSlider = memo(function MemoizedBudgetSlider({ minLimit, maxLimit, initialMin, initialMax, onSlidingComplete, styles }) {
  const sliderWidth = Dimensions.get('window').width - 80;
  const [localRange, setLocalRange] = useState({ min: initialMin, max: initialMax });
  const localRangeRef = useRef({ min: initialMin, max: initialMax });

  useEffect(() => {
    localRangeRef.current = { min: initialMin, max: initialMax };
    setLocalRange({ min: initialMin, max: initialMax });
  }, [initialMin, initialMax]);

  const positionToBudget = useCallback((position) => {
    const percentage = Math.max(0, Math.min(1, position / sliderWidth));
    return minLimit + (percentage * (maxLimit - minLimit));
  }, [sliderWidth, minLimit, maxLimit]);

  const budgetToPosition = useCallback((budget) => {
    const percentage = (budget - minLimit) / (maxLimit - minLimit);
    return percentage * sliderWidth;
  }, [minLimit, maxLimit, sliderWidth]);

  const minPosRef = useRef(0);
  const maxPosRef = useRef(0);

  const updateRange = (type, value) => {
    localRangeRef.current[type] = value;
    setLocalRange({ ...localRangeRef.current });
  };

  const minPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      minPosRef.current = budgetToPosition(localRangeRef.current.min);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPos = minPosRef.current + gestureState.dx;
      const newBudget = Math.max(minLimit, Math.min(localRangeRef.current.max - 10000, positionToBudget(newPos)));
      updateRange('min', newBudget);
    },
    onPanResponderRelease: () => {
      onSlidingComplete(localRangeRef.current.min, localRangeRef.current.max);
    }
  })).current;

  const maxPanResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      maxPosRef.current = budgetToPosition(localRangeRef.current.max);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newPos = maxPosRef.current + gestureState.dx;
      const newBudget = Math.min(maxLimit, Math.max(localRangeRef.current.min + 10000, positionToBudget(newPos)));
      updateRange('max', newBudget);
    },
    onPanResponderRelease: () => {
      onSlidingComplete(localRangeRef.current.min, localRangeRef.current.max);
    }
  })).current;

  const minPos = budgetToPosition(localRange.min);
  const maxPos = budgetToPosition(localRange.max);
  const trackWidth = Math.max(0, maxPos - minPos);

  return (
    <View style={styles.budgetContainer}>
      <Text style={styles.budgetLabel}>{formatBudget(localRange.min)} - {formatBudget(localRange.max)}</Text>
      <View style={styles.budgetSliderContainer}>
        <View style={styles.budgetSlider}>
          <View style={styles.budgetSliderTrack} />
          <View style={[styles.budgetTrack, { left: minPos, width: trackWidth }]} />
          <View style={[styles.budgetThumbTouchArea, { left: minPos - 20 }]} {...minPanResponder.panHandlers}>
            <View style={styles.budgetThumb} />
          </View>
          <View style={[styles.budgetThumbTouchArea, { left: maxPos - 20 }]} {...maxPanResponder.panHandlers}>
            <View style={styles.budgetThumb} />
          </View>
        </View>
      </View>
      <View style={styles.budgetRangeLabels}>
        <Text style={styles.budgetRangeText}>{formatBudget(minLimit)}</Text>
        <Text style={styles.budgetRangeText}>{formatBudget(maxLimit)}+</Text>
      </View>
    </View>
  );
});

const CustomerForm = memo(({
  formData,
  handleChange,
  styles,
  PROPERTY_STRUCTURE,
  budgetRange,
  setBudgetRange,
  pickImage
}) => {
  return (
    <View style={styles.formContainer}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity 
          onPress={pickImage} 
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            backgroundColor: '#f9fafb',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcons.Camera size={22} color="#6b7280" />
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 2, fontWeight: '500' }}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <MemoizedRadioGroup label="Property Requirements" name="listingType" options={['Buy', 'Rent/Lease']} selectedValue={formData.listingType} onChange={handleChange} styles={styles} />
      <MemoizedRadioGroup label="What Kind of Property?" name="category" options={Object.keys(PROPERTY_STRUCTURE)} selectedValue={formData.category} onChange={handleChange} styles={styles} />
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

      <MemoizedTextInput label="Customer Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter customer name" styles={styles} />
      <MemoizedTextInput label="Contact Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter contact number" keyboardType="phone-pad" styles={styles} />
      <MemoizedTextInput label="Preferred Location" name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} placeholder="Select preferred location" styles={styles} />

      {/* Budget Range - Optimized */}
      <View style={styles.section}>
        <Text style={styles.inputLabel}>Budget Range</Text>
        <MemoizedBudgetSlider
          minLimit={10000}
          maxLimit={100000000}
          initialMin={budgetRange.min}
          initialMax={budgetRange.max}
          onSlidingComplete={(min, max) => setBudgetRange({ min, max })}
          styles={styles}
        />
      </View>

      <MemoizedTextInput label="Notes" name="note" value={formData.note} onChange={handleChange} placeholder="Add task details..." multiline numberOfLines={4} styles={styles} />
    </View>
  );
});

CustomerForm.displayName = 'CustomerForm';

export default CustomerForm;
