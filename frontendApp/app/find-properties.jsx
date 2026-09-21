import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Search, Shield, ChevronRight, Check, Send, MapPin } from 'lucide-react-native';
import { addSentConnectRequest } from '../src/store/slices/uiSlice';
import { showToast } from '../src/utils/toast';
import { collabAPI } from '../src/config/api';

export default function FindPropertiesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();

  // View state management: 'list' | 'detail' | 'request'
  const [step, setStep] = useState(params.initialStep || 'list');
  const [selectedBrokerMatch, setSelectedBrokerMatch] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState('50-50');
  const [requestMessage, setRequestMessage] = useState('');
  
  // Get active selected customer from Redux
  const { selectedCustomer } = useSelector((state) => state.customers);
  const customer = selectedCustomer;

  // Retrieve properties from Redux store for matchmaking
  const { properties } = useSelector((state) => state.properties);
  const allProperties = properties || [];

  const [matchedBrokerProperties, setMatchedBrokerProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await collabAPI.getMatchingProperties(customer.id);
        if (res.data.success) {
          const mapped = res.data.data.map(item => {
            const ownerName = item.broker_name || 'Property Broker';
            const initials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            return {
              id: item.id,
              name: ownerName,
              compat: Math.round(item.compatibility || 50),
              bhk: item.configuration || '2 BHK',
              price: item.price >= 10000000 
                ? `₹${(item.price / 10000000).toFixed(1)} Cr` 
                : `₹${(item.price / 100000).toFixed(0)} L`,
              loc: item.locality || item.city || 'Mumbai',
              initial: initials || 'PB',
              requestStatus: item.request_status,
              property: item
            };
          });
          setMatchedBrokerProperties(mapped);

          if (params.initialStep === 'detail' && params.matchedId) {
            const matchedItem = mapped.find(item => String(item.id) === String(params.matchedId));
            if (matchedItem) {
              setSelectedBrokerMatch(matchedItem);
            } else {
              setStep('list');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching matching properties:', err);
        showToast.error('Failed to load matching properties');
      } finally {
        setLoading(false);
      }
    };

    if (customer?.id) {
      fetchMatches();
    }
  }, [customer?.id, params.initialStep, params.matchedId]);

  // Screen body logic below

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No Client Selected</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/dashboard')}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format budget for display
  const formatBudget = (min, max) => {
    if (!min && !max) return 'N/A';
    if (min && !max) return `${min} L+`;
    if (!min && max) return `Upto ${max} L`;
    return `${min}-${max} L`;
  };

  const handleConfirmSend = async () => {
    try {
      const payload = {
        property_id: selectedBrokerMatch.property.id,
        client_id: customer.id,
        role: 'Client-side',
        proposed_split: selectedSplit.replace('-', '/'),
        message: requestMessage || `Hi, I have a client interested in your property: ${selectedBrokerMatch.property.title}. Let's collaborate!`
      };
      
      const res = await collabAPI.sendProposal(payload);
      if (res.data.success) {
        dispatch(addSentConnectRequest(customer.id));
        showToast.success(`Request sent to ${selectedBrokerMatch?.name || 'Broker'}!`);
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error('Error sending collaboration proposal:', err);
      showToast.error(err.response?.data?.message || 'Failed to send collaboration request');
    }
  };

  return (
    <View style={styles.container}>
      {/* Step 1: MATCHES LIST */}
      {step === 'list' && (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace('/dashboard')} style={styles.iconButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find Matching Properties</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Client Requirement Card */}
            <View style={styles.requirementCard}>
              <Text style={styles.requirementTag}>CLIENT REQUIREMENT</Text>
              <Text style={styles.requirementTitle}>{customer.name} • Requires {customer.configuration || '3 BHK'}</Text>
              <Text style={styles.requirementSubtitle}>₹{formatBudget(customer.budgetMin, customer.budgetMax)} • {customer.preferredLocation || 'Bandra'}</Text>
            </View>

            {/* Shield Warning */}
            <View style={styles.warningBanner}>
              <Shield size={20} color="#d97706" />
              <Text style={styles.warningText}>
                Property&apos;s exact address and owner are hidden. They will unlock after the request is accepted.
              </Text>
            </View>

            {/* Match Heading */}
            <Text style={styles.sectionHeading}>
              {loading ? 'Finding properties...' : `${matchedBrokerProperties.length} matching properties found for your client`}
            </Text>

            {/* Matches Cards */}
            <View style={{ gap: 12 }}>
              {loading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#635BFF" />
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 12, fontFamily: 'Montserrat_500Medium' }}>Finding matching properties...</Text>
                </View>
              ) : matchedBrokerProperties.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                  <Text style={{ color: '#6b7280', fontSize: 14, fontFamily: 'Montserrat_500Medium' }}>No matching properties found in inventory.</Text>
                </View>
              ) : (
                matchedBrokerProperties.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.matchCard}
                    onPress={() => {
                      setSelectedBrokerMatch(item);
                      setStep('detail');
                    }}
                  >
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{item.initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <Text style={styles.matchBrokerName}>{item.name}</Text>
                        <View style={styles.scoreBadge}>
                          <Text style={styles.scoreText}>{item.compat}% Match</Text>
                        </View>
                        {item.requestStatus && (
                          <View style={{ backgroundColor: item.requestStatus === 'Matched' ? '#FEF3C7' : '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: item.requestStatus === 'Matched' ? '#FCD34D' : '#A7F3D0' }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: item.requestStatus === 'Matched' ? '#B45309' : '#065F46', fontFamily: 'Montserrat_700Bold' }}>
                              {item.requestStatus === 'Matched' ? 'SENT' : 'ACTIVE'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.matchDetails}>{item.bhk} • {item.price}</Text>
                      <Text style={styles.matchLocality}>{item.loc}</Text>
                    </View>
                    <ChevronRight size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Step 2: MATCH DETAILS */}
      {step === 'detail' && (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => {
                if (params.initialStep === 'detail') {
                  router.replace('/dashboard');
                } else {
                  setStep('list');
                }
              }} 
              style={styles.iconButton}
            >
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Property Details</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Broker Info Card */}
            <View style={styles.brokerCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={[styles.avatarCircle, { width: 50, height: 50, borderRadius: 25 }]}>
                  <Text style={[styles.avatarText, { fontSize: 18 }]}>{selectedBrokerMatch?.initial}</Text>
                </View>
                <View>
                  <Text style={styles.brokerNameText}>{selectedBrokerMatch?.name}</Text>
                  <Text style={styles.brokerAgencyText}>
                    {`Verified Broker • ${selectedBrokerMatch?.loc ? selectedBrokerMatch.loc.split(',').pop().trim() : 'Mumbai'}`}
                  </Text>
                </View>
              </View>

              <View style={styles.lockInfoBox}>
                <Shield size={16} color="#7c3aed" />
                <Text style={styles.lockInfoText}>
                  Contact details will be unlocked after the request is accepted.
                </Text>
              </View>
            </View>

            {/* Property Details Grid */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsCardTitle}>Property Specifications</Text>
              <View style={{ gap: 12 }}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>BHK</Text>
                  <Text style={styles.detailValue}>{selectedBrokerMatch?.bhk || '2 BHK'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Budget</Text>
                  <Text style={styles.detailValue}>{selectedBrokerMatch?.price || '₹75-90 L'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Locality</Text>
                  <Text style={styles.detailValue}>{selectedBrokerMatch?.loc || 'Andheri East'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Property Type</Text>
                  <Text style={styles.detailValue}>Residential Flat</Text>
                </View>
              </View>
            </View>

            {/* Match score bar */}
            <View style={styles.scoreBarCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.scoreBarTitle}>Match Score</Text>
                <Text style={styles.scorePercentText}>{selectedBrokerMatch?.compat || 91}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${selectedBrokerMatch?.compat || 91}%` }]} />
              </View>
              <Text style={styles.scoreSubtext}>Budget, locality, and BHK all match</Text>
            </View>

            {/* Send Request Button */}
            {selectedBrokerMatch?.requestStatus ? (
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: '#10B981', opacity: 0.9 }]} 
                disabled={true}
              >
                <Text style={styles.submitButtonText}>
                  {selectedBrokerMatch.requestStatus === 'Matched' ? 'Request Sent (Pending)' : 'Already Active in Collab'}
                </Text>
                <Check size={18} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.submitButton} onPress={() => setStep('request')}>
                <Text style={styles.submitButtonText}>Proceed to Split Details</Text>
                <Send size={18} color="white" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Step 3: COMMISSION SPLIT SELECTOR */}
      {step === 'request' && (
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep('detail')} style={styles.iconButton}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Send Request</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Target Card */}
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>Sending Request To</Text>
              <Text style={styles.targetName}>{selectedBrokerMatch?.name || 'Ravi Sir'}</Text>
            </View>

            {/* Split Picker */}
            <Text style={styles.formLabel}>Choose Commission Split</Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {['50-50', '60-40', '55-45', '70-30'].map(split => {
                const isSelected = selectedSplit === split;
                const formattedSplit = split.replace('-', '/');
                return (
                  <TouchableOpacity
                    key={split}
                    onPress={() => setSelectedSplit(split)}
                    style={[
                      styles.splitOptionCard,
                      isSelected && styles.splitOptionCardActive
                    ]}
                  >
                    <Text style={[
                      styles.splitOptionText,
                      isSelected && styles.splitOptionTextActive
                    ]}>
                      {formattedSplit} Split
                    </Text>
                    {isSelected && <Check size={18} color="#635BFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Message input */}
            <Text style={styles.formLabel}>Message (Optional)</Text>
            <TextInput
              value={requestMessage}
              onChangeText={setRequestMessage}
              placeholder="Write a message (optional)..."
              placeholderTextColor="#9ca3af"
              style={styles.messageInput}
              multiline
            />

            {/* Notice */}
            <View style={styles.noticeContainer}>
              <Text style={styles.noticeText}>
                ⓘ Exact details will be unlocked only after the request is accepted.
              </Text>
            </View>

            {/* Confirm button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleConfirmSend}>
              <Text style={styles.submitButtonText}>Confirm & Send Request</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 12,
    backgroundColor: '#635BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconButton: {
    padding: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  requirementCard: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requirementTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Montserrat_700Bold',
  },
  requirementSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  warningBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#b45309',
    flex: 1,
    fontWeight: '500',
    fontFamily: 'Lato_400Regular',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  matchCard: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    fontFamily: 'Montserrat_700Bold',
  },
  matchBrokerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
  scoreBadge: {
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#a7f3d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  matchDetails: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  matchLocality: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    fontFamily: 'Lato_400Regular',
  },
  brokerCard: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  brokerNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
  brokerAgencyText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  lockInfoBox: {
    backgroundColor: '#f3e8ff',
    borderColor: '#e9d5ff',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  lockInfoText: {
    fontSize: 11,
    color: '#6b21a8',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'Lato_400Regular',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  detailsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
    width: '30%',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
    width: '70%',
    textAlign: 'right',
  },
  scoreBarCard: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  scoreBarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'Montserrat_700Bold',
  },
  scorePercentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#635BFF',
    fontFamily: 'Montserrat_700Bold',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#635BFF',
    borderRadius: 3,
  },
  scoreSubtext: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Lato_400Regular',
  },
  submitButton: {
    backgroundColor: '#635BFF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  targetCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  targetLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
    fontFamily: 'Lato_400Regular',
  },
  targetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Montserrat_700Bold',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  splitOptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  splitOptionCardActive: {
    borderColor: '#635BFF',
    backgroundColor: '#f5f3ff',
  },
  splitOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Lato_400Regular',
  },
  splitOptionTextActive: {
    fontWeight: '700',
    fontFamily: 'Montserrat_700Bold',
  },
  messageInput: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    fontFamily: 'Lato_400Regular',
    color: '#111827',
    marginBottom: 20,
  },
  noticeContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 12,
    color: '#b45309',
    fontFamily: 'Lato_400Regular',
  },
});
