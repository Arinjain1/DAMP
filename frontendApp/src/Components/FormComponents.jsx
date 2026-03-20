import { memo } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

// Memoized Radio Button Component
export const RadioButton = memo(({ 
  value, 
  selectedValue, 
  onPress, 
  label, 
  styles 
}) => {
  const isSelected = selectedValue === value;
  
  return (
    <TouchableOpacity 
      onPress={() => onPress(value)}
      style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}
    >
      <View style={[
        styles.radioButton, 
        isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected
      ]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={[
        styles.radioText, 
        isSelected ? styles.radioTextSelected : styles.radioTextUnselected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

RadioButton.displayName = 'RadioButton';

// Memoized Small Radio Button Component
export const SmallRadioButton = memo(({ 
  value, 
  selectedValue, 
  onPress, 
  label, 
  styles 
}) => {
  const isSelected = selectedValue === value;
  
  return (
    <TouchableOpacity 
      onPress={() => onPress(value)}
      style={[styles.radioOption, isSelected ? styles.radioOptionSelected : null]}
    >
      <View style={[
        styles.radioButtonSmall, 
        isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected
      ]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
      <Text style={[
        styles.radioText, 
        isSelected ? styles.radioTextSelected : styles.radioTextUnselected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

SmallRadioButton.displayName = 'SmallRadioButton';

// Memoized Property Type Card Component
export const PropertyTypeCard = memo(({ 
  type, 
  selectedType, 
  onPress, 
  icon, 
  styles 
}) => {
  const isSelected = selectedType === type;
  
  return (
    <TouchableOpacity 
      onPress={() => onPress(type)}
      style={[
        styles.propertyTypeCardScroll, 
        isSelected ? styles.propertyTypeCardSelected : styles.propertyTypeCardUnselected
      ]}
    >
      <View style={styles.propertyTypeIconTop}>
        {icon}
      </View>
      <Text style={[
        styles.propertyTypeTextScroll, 
        isSelected ? styles.propertyTypeTextSelected : styles.propertyTypeTextUnselected
      ]}>
        {type}
      </Text>
    </TouchableOpacity>
  );
});

PropertyTypeCard.displayName = 'PropertyTypeCard';

// Memoized State Item Component
export const StateItem = memo(({ 
  state, 
  onPress, 
  styles 
}) => (
  <TouchableOpacity 
    style={styles.stateItem} 
    onPress={() => onPress(state)}
  >
    <Text style={styles.stateText}>{state}</Text>
  </TouchableOpacity>
));

StateItem.displayName = 'StateItem';
