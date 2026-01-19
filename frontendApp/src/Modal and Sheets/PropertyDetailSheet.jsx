import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { Edit3, X, MapPin, Layout, Building, Sofa, Phone, MessageCircle, Briefcase } from 'lucide-react-native';

// Helper: currency format
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

// Badge Component
const Badge = ({ children, className }) => (
  <View className={`px-[2vw] py-[0.5vh] rounded-md ${className}`}>
    <Text className="text-white text-[2.5vw] font-bold">{children}</Text>
  </View>
);

const PropertyDetailSheet = ({ property, onClose, onEdit }) => {
  if (!property) return null;

  const handleCall = () => Linking.openURL(`tel:${property.ownerPhone}`);
  const handleMessage = () => Linking.openURL(`sms:${property.ownerPhone}`);

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end bg-black/60">
        
        {/* Sheet Container */}
        <View className="bg-white w-full h-[90vh] rounded-t-[10vw] shadow-2xl overflow-hidden relative">
          
          {/* Top Actions */}
          <View className="absolute top-[4vh] right-[4vw] z-50 flex-row gap-[2vw]">
            <TouchableOpacity onPress={() => onEdit(property, 'Property')} className="bg-white/20 p-[2.5vw] rounded-full backdrop-blur-md">
              <Edit3 size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} className="bg-black/20 p-[2.5vw] rounded-full backdrop-blur-md">
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Hero Image */}
          <View className="h-[35vh] w-full relative">
            <Image source={{ uri: property.image }} className="w-full h-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute bottom-0 left-0 right-0 p-[6vw] pt-[12vw] bg-black/50">
              <View className="flex-row justify-between items-end">
                <View>
                  <View className="bg-white self-start px-[2vw] py-[0.5vh] rounded mb-[2vw] shadow-sm">
                    <Text className="text-gray-900 text-[2.5vw] font-bold uppercase">For {property.listingType || 'Sell'}</Text>
                  </View>
                  <Text className="text-[8vw] font-black text-white tracking-tight leading-tight">{formatCurrency(property.price)}</Text>
                  <View className="flex-row items-center mt-[1vw]">
                    <MapPin size={14} color="rgba(255,255,255,0.9)" />
                    <Text className="text-white/90 text-[3.5vw] font-medium ml-[1vw]">{property.location}</Text>
                  </View>
                </View>
                <Badge className="bg-emerald-500 shadow-sm">{property.status}</Badge>
              </View>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 bg-white px-[6vw] py-[6vw]" contentContainerStyle={{ paddingBottom: 40 }}>
            
            {/* Title */}
            <View className="mb-[6vw]">
              <Text className="text-[6vw] font-black text-gray-900 leading-tight">{property.title}</Text>
              <View className="flex-row items-center mt-[3vw]">
                <View className="flex-row items-center bg-gray-100 px-[3vw] py-[1.5vw] rounded-full">
                  <Briefcase size={12} color="#6b7280" />
                  <Text className="text-[3vw] font-bold text-gray-500 ml-[1.5vw]">{property.category} • {property.type}</Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row justify-between gap-[4vw] mb-[8vw]">
              <View className="flex-1 bg-gray-50 p-[4vw] rounded-2xl border border-gray-100 items-center shadow-sm">
                <Layout size={24} color="#111827" style={{ opacity: 0.8, marginBottom: 8 }} />
                <Text className="text-[2.5vw] font-bold text-gray-400 uppercase tracking-wide">Area</Text>
                <Text className="text-[3.5vw] font-black text-gray-900 mt-[0.5vh]">{property.size} <Text className="text-[2.5vw] font-normal text-gray-500">sqft</Text></Text>
              </View>

              {property.bhk && (
                <View className="flex-1 bg-gray-50 p-[4vw] rounded-2xl border border-gray-100 items-center shadow-sm">
                  <Building size={24} color="#111827" style={{ opacity: 0.8, marginBottom: 8 }} />
                  <Text className="text-[2.5vw] font-bold text-gray-400 uppercase tracking-wide">Config</Text>
                  <Text className="text-[3.5vw] font-black text-gray-900 mt-[0.5vh]">{property.bhk}</Text>
                </View>
              )}

              <View className="flex-1 bg-gray-50 p-[4vw] rounded-2xl border border-gray-100 items-center shadow-sm">
                <Sofa size={24} color="#111827" style={{ opacity: 0.8, marginBottom: 8 }} />
                <Text className="text-[2.5vw] font-bold text-gray-400 uppercase tracking-wide">Furnishing</Text>
                <Text className="text-[3.5vw] font-black text-gray-900 mt-[0.5vh]" numberOfLines={1}>{property.furnishing || 'No Info'}</Text>
              </View>
            </View>

            {/* Owner */}
            <View className="bg-gray-50 p-[5vw] rounded-2xl border border-gray-100 flex-row items-center justify-between">
              <View>
                <Text className="text-[2.5vw] text-gray-400 font-bold uppercase mb-[1vw] tracking-wider">Owner Details</Text>
                <Text className="font-bold text-gray-900 text-[4.5vw]">{property.owner}</Text>
                <Text className="text-[3vw] text-gray-500 font-medium mt-[0.5vh]">{property.ownerPhone}</Text>
              </View>
              <View className="flex-row gap-[3vw]">
                <TouchableOpacity onPress={handleCall} className="bg-white p-[3vw] rounded-xl shadow-sm border border-gray-200">
                  <Phone size={20} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMessage} className="bg-white p-[3vw] rounded-xl shadow-sm border border-green-100">
                  <MessageCircle size={20} color="#16a34a" />
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PropertyDetailSheet;
