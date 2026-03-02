import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Modal,
  ActivityIndicator
} from 'react-native';
import styles from '../styles/subscriptionStyles';

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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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

export default SubscriptionSheet;