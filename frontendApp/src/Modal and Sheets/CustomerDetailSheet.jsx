import {
    Briefcase,
    Calendar,
    ChevronRight,
    Handshake,
    MapPin,
    Phone,
    Plus,
    Search,
    Sparkles,
    X
} from 'lucide-react-native';
import { useState } from 'react';
import {
    Image,
    Linking,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const CustomerDetailSheet = ({ customer, onClose, properties, activeDeals, onAddFollowUp, onStartDeal, onOpenDeal }) => {
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);

  if (!customer) return null;

  // Filter Logic
  const customerDeals = activeDeals.filter(d => d.customerId === customer.id);
  const dealtPropertyIds = customerDeals.map(d => d.propertyId);

  const matches = properties.filter(p => {
    if (p.type !== customer.type) return false;
    if (p.price > customer.budget * 1.15) return false;
    if (p.status === 'Sold') return false;
    if (dealtPropertyIds.includes(p.id)) return false;
    return true;
  });

  const handleCall = () => {
    Linking.openURL(`tel:${customer.phone}`);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/60">
        
        {/* Main Sheet Container */}
        <View className="bg-white w-full h-[92vh] rounded-t-[10vw] shadow-2xl overflow-hidden flex-col relative">
          
          {/* Header (Sticky) */}
          <View className="p-[6vw] border-b border-gray-100 flex-row justify-between items-center bg-white/95 z-10">
            <View className="flex-row items-center gap-[4vw]">
               <View className="h-[12vw] w-[12vw] bg-gray-100 rounded-2xl flex items-center justify-center border border-white shadow-sm">
                  <Text className="text-gray-700 font-black text-[5vw]">{customer.name.charAt(0)}</Text>
               </View>
               <View>
                  <Text className="text-[5vw] font-bold text-gray-900">{customer.name}</Text>
                  <Text className="text-[3vw] text-gray-500 font-medium">{customer.phone}</Text>
               </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-[2vw] bg-gray-100 rounded-full">
               <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {/* Main Scroll Content */}
          <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            
            {/* Action Buttons Grid */}
            <View className="flex-row flex-wrap gap-[3vw] mb-[8vw]">
               <TouchableOpacity 
                 onPress={handleCall}
                 className="flex-1 bg-white py-[3.5vw] rounded-2xl border border-gray-200 flex-row items-center justify-center gap-[2vw]"
               >
                  <Phone size={18} color="#047857" />
                  <Text className="font-bold text-emerald-700 text-[3.5vw]">Call</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                 onPress={() => onAddFollowUp(customer)}
                 className="flex-1 bg-white py-[3.5vw] rounded-2xl border border-gray-200 flex-row items-center justify-center gap-[2vw]"
               >
                  <Calendar size={18} color="#1d4ed8" />
                  <Text className="font-bold text-blue-700 text-[3.5vw]">Task</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 onPress={() => setShowPropertyPicker(true)}
                 className="w-full bg-gray-900 py-[4vw] rounded-2xl shadow-lg shadow-gray-200 active:scale-95 flex-row items-center justify-center gap-[2vw] mt-[1vw]"
               >
                  <Briefcase size={18} color="#d1d5db" />
                  <Text className="font-bold text-white text-[3.5vw]">Start Deal / Interest</Text>
               </TouchableOpacity>
            </View>

            {/* Active Deals Section */}
            <View className="mb-[8vw]">
               <View className="flex-row items-center gap-[2vw] mb-[3vw]">
                  <Briefcase size={18} color="#4f46e5" />
                  <Text className="font-bold text-gray-900 text-[4.5vw]">Active Deals ({customerDeals.length})</Text>
               </View>
               
               {customerDeals.length > 0 ? (
                  <View className="gap-[3vw]">
                     {customerDeals.map(deal => {
                        const prop = properties.find(p => p.id === deal.propertyId);
                        return (
                           <TouchableOpacity 
                             key={deal.id} 
                             onPress={() => onOpenDeal(deal)}
                             className="bg-white border border-gray-200 rounded-2xl p-[3vw] flex-row gap-[3vw] items-center shadow-sm active:scale-95"
                           >
                              <Image source={{ uri: prop?.image }} className="w-[16vw] h-[16vw] rounded-xl bg-gray-200" />
                              <View className="flex-1">
                                 <View className="flex-row justify-between items-center mb-[1vw]">
                                    <Text className="font-bold text-[3.5vw] text-gray-900 flex-1 mr-2" numberOfLines={1}>
                                       {prop?.title}
                                    </Text>
                                    <View className={`px-[2vw] py-[0.5vw] rounded ${deal.stage === 'Closed' ? 'bg-green-100' : 'bg-indigo-50'}`}>
                                       <Text className={`text-[2.5vw] font-bold ${deal.stage === 'Closed' ? 'text-green-700' : 'text-indigo-700'}`}>
                                          {deal.stage}
                                       </Text>
                                    </View>
                                 </View>
                                 <Text className="text-[3vw] text-gray-500">{prop?.location}</Text>
                              </View>
                              <ChevronRight size={18} color="#d1d5db" />
                           </TouchableOpacity>
                        );
                     })}
                  </View>
               ) : (
                  <View className="bg-gray-50 p-[4vw] rounded-2xl items-center border border-dashed border-gray-200">
                     <Text className="text-[3vw] text-gray-400 font-bold">No active deals running.</Text>
                  </View>
               )}
            </View>

            {/* Customer Info Card */}
            <View className="bg-white rounded-3xl p-[5vw] border border-gray-100 shadow-sm mb-[8vw]">
               <View className="flex-row justify-between mb-[5vw]">
                  <View>
                     <Text className="text-[2.5vw] text-gray-400 font-bold uppercase tracking-wider mb-[1vw]">Max Budget</Text>
                     <Text className="font-black text-[6vw] text-gray-900">{formatCurrency(customer.budget)}</Text>
                  </View>
                  <View className="items-end">
                     <Text className="text-[2.5vw] text-gray-400 font-bold uppercase tracking-wider mb-[1vw]">Looking For</Text>
                     <View className="bg-gray-100 px-[3vw] py-[1vw] rounded-lg">
                        <Text className="text-[3.5vw] font-bold text-gray-700">{customer.type}</Text>
                     </View>
                  </View>
               </View>
               <View className="pt-[4vw] border-t border-gray-100">
                  <Text className="text-[2.5vw] text-gray-400 font-bold uppercase mb-[1vw] tracking-wider">Preferences / Notes</Text>
                  <Text className="text-[3.5vw] text-gray-600 font-medium leading-relaxed">
                     {customer.notes || 'No specific preferences added.'}
                  </Text>
               </View>
            </View>

            {/* Matches Section */}
            <View>
               <View className="flex-row items-center justify-between mb-[4vw]">
                  <View className="flex-row items-center gap-[2vw]">
                     <Sparkles size={18} color="#f59e0b" fill="#f59e0b" />
                     <Text className="font-bold text-gray-900 text-[4.5vw]">Matches</Text>
                  </View>
                  <View className="bg-amber-100 px-[2.5vw] py-[1vw] rounded-full border border-amber-200">
                     <Text className="text-amber-800 text-[2.5vw] font-bold">{matches.length} found</Text>
                  </View>
               </View>

               {matches.length > 0 ? (
                  <View className="gap-[4vw]">
                     {matches.map(prop => (
                        <TouchableOpacity 
                           key={prop.id} 
                           activeOpacity={0.9}
                           className="bg-white border border-gray-100 rounded-2xl p-[3vw] flex-row gap-[4vw] shadow-sm relative overflow-hidden"
                        >
                           <Image source={{ uri: prop.image }} className="w-[20vw] h-[20vw] rounded-xl bg-gray-200" />
                           <View className="flex-1 py-[1vw] justify-between">
                              <View>
                                 <Text className="font-bold text-[3.5vw] text-gray-900 mb-[1vw]" numberOfLines={1}>{prop.title}</Text>
                                 <View className="flex-row items-center gap-[1vw] mb-[2vw]">
                                    <MapPin size={10} color="#6b7280" />
                                    <Text className="text-[3vw] text-gray-500" numberOfLines={1}>{prop.location}</Text>
                                 </View>
                              </View>
                              <View className="flex-row justify-between items-center">
                                 <Text className="font-black text-indigo-600 text-[3.5vw]">{formatCurrency(prop.price)}</Text>
                                 <TouchableOpacity 
                                    onPress={() => { onStartDeal(customer, prop); setShowPropertyPicker(false); }}
                                    className="bg-gray-900 px-[3vw] py-[1.5vw] rounded-lg shadow-md flex-row items-center gap-[1vw]"
                                 >
                                    <Handshake size={12} color="white" />
                                    <Text className="text-[2.5vw] font-bold text-white">Start Deal</Text>
                                 </TouchableOpacity>
                              </View>
                           </View>
                        </TouchableOpacity>
                     ))}
                  </View>
               ) : (
                  <View className="py-[10vw] bg-gray-50 rounded-3xl border border-dashed border-gray-200 items-center">
                     <View className="bg-white p-[3vw] rounded-full shadow-sm mb-[3vw]">
                        <Search size={24} color="#d1d5db" />
                     </View>
                     <Text className="text-[3.5vw] text-gray-500 font-medium">No properties match this criteria.</Text>
                  </View>
               )}
            </View>

          </ScrollView>

          {/* Property Picker Overlay (Full Cover) */}
          {showPropertyPicker && (
             <View className="absolute inset-0 z-50 bg-white flex-col">
                <View className="p-[4vw] border-b border-gray-100 flex-row items-center justify-between bg-white pt-[6vw]">
                   <Text className="font-black text-[5vw]">Select Property</Text>
                   <TouchableOpacity onPress={() => setShowPropertyPicker(false)} className="p-[2vw]">
                      <X size={24} color="#000" />
                   </TouchableOpacity>
                </View>
                
                <ScrollView className="flex-1 p-[4vw]" contentContainerStyle={{ paddingBottom: 40 }}>
                   {properties.filter(p => p.status === 'Available' && !dealtPropertyIds.includes(p.id)).map(p => (
                      <TouchableOpacity 
                         key={p.id} 
                         onPress={() => { onStartDeal(customer, p); setShowPropertyPicker(false); }}
                         className="flex-row gap-[3vw] p-[3vw] border border-gray-100 rounded-xl items-center mb-[3vw] bg-white active:bg-gray-50"
                      >
                         <Image source={{ uri: p.image }} className="w-[12vw] h-[12vw] rounded-lg bg-gray-200" />
                         <View className="flex-1">
                            <Text className="font-bold text-[3.5vw]">{p.title}</Text>
                            <Text className="text-[3vw] text-gray-500">{formatCurrency(p.price)}</Text>
                         </View>
                         <Plus size={20} color="#9ca3af" />
                      </TouchableOpacity>
                   ))}
                </ScrollView>
             </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default CustomerDetailSheet;