import { 
  Building, 
  Edit3, 
  Layout, 
  MapPin, 
  Phone, 
  Search, 
  Sofa, 
  Users, 
  X, 
  Shield, 
  Lock, 
  Unlock, 
  Check, 
  MessageSquare, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Heart,
  ChevronRight,
  Send
} from 'lucide-react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import WhatsAppIcon from '../src/Components/WhatsAppIcon';
import { setSelectedDeal } from '../src/store/slices/dealsSlice';
import { clearSelectedProperty } from '../src/store/slices/propertiesSlice';
import { showToast } from '../src/utils/toast';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export default function PropertyDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showCollabSheet, setShowCollabSheet] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedBrokerMatch, setSelectedBrokerMatch] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState('50-50');
  const [requestMessage, setRequestMessage] = useState('');
  const property = useSelector(state => state.properties.selectedProperty);
  const { customers } = useSelector(state => state.customers);
  const sentConnectRequests = useSelector((state) => state.ui.sentConnectRequests);
  const hasSentRequest = property ? sentConnectRequests.includes(property.id) : false;

  // Auto-go-back if no property is selected
  useEffect(() => {
    if (!property) {
      router.navigate('/properties');
    }
  }, [property]);

  // Memoize filtered customers for propose modal
  const filteredCustomers = useMemo(() => {
    if (!customerSearchText) return customers;
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(customerSearchText.toLowerCase())
    );
  }, [customers, customerSearchText]);



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

    dispatch(setSelectedDeal(newDeal));
    setShowProposeModal(false);
    dispatch(clearSelectedProperty());
    router.replace('/deal-page');
  }, [property, dispatch]);



  const handleBack = () => {
    dispatch(clearSelectedProperty());
    router.navigate('/properties');
  };

  const handleShare = () => {
    showToast.success('Property link copied to clipboard!');
  };



  if (!property) return null;

  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* 1. Header Bar matching visual PRD */}
      <View 
        style={{ paddingTop: STATUSBAR_HEIGHT, height: 56 + STATUSBAR_HEIGHT }}
        className="flex-row items-center justify-between px-4 border-b border-gray-100 bg-white"
      >
        <TouchableOpacity onPress={handleBack} className="p-2">
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-1.5">
          <TouchableOpacity onPress={handleShare} className="p-2">
            <Share2 size={20} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)} className="p-2">
            <Heart size={20} color={isFavorite ? '#ef4444' : '#111827'} fill={isFavorite ? '#ef4444' : 'none'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Main Image Section */}
      <View className="h-64 w-full relative bg-gray-900">
        <Image 
          source={{ uri: property.image }} 
          className="w-full h-full" 
          resizeMode="cover" 
        />
        
        {/* Badges Overlaid Bottom Left */}
        <View className="absolute bottom-4 left-4 flex-row gap-2">
          {property.status && (
            <View className={`px-2 py-0.5 rounded ${property.status === 'Available' ? 'bg-green-600' : 'bg-orange-600'}`}>
              <Text className="text-white text-[10px] font-extrabold uppercase">
                {property.status}
              </Text>
            </View>
          )}
          {property.configuration && (
            <View className="px-2 py-0.5 rounded bg-blue-600">
              <Text className="text-white text-[10px] font-extrabold uppercase">
                {property.configuration}
              </Text>
            </View>
          )}
        </View>

        {/* Slide Counter Overlay Bottom Right */}
        <View className="absolute bottom-4 right-4 bg-black/55 px-2.5 py-0.5 rounded-full">
          <Text className="text-white text-[10px] font-semibold">1/12</Text>
        </View>
      </View>

      {/* 4. Scrollable Content Container */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View>
            {/* Title & Category Row */}
            <View className="mb-2">
              <Text className="text-lg font-bold text-gray-900 leading-tight">
                {property.title}
              </Text>
            </View>

            {/* Price Overlay */}
            <View className="flex-row items-baseline gap-2 mb-2">
              <Text className="text-2xl font-black text-gray-900">
                {formatCurrency(property.price)}
              </Text>
              <Text className="text-xs text-gray-400 font-semibold">
                ₹5,655 / sq.ft
              </Text>
            </View>

            {/* Location row */}
            <View className="flex-row items-center mb-5">
              <Text className="text-xs text-gray-500 font-semibold">
                {property.location}
              </Text>
            </View>

            {/* Visual Stats Grid in 2x2 layout */}
            <View className="flex-col gap-3 mb-6">
              {/* Row 1 */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-start">
                  <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                    Area
                  </Text>
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {property.size || '1450 sq.ft'}
                  </Text>
                </View>

                <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-start">
                  <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                    Config
                  </Text>
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {property.configuration || '3 BHK 2 Bath'}
                  </Text>
                </View>
              </View>

              {/* Row 2 */}
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-start">
                  <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                    Furnished
                  </Text>
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {property.furnishingStatus || 'Semi'}
                  </Text>
                </View>

                <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 items-start">
                  <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                    Type
                  </Text>
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {property.type || 'Apartment'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Amenities Section */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Amenities</Text>
              <View className="flex-row flex-wrap gap-2">
                {['Private Garden', 'Clubhouse Access', 'Swimming Pool', 'Gym', 'Children Play Area'].map((amenity) => (
                  <View key={amenity} className="bg-purple-50/70 border border-purple-100 px-3 py-1.5 rounded-full">
                    <Text className="text-purple-700 text-xs font-bold">{amenity}</Text>
                  </View>
                ))}
                <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                  <Text className="text-gray-600 text-xs font-bold">+4 more</Text>
                </View>
              </View>
            </View>

            {/* Owner Details matching visual PRD */}
            <View className="mb-8">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Owner Details</Text>
              <View className="bg-white p-4 rounded-xl border border-gray-200 flex-row justify-between items-center shadow-sm">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                    <Text className="text-purple-700 font-bold text-base">A</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-gray-900">Amit Verma</Text>
                    <Text className="text-xs font-medium text-gray-500">98765 43212</Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleCall}
                    className="bg-green-50 p-2.5 rounded-full border border-green-100 shadow-sm"
                  >
                    <Phone size={16} color="#15803d" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleWhatsApp}
                    className="bg-green-50 p-2.5 rounded-full border border-green-100 shadow-sm"
                  >
                    <WhatsAppIcon size={16} color="#25D366" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
      </ScrollView>

      <View className="px-5 py-4 border-t border-gray-100 bg-white flex-row gap-3">
        <TouchableOpacity
          onPress={() => setShowProposeModal(true)}
          className="flex-1 bg-white py-3.5 rounded-xl items-center justify-center border border-gray-300"
        >
          <Text className="text-gray-800 font-bold text-sm font-Montserrat_700Bold">
            Propose Deal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowCollabSheet(true)}
          className="flex-1 bg-[#635BFF] py-3.5 rounded-xl items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-sm font-Montserrat_700Bold">
            Collaborate
          </Text>
        </TouchableOpacity>
      </View>

      {/* Propose Deal Modal */}
      {showProposeModal && (
        <Modal visible transparent animationType="slide">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-end bg-black/60"
          >
            <View className="bg-white h-[75%] rounded-t-[28px] p-6 pb-8">
              
              <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-lg font-bold text-gray-900">
                    Select Customer
                  </Text>
                  <TouchableOpacity onPress={() => setShowProposeModal(false)} className="p-2 bg-gray-100 rounded-full">
                      <X size={18} color="#4b5563"/>
                  </TouchableOpacity>
              </View>

              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 mb-4 bg-gray-50">
                  <Search size={16} color="#9ca3af" />
                  <TextInput
                    value={customerSearchText}
                    onChangeText={setCustomerSearchText}
                    placeholder="Search by name..."
                    className="flex-1 ml-2 text-sm"
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
                    <View className="items-center justify-center py-10">
                        <Text className="text-gray-400 font-medium">No customers found</Text>
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
                          className="border border-gray-100 rounded-xl p-4 mb-3 bg-white flex-row justify-between items-center shadow-sm"
                        >
                          <View className="flex-1 pr-3">
                            <Text className="font-bold text-gray-900 text-sm mb-1">
                              {customer.name}
                            </Text>
                            <Text className="text-xs font-medium text-gray-500 mb-1.5">
                              {customer.phone}
                            </Text>
                            <View className="flex-row items-center flex-wrap gap-1.5">
                              <View className="bg-purple-50 px-2 py-0.5 rounded">
                                <Text className="text-[10px] font-bold text-[#9A8CFC]">
                                  {budgetDisplay}
                                </Text>
                              </View>
                              {customer.preferredLocation && (
                                <View className="bg-gray-100 px-2 py-0.5 rounded">
                                  <Text className="text-[10px] text-gray-600">
                                    {customer.preferredLocation}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <View className="padding-8 rounded-full bg-purple-50 p-2">
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
      {/* Collaborate Sheet Modal */}
      {showCollabSheet && (
        <Modal visible transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white h-[85%] rounded-t-[28px] p-6 pb-8">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-bold text-gray-900">
                  Collaborate
                </Text>
                <TouchableOpacity onPress={() => setShowCollabSheet(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={18} color="#4b5563"/>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Anonymous Listing Card */}
                <View style={{ backgroundColor: '#f5f3ff', borderColor: '#ddd6fe', borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Shield size={18} color="#7c3aed" />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#7c3aed', fontFamily: 'Montserrat_700Bold' }}>Anonymous Listing</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 16, fontFamily: 'Lato_400Regular' }}>
                    Jab aap match dhundoge, dusre brokers ko sirf property specifications dikhegi - exact address aur owner name nahi.
                  </Text>
                  
                  <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 14, gap: 10 }}>
                    <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Lato_400Regular' }}>
                      Price: <Text style={{ fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>{formatCurrency(property.price)}</Text>
                    </Text>
                    <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Lato_400Regular' }}>
                      Locality: <Text style={{ fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>{property.location || 'Vijay Nagar'}</Text>
                    </Text>
                    <Text style={{ fontSize: 13, color: '#4b5563', fontFamily: 'Lato_400Regular' }}>
                      Specs: <Text style={{ fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>{property.title}</Text>
                    </Text>
                  </View>
                </View>

                {/* Find Matching Clients button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#635BFF',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    paddingVertical: 16,
                    borderRadius: 14,
                    marginBottom: 16,
                  }}
                  onPress={() => {
                    setShowCollabSheet(false);
                    router.push('/find-clients');
                  }}
                >
                  <Search size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', fontFamily: 'Montserrat_700Bold' }}>Find Matching Clients</Text>
                </TouchableOpacity>

                {/* Active Connect Requests (Pending requests) */}
                <View style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12, fontFamily: 'Montserrat_700Bold' }}>Active Connect Requests</Text>
                  {hasSentRequest ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#6b7280', fontFamily: 'Montserrat_700Bold' }}>R</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>Ravi Sir</Text>
                        <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Lato_400Regular' }}>Verified Broker · 50/50 Pending</Text>
                      </View>
                      <View style={{ backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fef3c7' }}>
                        <Text style={{ fontSize: 11, color: '#b45309', fontWeight: 'bold', fontFamily: 'Montserrat_700Bold' }}>Pending</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'Lato_400Regular' }}>Is property ke liye abhi koi request nahi.</Text>
                  )}
                </View>

                {/* Active Collaboration Rooms (Accepted Rooms) */}
                <View style={{ backgroundColor: 'white', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12, fontFamily: 'Montserrat_700Bold' }}>Active Collaborations</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#6b7280', fontFamily: 'Montserrat_700Bold' }}>A</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111827', fontFamily: 'Montserrat_700Bold' }}>Amit Verma</Text>
                      <Text style={{ fontSize: 12, color: '#6b7280', fontFamily: 'Lato_400Regular' }}>Verified Broker · 50/50 Split</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => {
                        setShowCollabSheet(false);
                        router.push('/collab-page?roomId=1');
                      }}
                      style={{ backgroundColor: '#635BFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                    >
                      <Text style={{ fontSize: 11, color: 'white', fontWeight: 'bold', fontFamily: 'Montserrat_700Bold' }}>Open Room</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const ArrowRight = ({ size, color }) => (
    <View style={{ width: size, height: size, justifycontent: 'center', alignItems: 'center' }}>
        <Text style={{ color: color, fontSize: size - 2, fontWeight: 'bold' }}>→</Text>
    </View>
);
