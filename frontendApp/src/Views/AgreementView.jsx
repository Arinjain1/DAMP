import { FileText, Upload, Download, CheckCircle, CreditCard } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import { collabAPI } from '../config/api';
import { showToast } from '../utils/toast';
import { fetchCustomers } from '../store/slices/customersSlice';

export default function AgreementView({ onMarkAgreementDone }) {
  const dispatch = useDispatch();
  // Get customer and auth user from Redux store
  const { selectedDeal } = useSelector(state => state.deals);
  const { customers } = useSelector(state => state.customers);
  const { user } = useSelector(state => state.auth);
  
  const customer = customers.find(c => c.id === selectedDeal?.customerId);
  const isInProcessStage = customer && customer.stage !== 'Completed';

  // Determine user settlement role and statuses
  const isMeBroker1 = customer?.broker1Id === user?.id;
  const isMeBroker2 = customer?.broker2Id === user?.id;
  const hasMeSettled = (isMeBroker1 && customer?.broker1Settled) || (isMeBroker2 && customer?.broker2Settled);
  const isFullySettled = customer?.commissionStatus === 'Paid';



  const [settling, setSettling] = useState(false);

  const handleSettleSplit = async () => {
    if (!customer?.collaborationRoomId) return;
    setSettling(true);
    try {
      const res = await collabAPI.settleSplit(customer.collaborationRoomId);
      if (res.data.success) {
        showToast.success(res.data.message || 'Split settlement marked!');
        // Reload customers list to update frontend state
        dispatch(fetchCustomers());
      }
    } catch (err) {
      console.error('Error settling commission split:', err);
      showToast.error(err.response?.data?.message || 'Failed to settle commission split');
    } finally {
      setSettling(false);
    }
  };

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

      {/* Settle Commission Split Button - Only show when deal is collaborated */}
      {customer?.collaborated && (
        <TouchableOpacity 
          style={[styles.settleButton, (isFullySettled || hasMeSettled) && styles.settleButtonDisabled]}
          onPress={handleSettleSplit}
          disabled={settling || isFullySettled || hasMeSettled}
        >
          {settling ? (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
          ) : (
            <CreditCard size={20} color="#ffffff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.completeButtonText}>
            {isFullySettled 
              ? 'Commission Settled (Paid)' 
              : hasMeSettled 
                ? 'Settle marked (Waiting for partner)' 
                : 'Settle Commission Split'}
          </Text>
        </TouchableOpacity>
      )}

      
      {/* Complete Agreement Button */}
      {isInProcessStage ? (
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={onMarkAgreementDone}
        >
          <CheckCircle size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.completeButtonText}>Mark Agreement Complete</Text>
        </TouchableOpacity>
      ) : (customer?.stage === 'Completed') ? (
        <View style={[styles.completeButton, { backgroundColor: '#10b981' }]}>
          <CheckCircle size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.completeButtonText}>Agreement Completed 🎉</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingTop: 15,
  },
  panaImage: {
    width: '100%',
    height: 280,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d97706',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  checklistContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  checklistText: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  uncheckedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  uncheckedText: {
    color: '#6b7280',
  },
  completeButton: {
    backgroundColor: '#9A8CFC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  settleButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  settleButtonDisabled: {
    backgroundColor: '#10B981',
    opacity: 0.9,
  },
});
