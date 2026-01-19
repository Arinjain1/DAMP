import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  ImageBackground, 
  Linking, 
  
  Platform,
  Alert
} from 'react-native';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  FileSearch, 
  CheckCircle, 
  
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// ==========================================
// 1. SITE VISIT SHEET (Live Mode)
// ==========================================

const SiteVisitSheet = ({ activeVisit, onClose, onFinish }) => {
  if (!activeVisit) return null;
  const { customer, property } = activeVisit;

  const handleMap = () => {
    // Opens native maps or browser fallback
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const url = Platform.select({
      ios: `${scheme}${encodeURIComponent(property.location)}`,
      android: `${scheme}${encodeURIComponent(property.location)}`
    });
    
    Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`);
    });
  };

  const handleCall = () => {
    Linking.openURL(`tel:${customer.phone}`);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-gray-900">
        
        {/* Top Bar - Live Status */}
        <View className="bg-gray-800 pt-[12vw] pb-[6vw] px-[6vw] border-b border-gray-700 flex-row justify-between items-center shadow-md z-10">
           <View className="flex-row items-center gap-[3vw]">
              <View className="bg-red-500 w-[3vw] h-[3vw] rounded-full" /> 
              {/* Note: For actual pulsing, use Reanimated. Static for now. */}
              <Text className="text-white font-black text-[5vw] tracking-wide uppercase">Live Site Visit</Text>
           </View>
           <TouchableOpacity onPress={onClose} className="bg-gray-700 p-[2vw] rounded-full">
              <X size={20} color="#9ca3af"/>
           </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView className="flex-1 bg-gray-900 p-[6vw]" contentContainerStyle={{ paddingBottom: 40 }}>
           
           {/* Property Card */}
           <View className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 mb-[6vw]">
              <View className="h-[25vh] relative">
                 <ImageBackground 
                    source={{ uri: property.image }} 
                    className="w-full h-full opacity-80"
                    resizeMode="cover"
                 >
                    <LinearGradient
                       colors={['transparent', 'rgba(17, 24, 39, 0.9)']}
                       style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                    />
                    <View className="absolute bottom-[4vw] left-[4vw] right-[4vw]">
                       <Text className="text-[6vw] font-black text-white leading-tight mb-[1vw]">{property.title}</Text>
                       <View className="flex-row items-center">
                          <MapPin size={14} color="#d1d5db" />
                          <Text className="text-gray-300 text-[3.5vw] ml-[1vw]">{property.location}</Text>
                       </View>
                    </View>
                 </ImageBackground>
              </View>

              <View className="p-[4vw] flex-row flex-wrap justify-between gap-[3vw]">
                 <View className="bg-gray-700 p-[3vw] rounded-xl items-center w-[48%]">
                    <Text className="text-[2.5vw] text-gray-400 font-bold uppercase">Price</Text>
                    <Text className="text-white font-black text-[3.5vw]">{formatCurrency(property.price)}</Text>
                 </View>
                 <View className="bg-gray-700 p-[3vw] rounded-xl items-center w-[48%]">
                    <Text className="text-[2.5vw] text-gray-400 font-bold uppercase">Size</Text>
                    <Text className="text-white font-black text-[3.5vw]">{property.size} sqft</Text>
                 </View>
                 <TouchableOpacity 
                    onPress={handleMap}
                    className="w-full bg-blue-600 py-[4vw] rounded-xl shadow-lg flex-row items-center justify-center gap-[2vw] active:scale-95"
                 >
                    <Navigation size={20} color="white"/>
                    <Text className="text-white font-bold text-[3.5vw]">Navigate to Location</Text>
                 </TouchableOpacity>
              </View>
           </View>

           {/* Customer Info */}
           <View className="bg-gray-800 p-[5vw] rounded-2xl border border-gray-700 mb-[6vw]">
              <Text className="text-[3vw] font-bold text-gray-400 uppercase tracking-wider mb-[3vw]">Visiting With</Text>
              <View className="flex-row items-center gap-[4vw]">
                 <View className="h-[12vw] w-[12vw] rounded-full bg-indigo-500 flex items-center justify-center">
                    <Text className="text-white font-bold text-[5vw]">{customer.name.charAt(0)}</Text>
                 </View>
                 <View>
                    <Text className="text-white font-bold text-[4.5vw]">{customer.name}</Text>
                    <View className="flex-row gap-[3vw] mt-[1vw] items-center">
                       <TouchableOpacity onPress={handleCall} className="flex-row items-center gap-[1vw]">
                          <Phone size={12} color="#4ade80" />
                          <Text className="text-green-400 text-[3vw] font-bold">Call</Text>
                       </TouchableOpacity>
                       <Text className="text-gray-500 text-[3vw]">|</Text>
                       <Text className="text-gray-400 text-[3vw]">{customer.phone}</Text>
                    </View>
                 </View>
              </View>
           </View>

           {/* Analysis Tip */}
           <View className="bg-indigo-900/40 p-[5vw] rounded-2xl border border-indigo-500/30 mb-[10vh]">
              <View className="flex-row items-center gap-[2vw] mb-[2vw]">
                 <FileSearch size={16} color="#a5b4fc"/>
                 <Text className="text-indigo-300 font-bold text-[3.5vw]">Analysis Tip</Text>
              </View>
              <Text className="text-indigo-200 text-[3vw] leading-relaxed">
                 Ask the buyer about their feeling regarding the room sizes and ventilation. Note down any specific objections immediately.
              </Text>
           </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="p-[6vw] bg-gray-800 border-t border-gray-700 absolute bottom-0 left-0 right-0">
           <TouchableOpacity 
              onPress={() => onFinish(activeVisit)} 
              className="w-full bg-emerald-500 py-[4vw] rounded-2xl shadow-xl flex-row items-center justify-center gap-[2vw] active:scale-95"
           >
              <CheckCircle size={24} color="white"/>
              <Text className="text-white font-black text-[4.5vw]">Mark Visit Complete</Text>
           </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
};


// ==========================================
// 2. VISIT FEEDBACK SHEET
// ==========================================


export { SiteVisitSheet };