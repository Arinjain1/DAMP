import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Search, ChevronRight } from 'lucide-react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const CustomersList = ({ customers, onSelect }) => {
  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Sticky Header (Fixed View) */}
      <View className="bg-white/95 pt-[12vw] pb-[4vw] px-[6vw] border-b border-gray-200 z-20">
        <View className="flex-row justify-between items-center">
           <Text className="text-[6vw] font-black text-gray-900">Leads</Text>
           <TouchableOpacity className="bg-gray-100 p-[2vw] rounded-full">
              <Search size={20} color="#6b7280"/>
           </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable List */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="p-[5vw] gap-[3vw]">
          {customers.map(customer => (
            <TouchableOpacity 
               key={customer.id} 
               onPress={() => onSelect(customer)} 
               activeOpacity={0.7}
               className="bg-white p-[4vw] rounded-2xl border border-gray-100 shadow-sm flex-row justify-between items-center"
            >
               <View className="flex-row items-center gap-[3vw]">
                  {/* Avatar - Solid color fallback for gradient */}
                  <View className="h-[12vw] w-[12vw] rounded-full flex items-center justify-center bg-indigo-600 shadow-md">
                     <Text className="text-white font-bold text-[4.5vw]">
                        {customer.name.charAt(0)}
                     </Text>
                  </View>
                  
                  <View>
                     <Text className="font-bold text-[3.5vw] text-gray-900">{customer.name}</Text>
                     <View className="flex-row items-center gap-[2vw] mt-[1vw]">
                        <View className="bg-gray-100 px-[1.5vw] py-[0.5vw] rounded">
                           <Text className="text-[2.5vw] font-bold text-gray-600">{customer.status}</Text>
                        </View>
                        <Text className="text-[3vw] text-gray-400">•</Text>
                        <Text className="text-[3vw] text-gray-500 font-medium">{formatCurrency(customer.budget)}</Text>
                     </View>
                  </View>
               </View>
               
               <ChevronRight size={18} color="#d1d5db"/>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CustomersList;