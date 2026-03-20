import { memo } from 'react';
import { View, Text } from 'react-native';

const CustomerForm = memo(({ 
  formData, 
  handleChange, 
  styles,
  PROPERTY_STRUCTURE,
  budgetRange,
  handleBudgetChange,
  // Add other props as needed
}) => {
  return (
    <View style={styles.formContainer}>
      {/* Customer form content will be moved here */}
      <Text>Customer Form</Text>
    </View>
  );
});

CustomerForm.displayName = 'CustomerForm';

export default CustomerForm;
