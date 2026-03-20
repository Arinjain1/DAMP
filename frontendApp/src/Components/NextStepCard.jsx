import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

const NextStepCard = memo(({ 
  nextStage, 
  customer, 
  selectedPropertyIds, 
  onProceed, 
  styles 
}) => {
  const isDisabled = customer.stage === 'Contacted' && selectedPropertyIds.length === 0;

  return (
    <View style={styles.nextStepCard}>
      <View style={styles.nextStepInfo}>
        <Text style={styles.nextStepLabel}>NEXT STEP</Text>
        <Text style={styles.nextStepTitle}>Move to {nextStage.label}</Text>
        <Text style={styles.nextStepSub}>Advance stage to track progress.</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.proceedButton,
          isDisabled && styles.proceedButtonDisabled
        ]}
        onPress={onProceed}
        activeOpacity={0.9}
        disabled={isDisabled}
      >
        <Text style={styles.proceedButtonText}>Proceed to {nextStage.label}</Text>
        <ChevronRight size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
});

NextStepCard.displayName = 'NextStepCard';

export default NextStepCard;
