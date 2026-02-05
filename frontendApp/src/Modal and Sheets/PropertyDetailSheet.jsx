import { Briefcase, Building, Edit3, Layout, MapPin, Phone, Search, Sofa, Users, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { getAmenitiesForType } from '../MockData/Mockdata';
import DealSheet from './DealSheet';

// Helper: currency format
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

// Badge Component
const Badge = ({ children, className }) => (
  <View className={`px-3 py-1.5 rounded-lg ${className}`}>
    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-xs uppercase tracking-wider">{children}</Text>
  </View>
);

const PropertyDetailSheet = ({ property, onClose, onEdit, customers = [], properties = [], onCreateDeal }) => {
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  
  // Helper function to render Lucide icons
  const renderIcon = (iconName, size = 14, color = '#6b7280') => {
    // Create a mapping of icon names to components
    const iconMap = {
      'Briefcase': Briefcase,
      'Building': Building,
      'Layout': Layout,
      'MapPin': MapPin,
      'Phone': Phone,
      'Search': Search,
      'Sofa': Sofa,
      'Users': Users
    };
    
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={size} color={color} /> : null;
  };
  
  if (!property) return null;

  const handleCall = () => Linking.openURL(`tel:${property.ownerPhone}`);
  const handleMessage = () => Linking.openURL(`sms:${property.ownerPhone}`);

  // Filter customers based on search text
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchText.toLowerCase()) ||
    customer.phone.includes(customerSearchText) ||
    customer.preferredLocation.toLowerCase().includes(customerSearchText.toLowerCase())
  );

  // Handle customer selection for deal creation
  const handleCustomerSelect = (customer) => {
    const newDeal = {
      id: `d${Date.now()}`,
      customerId: customer.id,
      propertyId: property.id,
      stage: 'Meeting',
      startedAt: new Date().toISOString(),
      meetings: [],
      visits: [],
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
      dealValue: property.price,
      commission: property.price * 0.01, 
    };
    
    if (onCreateDeal) {
      onCreateDeal(newDeal);
    }
    
    setSelectedDeal(newDeal);
    setShowProposeModal(false);
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end bg-black/60">
        
        {/* Sheet Container */}
        <View className="bg-white w-full h-[92vh] rounded-t-[32px] overflow-hidden relative">
          
          {/* Top Actions */}
          <View className="absolute top-6 right-6 z-50 flex-row gap-3">
            <TouchableOpacity onPress={() => onEdit(property, 'Property')} className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/10">
              <Edit3 size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="bg-black/20 p-2.5 rounded-full backdrop-blur-md border border-white/10">
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Hero Image (Increased Size) */}
          <View className="h-72 w-full relative">
            <Image source={{ uri: property.image }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/20" />
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <View className="flex-row justify-between items-end">
                <View>
                  <View className="bg-white/95 self-start px-3 py-1 rounded-md mb-2 shadow-sm">
                    <Text style={{ fontWeight:600, letterSpacing: 1.2 }} className="text-gray-900 text-xs uppercase tracking-wider">For {property.listingType || 'Sell'}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', letterSpacing: -0.5 }} className="text-3xl text-white tracking-tight leading-tight">{formatCurrency(property.price)}</Text>
                  <View className="flex-row items-center mt-2">
                    <MapPin size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-white/95 text-sm ml-1.5">{property.location}</Text>
                  </View>
                </View>
                <Badge className="bg-emerald-500 shadow-sm mb-1">{property.status}</Badge>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 bg-white px-6 py-6" contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
            
            {/* Title & Type */}
            <View className="mb-6">
              <Text style={{ fontFamily: 'Lato_700Bold' }} className="text-2xl text-gray-900 leading-tight mb-3">{property.title}</Text>
              <View className="flex-row items-center">
                <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Briefcase size={14} color="#6b7280" />
                  <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-xs text-gray-600 ml-2">{property.category} • {property.type}</Text>
                </View>
              </View>
            </View>

            {/* Stats Grid (Spacious) */}
            <View className="flex-row justify-between gap-4 mb-8">
              <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <Layout size={20} color="#374151" style={{ marginBottom: 6 }} />
                <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Area</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-base text-gray-900">{property.size} <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-xs text-gray-500">sqft</Text></Text>
              </View>

              {property.bhk && (
                <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <Building size={20} color="#374151" style={{ marginBottom: 6 }} />
                  <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Config</Text>
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-base text-gray-900">{property.bhk}</Text>
                </View>
              )}

              <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <Sofa size={20} color="#374151" style={{ marginBottom: 6 }} />
                <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Furnish</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-base text-gray-900" numberOfLines={1}>{property.furnishing || 'N/A'}</Text>
              </View>
            </View>

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <View className="mb-8">
                <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-xs text-gray-400 uppercase tracking-widest mb-4 ml-1">Amenities</Text>
                <View className="flex-row flex-wrap gap-2">
                  {(() => {
                    const typeAmenities = getAmenitiesForType(property.type);
                    const selectedAmenities = typeAmenities.filter(a => 
                      property.amenities.includes(a.id)
                    );
                    
                    return selectedAmenities.map((amenity) => (
                      <View key={amenity.id} className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex-row items-center gap-1.5">
                        {renderIcon(amenity.icon, 14, '#6b7280')}
                        <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-xs text-gray-700">{amenity.name}</Text>
                      </View>
                    ));
                  })()}
                </View>
              </View>
            )}

            {/* --- UPDATED: Propose to Deal Section --- */}
            <View className="mb-8">
              <View 
                className="p-5 rounded-3xl border flex-row items-center justify-between shadow-sm"
                style={{ backgroundColor: '#E9E6F7', borderColor: '#BFB7FD' }}
              >
                <View className="flex-1 pr-4">
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-800 text-base mb-1">Have a buyer?</Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-xs leading-relaxed">Start a deal immediately for this property.</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowProposeModal(true)}
                  className="px-5 py-3 rounded-xl flex-row items-center gap-2 shadow-sm active:scale-95"
                  style={{ backgroundColor: '#BFB7FD' }}
                >
                  <Users size={16} color="white" />
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-xs">Propose</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Owner Details */}
            <View className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex-row items-center justify-between">
              <View>
                <Text style={{ fontFamily: 'Manrope_600SemiBold' }} className="text-[10px] text-gray-400 uppercase mb-1 tracking-widest">Owner</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-900 text-lg">{property.owner}</Text>
                <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-xs text-gray-500 mt-0.5">{property.ownerPhone}</Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={handleCall} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50">
                  <Phone size={20} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMessage} className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 active:bg-gray-50">
                  <WhatsAppIcon size={20} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>

      {/* Customer Selection Modal */}
      {showProposeModal && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setShowProposeModal(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white w-full h-[85vh] rounded-t-[32px] shadow-2xl overflow-hidden">
              
              <View className="p-6 border-b border-gray-100 flex-row justify-between items-center">
                <View>
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-gray-900">Select Customer</Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-xs text-gray-500 mt-1">Propose this property to a lead</Text>
                </View>
                <TouchableOpacity onPress={() => setShowProposeModal(false)} className="bg-gray-100 p-2.5 rounded-full">
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View className="px-6 py-4 border-b border-gray-100">
                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Search size={18} color="#9ca3af" />
                  <TextInput
                    value={customerSearchText}
                    onChangeText={setCustomerSearchText}
                    placeholder="Search customers..."
                    placeholderTextColor="#d1d5db"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                    className="flex-1 ml-3 text-sm text-gray-800"
                  />
                </View>
              </View>

              <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {filteredCustomers.length === 0 ? (
                  <View className="items-center justify-center py-12">
                    <Users size={40} color="#e5e7eb" />
                    <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-gray-400 text-sm mt-4">No customers found</Text>
                  </View>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      onPress={() => handleCustomerSelect(customer)}
                      className="bg-white border border-gray-200 rounded-2xl p-4 mb-3 shadow-sm active:bg-gray-50 flex-row items-center gap-4"
                    >
                      <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center border border-indigo-100">
                        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-indigo-700 text-sm">{customer.name.charAt(0)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-sm text-gray-900 mb-0.5">{customer.name}</Text>
                        <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-xs text-gray-500">Looking for: <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-700">{customer.type}</Text></Text>
                      </View>
                      <View className="items-end">
                        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xs text-gray-900">{formatCurrency(customer.budget)}</Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium' }} className="text-[10px] text-gray-400 mt-0.5">{customer.status}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Deal Sheet Logic */}
      {selectedDeal && (
        <DealSheet
          deal={selectedDeal}
          properties={properties}
          customers={customers}
          onClose={() => setSelectedDeal(null)}
          onUpdateDeal={(dealId, updatedDeal) => setSelectedDeal(updatedDeal)}
          onCloseDeal={() => setSelectedDeal(null)}
          onAddTask={(task) => console.log('Task added:', task)}
        />
      )}
    </Modal>
  );
};

export default PropertyDetailSheet;