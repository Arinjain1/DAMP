import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Mock Data
const SUBSCRIPTION_PLANS = [
  { 
    id: 1, 
    name: 'Monthly', 
    price: '99.00', 
    period: 'Billed Monthly',
    isBestValue: false 
  },
  { 
    id: 2, 
    name: 'Yearly', 
    price: '1100.00', 
    period: 'Free 1 Week Trial',
    save: 'Save ₹46.00',
    isBestValue: true 
  },
];

const FEATURES = [
  'Unlimited Listings',
  'Lead & Client Tracker',
  'Auto Follow-Up Reminders',
  'Smart Suggestions & Alerts'
];

const SubscriptionSheet = ({ isOpen, onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubscribe(selectedPlan);
    }, 1500);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* === HEADER GRADIENT (Full Page) === */}
        <LinearGradient
          colors={['#BFB7FD', '#E5E1FF', '#FFFFFF']}
          locations={[0, 0.4, 1]}
          style={styles.headerGradient}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.restoreText}>Restore</Text>
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Broker 99</Text>
            <Text style={styles.subtitle}>Deal Karo, Pocket Bharo</Text>
          </View>

          {/* === FEATURES LIST === */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Check size={16} color="#111827" strokeWidth={3} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* === PLAN CARDS === */}
          <View style={styles.plansContainer}>
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan)}
                  activeOpacity={0.9}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected
                  ]}
                >
                  {/* Selection Checkmark */}
                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <Check size={10} color="white" strokeWidth={4} />
                    </View>
                  )}

                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planPrice}>₹{plan.price}</Text>
                    
                    {plan.save && (
                      <Text style={styles.saveText}>{plan.save}</Text>
                    )}
                  </View>

                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* === BOTTOM ACTION === */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handlePayment}
              disabled={loading}
              style={styles.subscribeButton}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#1F2937" />
              ) : (
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Text style={styles.subscribeButtonText}>Subscribe</Text>
                  <ArrowRight size={16} color="#1F2937" />
                </View>
              )}
            </TouchableOpacity>
          </View>

        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFB7FD',
  },
  
  // Header - Full Page
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    padding: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: -0.5,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },

  // Features
  featuresContainer: {
    marginBottom: 40,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Montserrat_600SemiBold',
  },

  // Plans
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    height: 140,
    justifyContent: 'space-between',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#111827',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#10B981', 
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
  planName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    fontFamily: 'Poppins_600SemiBold',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '200',
    color: '#111827',
    letterSpacing: -0.2,
    fontFamily: 'Lato_700Bold',
  },
  saveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    marginTop: 3,
    fontFamily: 'Poppins_700Bold',
  },
  planPeriod: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
    fontFamily: 'Lato_400Regular',
  },

  // Footer
  footer: {
    paddingHorizontal: 0,
  },
  subscribeButton: {
    backgroundColor: '#C7D2FE',
    paddingVertical: 14,
    borderRadius: 24, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'Poppins_700Bold',
  },
});

export default SubscriptionSheet;