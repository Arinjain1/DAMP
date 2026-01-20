import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StyleSheet,
  StatusBar
} from 'react-native';
import { ArrowRight, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    price: '0.00', 
    period: 'Free 1 Week Trial',
    save: 'Save $40.00',
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
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        
        {/* === HEADER GRADIENT (Updated Color) === */}
        <LinearGradient
          colors={['#BFB7FD', '#E5E1FF', '#FFFFFF']}
          locations={[0, 0.6, 1]}
          style={styles.headerGradient}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.restoreText}>Restore</Text>
            </TouchableOpacity>
          </View>

          {/* Title Section (Compact) */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Broker 99</Text>
            <Text style={styles.subtitle}>Deal Karo, Pocket Bharo</Text>
          </View>
        </LinearGradient>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* === FEATURES LIST (Compact) === */}
          <View style={styles.featuresContainer}>
            {FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Check size={16} color="#111827" strokeWidth={3} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* === PLAN CARDS (Smaller) === */}
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
                    <Text style={styles.planPrice}>${plan.price}</Text>
                    
                    {plan.save && (
                      <Text style={styles.saveText}>{plan.save}</Text>
                    )}
                  </View>

                  <Text style={styles.planPeriod}>{plan.period}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>

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
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
                <ArrowRight size={18} color="#1F2937" />
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 30, // Reduced padding
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Reduced margin
  },
  closeButton: {
    padding: 4,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26, // Smaller Title
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13, // Smaller Subtitle
    color: '#4B5563',
    fontWeight: '500',
  },

  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  // Features
  featuresContainer: {
    marginTop: 20,
    marginBottom: 30,
    gap: 14, // Reduced gap
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 13, // Smaller text
    fontWeight: '600',
    color: '#374151',
  },

  // Plans
  plansContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  planCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16, // Reduced padding inside card
    borderWidth: 1,
    borderColor: '#9CA3AF',
    height: 150, // Reduced Height
    justifyContent: 'space-between',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#111827',
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981', 
    width: 20, // Smaller Badge
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
  },
  planName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24, // Smaller Price
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  planPeriod: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  subscribeButton: {
    backgroundColor: '#C7D2FE', // Matching Button Color
    paddingVertical: 14, // Slimmer Button
    borderRadius: 24, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default SubscriptionSheet;