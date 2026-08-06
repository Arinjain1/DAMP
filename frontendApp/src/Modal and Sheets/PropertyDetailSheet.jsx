import { Briefcase, Building, Edit3, Layout, MapPin, Phone, Search, Sofa, Users, X, Shield, Lock, Unlock, Check, MessageSquare, Calendar } from 'lucide-react-native';
import { useState, useMemo, useCallback } from 'react';
import { 
  Image, 
  Linking, 
  Modal, 
  ScrollView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { setSelectedDeal } from '../store/slices/dealsSlice';
import { showToast } from '../utils/toast';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

const PropertyDetailSheet = ({
  property,
  onClose,
  onEdit,
  customers = [],
  onCreateDeal,
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'CRM Activity' | 'Matches' | 'Collaboration'
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');

  // Local state for mocked CRM Activity
  const [crmLogs, setCrmLogs] = useState([
    { id: 1, type: 'Call', detail: 'Called owner regarding price flexibility.', date: 'Today, 11:30 AM' },
    { id: 2, type: 'Update', detail: 'Updated property status to Available.', date: 'Yesterday' }
  ]);
  const [newLogText, setNewLogText] = useState('');

  // Local state for mock collaboration
  const [collabRequests, setCollabRequests] = useState([
    { id: 401, name: 'Suresh Patel', phone: '9765432100', role: 'Client-side', split: '50/50', status: 'Pending' }
  ]);
  const [activePartner, setActivePartner] = useState(null);

  // Memoize filtered customers for propose modal
  const filteredCustomers = useMemo(() => {
    if (!customerSearchText) return customers;
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearchText.toLowerCase())
    );
  }, [customers, customerSearchText]);

  // Compute mock matches for this property based on configuration/type
  const matchingRequirements = useMemo(() => {
    return customers.map(c => {
      // Basic compatibility logic
      const sameBhk = c.bhk === property.configuration;
      const budgetMatch = property.price >= (c.budgetMin || 0) && property.price <= (c.budgetMax || 99000000);
      const compatibilityScore = (sameBhk ? 50 : 20) + (budgetMatch ? 42 : 15);
      return {
        ...c,
        compatibility: compatibilityScore,
        freshness: 'Fresh today'
      };
    }).sort((a, b) => b.compatibility - a.compatibility);
  }, [customers, property]);

  const handleCall = useCallback(() => {
    if (property?.ownerPhone) {
      Linking.openURL(`tel:${property.ownerPhone}`);
    }
  }, [property?.ownerPhone]);

  const handleWhatsApp = useCallback(() => {
    if (property?.ownerPhone) {
      Linking.openURL(`whatsapp://send?phone=${property.ownerPhone}`);
    }
  }, [property?.ownerPhone]);

  const handleCustomerSelect = useCallback((customer) => {
    const newDeal = {
      id: `d${Date.now()}`,
      customerId: customer.id,
      propertyId: property.id,
      stage: 'In-Process',
      startedAt: new Date().toISOString(),
      dealValue: property.price,
      commission: property.price * 0.01,
    };

    onCreateDeal?.(newDeal);
    dispatch(setSelectedDeal(newDeal));
    setShowProposeModal(false);
    onClose();
    router.push('/deal-page');
  }, [property, onCreateDeal, dispatch, onClose]);

  const handleAddCrmLog = () => {
    if (!newLogText.trim()) return;
    const newLog = {
      id: Date.now(),
      type: 'Note',
      detail: newLogText.trim(),
      date: 'Just now'
    };
    setCrmLogs([newLog, ...crmLogs]);
    setNewLogText('');
    showToast.success('Activity logged successfully');
  };

  const handleSendCollabRequest = (clientReqName) => {
    showToast.success(`Collaboration request sent to broker of ${clientReqName}!`);
  };

  if (!property) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>

        <View style={{ backgroundColor: 'white', width: '100%', height: '85%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
          
          {/* Header Image */}
          <View style={{ height: 200, width: '100%', position: 'relative' }}>
            <Image 
              source={{ uri: property.image }} 
              style={{ width: '100%', height: '100%' }} 
              resizeMode="cover" 
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                {formatCurrency(property.price)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <MapPin size={12} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginLeft: 4 }}>
                  {property.location}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{ position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20, zIndex: 10 }}
            >
              <X size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Scrollable Tabs */}
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#f9fafb' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 10 }}>
              {['Overview', 'CRM Activity', 'Matches', 'Collaboration'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: activeTab === tab ? '#BFB7FD' : 'white',
                    borderWidth: 1,
                    borderColor: activeTab === tab ? '#BFB7FD' : '#e5e7eb',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: activeTab === tab ? 'white' : '#4b5563',
                  }}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Main Tab Content */}
          <ScrollView
            style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {activeTab === 'Overview' && (
              <View>
                {/* Title & Status */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', lineHeight: 22 }}>
                      {property.title}
                    </Text>
                  </View>
                  {property.status && (
                    <View style={{ borderRadius: 12, backgroundColor: property.status === 'Available' ? '#d1fae5' : '#ffedd5', paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: property.status === 'Available' ? '#047857' : '#c2410c' }}>
                        {property.status}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: property.listingType === 'Sell' ? '#dbeafe' : '#f3e8ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: property.listingType === 'Sell' ? '#1d4ed8' : '#7c3aed' }}>
                      For {property.listingType}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#9ca3af', marginHorizontal: 8 }}>•</Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280' }}>
                    {property.category} • {property.type}
                  </Text>
                </View>

                {/* Compact Stats Grid */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                  <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}>
                    <Layout size={18} color="#374151" />
                    <Text style={{ fontSize: 9, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', marginTop: 6, marginBottom: 2 }}>
                      Area
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>
                      {property.size || 'N/A'}
                    </Text>
                  </View>

                  {property.configuration && (
                    <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}>
                      <Building size={18} color="#374151" />
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', marginTop: 6, marginBottom: 2 }}>
                        Config
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>
                        {property.configuration}
                      </Text>
                    </View>
                  )}

                  {property.furnishingStatus && (
                    <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', alignItems: 'center' }}>
                      <Sofa size={18} color="#374151" />
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', marginTop: 6, marginBottom: 2 }}>
                        Furnish
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>
                        {property.furnishingStatus}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Owner Section */}
                {(property.owner || property.ownerPhone) && (
                  <View style={{ backgroundColor: '#f9fafb', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>
                          Owner Details
                        </Text>
                        {property.owner && (
                          <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>
                            {property.owner}
                          </Text>
                        )}
                        {property.ownerPhone && (
                          <Text style={{ fontSize: 13, fontWeight: '500', color: '#4b5563' }}>
                            {property.ownerPhone}
                          </Text>
                        )}
                      </View>

                      {property.ownerPhone && (
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            onPress={handleCall}
                            style={{ backgroundColor: 'white', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}
                          >
                            <Phone size={16} color="#111827" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleWhatsApp}
                            style={{ backgroundColor: 'white', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}
                          >
                            <WhatsAppIcon size={16} color="#25D366" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => onEdit?.(property, 'Property')}
                    style={{ flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
                  >
                    <Edit3 size={14} color="#111827" />
                    <Text style={{ color: '#111827', fontWeight: 'bold', fontSize: 13, marginLeft: 8 }}>
                      Edit Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowProposeModal(true)}
                    style={{ flex: 1, backgroundColor: '#9A8CFC', paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  >
                    <Users size={14} color="white" />
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 8 }}>
                      Propose Deal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'CRM Activity' && (
              <View>
                {/* Log Activity Form */}
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>Log CRM Activity</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
                  <TextInput
                    value={newLogText}
                    onChangeText={setNewLogText}
                    placeholder="Enter owner call notes or availability details..."
                    style={{ flex: 1, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, fontSize: 13, height: 44 }}
                  />
                  <TouchableOpacity
                    onPress={handleAddCrmLog}
                    style={{ backgroundColor: '#9A8CFC', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Activity Feed */}
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>Activity History</Text>
                {crmLogs.map((log) => (
                  <View key={log.id} style={{ backgroundColor: 'white', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9A8CFC', textTransform: 'uppercase' }}>
                        {log.type}
                      </Text>
                      <Text style={{ fontSize: 10, color: '#9ca3af' }}>{log.date}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#4b5563' }}>{log.detail}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'Matches' && (
              <View>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>Ranked Client Matches</Text>
                {matchingRequirements.map((match) => (
                  <View key={match.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <View style={{ backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#047857' }}>{match.compatibility}% MATCH</Text>
                        </View>
                        <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#7c3aed' }}>{match.freshness}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>
                        {formatCurrency(match.budgetMax)} max
                      </Text>
                    </View>

                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 4 }}>
                      Client ID: req-{match.id} (Anonymous)
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                      Locality: {match.location || 'Anywhere'} • Preference: {match.bhk || 'Any BHK'} {match.type}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleSendCollabRequest(match.name)}
                        style={{ flex: 1, backgroundColor: '#9A8CFC', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>Request Collab</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'Collaboration' && (
              <View>
                {/* Visibility Controls */}
                <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Shield size={16} color="#7c3aed" />
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827' }}>Network Settings</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#4b5563' }}>Network Visibility</Text>
                    <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#1d4ed8' }}>Network (Public)</Text>
                    </View>
                  </View>
                </View>

                {/* Pending Requests */}
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 10 }}>Requests</Text>
                {collabRequests.map((req) => (
                  <View key={req.id} style={{ backgroundColor: 'white', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>{req.name}</Text>
                        <Text style={{ fontSize: 11, color: '#6b7280' }}>{req.role} • Split: {req.split}</Text>
                      </View>
                      <View style={{ backgroundColor: '#ffedd5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#c2410c' }}>{req.status}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setCollabRequests([]);
                          setActivePartner({ name: req.name, split: req.split });
                          showToast.success('Collaboration accepted!');
                        }}
                        style={{ flex: 1, backgroundColor: '#9A8CFC', paddingVertical: 8, borderRadius: 8, alignItems: 'center' }}
                      >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>Accept & Unlock</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setCollabRequests([])}
                        style={{ flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
                      >
                        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 11 }}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Active Partner */}
                {activePartner ? (
                  <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6' }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>Active Collaborator</Text>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', marginBottom: 2 }}>{activePartner.name}</Text>
                    <Text style={{ fontSize: 12, color: '#4b5563', marginBottom: 12 }}>Role: Client-side broker • Split: {activePartner.split}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        router.push('/collab-page?roomId=1');
                      }}
                      style={{ backgroundColor: '#f3f4f6', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' }}
                    >
                      <Text style={{ color: '#9A8CFC', fontWeight: 'bold', fontSize: 12 }}>Open Room</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  collabRequests.length === 0 && (
                    <Text style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>No active collaborations on this property</Text>
                  )
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Propose Deal Modal */}
      {showProposeModal && (
        <Modal visible transparent animationType="slide">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <View style={{ backgroundColor: 'white', height: '75%', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 32 }}>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
                    Select Customer
                  </Text>
                  <TouchableOpacity onPress={() => setShowProposeModal(false)} style={{ padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 }}>
                      <X size={18} color="#4b5563"/>
                  </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, backgroundColor: '#f9fafb' }}>
                  <Search size={16} color="#9ca3af" />
                  <TextInput
                    value={customerSearchText}
                    onChangeText={setCustomerSearchText}
                    placeholder="Search by name..."
                    style={{ flex: 1, marginLeft: 8, fontSize: 15 }}
                    placeholderTextColor="#9ca3af"
                  />
                  {customerSearchText.length > 0 && (
                      <TouchableOpacity onPress={() => setCustomerSearchText('')}>
                          <X size={14} color="#9ca3af" />
                      </TouchableOpacity>
                  )}
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {filteredCustomers.length === 0 ? (
                    <View style={{ alignItems: 'center', justifycontent: 'center', paddingVertical: 40 }}>
                        <Text style={{ color: '#9ca3af', fontWeight: '500' }}>No customers found</Text>
                    </View>
                ) : (
                    filteredCustomers.map((customer) => {
                      const budgetDisplay = customer.budgetMin && customer.budgetMax
                        ? `${formatCurrency(customer.budgetMin)} - ${formatCurrency(customer.budgetMax)}`
                        : customer.budget
                        ? formatCurrency(customer.budget)
                        : 'Not specified';

                      return (
                        <TouchableOpacity
                          key={customer.id}
                          onPress={() => handleCustomerSelect(customer)}
                          style={{ borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 12, padding: 16, marginBottom: 12, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <View style={{ flex: 1, paddingRight: 12 }}>
                            <Text style={{ fontWeight: 'bold', color: '#111827', fontSize: 15, marginBottom: 2 }}>
                              {customer.name}
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: '500', color: '#6b7280', marginBottom: 4 }}>
                              {customer.phone}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                              <View style={{ borderRadius: 4, backgroundColor: '#E9E6F7', paddingHorizontal: 6, paddingVertical: 2 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'semibold', color: '#9A8CFC' }}>
                                  {budgetDisplay}
                                </Text>
                              </View>
                              {customer.preferredLocation && (
                                <View style={{ backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                  <Text style={{ fontSize: 11, color: '#4b5563' }}>
                                    {customer.preferredLocation}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <View style={{ padding: 8, borderRadius: 20, backgroundColor: '#E9E6F7' }}>
                            <ArrowRight size={14} color="#9A8CFC" />
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </Modal>
  );
};

const ArrowRight = ({ size, color }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: color, fontSize: size - 2, fontWeight: 'bold' }}>→</Text>
    </View>
);

export default PropertyDetailSheet;