import { Briefcase, Building, Edit3, Layout, MapPin, Phone, Search, Sofa, Users, X } from 'lucide-react-native';
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
import { getAmenitiesForType } from '../MockData/Mockdata';
import { setSelectedDeal } from '../store/slices/dealsSlice';

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
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');

  // Memoize filtered customers for better performance
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

    onCreateDeal?.(newDeal);
    dispatch(setSelectedDeal(newDeal));
    setShowProposeModal(false);
    onClose();
    router.push('/deal-page');
  }, [property, onCreateDeal, dispatch, onClose]);

  if (!property) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">

        <View className="bg-white w-full h-[85vh] rounded-t-[28px] overflow-hidden">
          
          {/* Header Image */}
          <View className="h-64 w-full relative">
            <Image 
              source={{ uri: property.image }} 
              className="w-full h-full" 
              resizeMode="cover" 
            />
            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute bottom-0 left-0 right-0 p-5">
              <Text className="text-white text-3xl font-bold">
                {formatCurrency(property.price)}
              </Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={14} color="white" />
                <Text className="text-white text-xs ml-1">
                  {property.location}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="absolute top-6 right-6 bg-black/40 p-2 rounded-full z-10"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Main Content ScrollView with paddingBottom for extra space */}
          <ScrollView
            className="flex-1 px-5 pt-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }} // ADDED EXTRA SPACE HERE
          >
            {/* Title & Status */}
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-bold text-gray-900 leading-tight">
                  {property.title}
                </Text>
              </View>
              {property.status && (
                <View className={`px-3 py-1 rounded-full ${property.status === 'Available' ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <Text className={`text-[10px] font-bold uppercase ${property.status === 'Available' ? 'text-green-700' : 'text-orange-700'}`}>
                    {property.status}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center mb-4">
              <View className={`px-2 py-1 rounded ${property.listingType === 'Sell' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                <Text className={`text-[10px] font-bold uppercase ${property.listingType === 'Sell' ? 'text-blue-700' : 'text-purple-700'}`}>
                  For {property.listingType}
                </Text>
              </View>
              <Text className="text-xs text-gray-400 mx-2">•</Text>
              <Text className="text-xs font-medium text-gray-500">
                {property.category} • {property.type}
              </Text>
            </View>

            {/* Location Details */}
            {(property.city || property.state) && (
              <View className="flex-row items-center mb-6">
                <MapPin size={16} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1.5 flex-1">
                  {[property.location, property.city, property.state].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}

            {/* Compact Stats Grid */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              {/* Area */}
              <View className="flex-1 min-w-[30%] bg-gray-50 px-3 py-4 rounded-2xl border border-gray-100 items-center">
                <Layout size={20} color="#374151" />
                <Text className="text-[10px] font-semibold text-gray-400 uppercase mt-2 mb-1">
                  Area
                </Text>
                <Text numberOfLines={1} className="text-sm font-bold text-gray-900 text-center">
                  {property.size || 'N/A'}
                </Text>
              </View>

              {/* Config */}
              {property.configuration && (
                <View className="flex-1 min-w-[30%] bg-gray-50 px-3 py-4 rounded-2xl border border-gray-100 items-center">
                  <Building size={20} color="#374151" />
                  <Text className="text-[10px] font-semibold text-gray-400 uppercase mt-2 mb-1">
                    Config
                  </Text>
                  <Text numberOfLines={1} ellipsizeMode="tail" className="text-sm font-bold text-gray-900 text-center">
                    {property.configuration}
                  </Text>
                </View>
              )}

              {/* Furnish */}
              {property.furnishingStatus && (
                <View className="flex-1 min-w-[30%] bg-gray-50 px-3 py-4 rounded-2xl border border-gray-100 items-center">
                  <Sofa size={20} color="#374151" />
                  <Text className="text-[10px] font-semibold text-gray-400 uppercase mt-2 mb-1">
                    Furnish
                  </Text>
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900 text-center">
                    {property.furnishingStatus}
                  </Text>
                </View>
              )}
            </View>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-bold text-gray-900 mb-3">
                  Amenities
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <View key={index} className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                      <Text className="text-xs text-purple-700 font-medium">
                        {amenity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Owner Section */}
            {(property.owner || property.ownerPhone) && (
              <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 pr-2">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Owner Details
                    </Text>
                    {property.owner && (
                      <Text className="text-base font-bold text-gray-900 mb-0.5">
                        {property.owner}
                      </Text>
                    )}
                    {property.ownerPhone && (
                      <Text className="text-sm font-medium text-gray-600">
                        {property.ownerPhone}
                      </Text>
                    )}
                  </View>

                  {property.ownerPhone && (
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={handleCall}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <Phone size={18} color="#111827" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleWhatsApp}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <WhatsAppIcon size={18} color="#25D366" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={() => onEdit?.(property, 'Property')}
                className="flex-1 bg-gray-100 py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
              >
                <Edit3 size={16} color="#111827" />
                <Text className="text-gray-900 font-bold text-sm ml-2">
                  Edit Details
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowProposeModal(true)}
                className="flex-1 py-4 rounded-xl items-center flex-row justify-center shadow-sm"
                style={{ backgroundColor: '#9A8CFC' }}
              >
                <Users size={16} color="white" />
                <Text className="text-white font-bold text-sm ml-2">
                  Propose Deal
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Customer Selection Modal with KeyboardAvoidingView */}
      {showProposeModal && (
        <Modal visible transparent animationType="slide">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-end bg-black/60"
          >
            <View className="bg-white h-[75vh] rounded-t-[28px] p-6 pb-8">
              
              <View className="flex-row justify-between items-center mb-5">
                  <Text className="text-xl font-bold text-gray-900">
                    Select Customer
                  </Text>
                  <TouchableOpacity onPress={() => setShowProposeModal(false)} className="p-2 bg-gray-100 rounded-full">
                      <X size={20} color="#4b5563"/>
                  </TouchableOpacity>
              </View>

              <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 mb-4 bg-gray-50">
                  <Search size={18} color="#9ca3af" />
                  <TextInput
                    value={customerSearchText}
                    onChangeText={setCustomerSearchText}
                    placeholder="Search by name..."
                    className="flex-1 ml-2 text-base"
                    placeholderTextColor="#9ca3af"
                  />
                  {customerSearchText.length > 0 && (
                      <TouchableOpacity onPress={() => setCustomerSearchText('')}>
                          <X size={16} color="#9ca3af" />
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
                      // Handle both budget formats: single budget or budgetMin/budgetMax
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
                            <Text className="font-bold text-gray-900 text-base mb-1">
                              {customer.name}
                            </Text>
                            <Text className="text-xs font-medium text-gray-500 mb-1">
                              {customer.phone}
                            </Text>
                            <View className="flex-row items-center flex-wrap gap-2">
                              <View className="px-2 py-1 rounded" style={{ backgroundColor: '#E9E6F7' }}>
                                <Text className="text-xs font-semibold" style={{ color: '#9A8CFC' }}>
                                  {budgetDisplay}
                                </Text>
                              </View>
                              {customer.preferredLocation && (
                                <View className="bg-gray-100 px-2 py-1 rounded">
                                  <Text className="text-xs text-gray-600">
                                    {customer.preferredLocation}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <View className="p-2 rounded-full" style={{ backgroundColor: '#E9E6F7' }}>
                            <ArrowRight size={16} color="#9A8CFC" />
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

// Simple ArrowRight component for the customer list
const ArrowRight = ({ size, color }) => (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: color, fontSize: size - 2, fontWeight: 'bold' }}>→</Text>
    </View>
);

export default PropertyDetailSheet;