import { FileText, CheckCircle } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import styles from '../styles/agreementStyles';
import { useSelector } from 'react-redux';

export default function AgreementView({ onMarkAgreementDone }) {
  // Get customer from Redux store
  const { selectedDeal } = useSelector(state => state.deals);
  const { customers } = useSelector(state => state.customers);

  const customer = customers.find(c => c.id === selectedDeal?.customerId);
  const isInProcessStage = customer?.stage === 'In-Process';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Pana Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/images/pana.png')}
          style={styles.panaImage}
          resizeMode="contain"
        />
      </View>


      {/* Agreement Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Agreement Documents</Text>



        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <FileText size={24} color="#9A8CFC" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Documents</Text>
            <Text style={styles.actionSubtitle}>View all uploaded documents</Text>
          </View>
        </TouchableOpacity>
      </View>


      {/* Complete Agreement Button - Only show when customer is in In-Process stage */}
      {isInProcessStage && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onMarkAgreementDone}
        >
          <CheckCircle size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.completeButtonText}>Mark Agreement Complete</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}


