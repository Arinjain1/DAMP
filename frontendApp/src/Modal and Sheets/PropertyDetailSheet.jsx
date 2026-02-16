import { Briefcase, Building, Edit3, Layout, MapPin, Phone, Search, Sofa, Users, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Linking, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  if (!property) return null;

  const handleCall = () => Linking.openURL(`tel:${property.ownerPhone}`);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearchText.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
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
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">

        <View className="bg-white w-full h-[92vh] rounded-t-[28px] overflow-hidden">

          {/* Header Image */}
          <View className="h-64 w-full relative">
            <Image source={{ uri: property.image }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute bottom-0 left-0 right-0 p-5">
              <Text className="text-white text-2xl font-bold">
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
              className="absolute top-6 right-6 bg-black/40 p-2 rounded-full"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-5 py-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {property.title}
            </Text>

            <Text className="text-xs text-gray-500 mb-6">
              {property.category} • {property.type}
            </Text>

            {/* Compact Stats Grid */}
            <View className="flex-row justify-between gap-3 mb-6">

              {/* Area */}
              <View className="flex-1 bg-gray-50 px-3 py-4 rounded-2xl border border-gray-100 items-center min-h-[95px] justify-center">
                <Layout size={18} color="#374151" />
                <Text className="text-[10px] text-gray-400 uppercase mt-2">
                  Area
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-gray-900 text-center"
                >
                  {property.size} sqft
                </Text>
              </View>

              {/* Config */}
              {property.bhk && (
                <View className="flex-1 bg-gray-50 px-3 py-4 rounded-2xl border border-gray-100 items-center min-h-[95px] justify-center">
                  <Building size={18} color="#374151" />
                  <Text className="text-[10px] text-gray-400 uppercase mt-2">
                    Config
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="text-sm font-bold text-gray-900 text-center"
                  >
                    {property.bhk}
                  </Text>
                </View>
              )}

              {/* Furnish */}
              <View className="flex-1 bg-gray-50 px-3 py-4 rounded-2xl border border-gray-100 items-center min-h-[95px] justify-center">
                <Sofa size={18} color="#374151" />
                <Text className="text-[10px] text-gray-400 uppercase mt-2">
                  Furnish
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-gray-900 text-center"
                >
                  {property.furnishing || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Owner Section */}
            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-gray-400 uppercase">
                  Owner
                </Text>
                <Text className="font-bold text-gray-900">
                  {property.owner}
                </Text>
                <Text className="text-xs text-gray-500">
                  {property.ownerPhone}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCall}
                className="bg-white p-3 rounded-xl border border-gray-200"
              >
                <Phone size={18} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Propose Button */}
            <TouchableOpacity
              onPress={() => setShowProposeModal(true)}
              className="mt-6 bg-indigo-400 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-sm">
                Propose to Customer
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Customer Modal */}
      {showProposeModal && (
        <Modal visible transparent animationType="slide">
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white h-[80vh] rounded-t-[28px] p-6">

              <Text className="text-lg font-bold mb-4">
                Select Customer
              </Text>

              <TextInput
                value={customerSearchText}
                onChangeText={setCustomerSearchText}
                placeholder="Search customer..."
                className="border border-gray-200 rounded-xl px-4 py-3 mb-4"
              />

              <ScrollView>
                {filteredCustomers.map((customer) => (
                  <TouchableOpacity
                    key={customer.id}
                    onPress={() => handleCustomerSelect(customer)}
                    className="border border-gray-200 rounded-xl p-4 mb-3"
                  >
                    <Text className="font-bold text-gray-900">
                      {customer.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Budget: {formatCurrency(customer.budget)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

export default PropertyDetailSheet;
