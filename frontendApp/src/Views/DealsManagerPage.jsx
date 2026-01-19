import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { Briefcase, ChevronRight } from 'lucide-react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const DealsManagerPage = ({ deals, properties, customers, onOpenDeal }) => {
   const [filter, setFilter] = useState('All');

   // Sort and Filter Logic
   const sortedDeals = [...deals].sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt));
   const filteredDeals = filter === 'All' ? sortedDeals : sortedDeals.filter(d => d.stage === filter);

   const filters = ['All', 'Meeting', 'Negotiation', 'Agreement', 'Closed', 'Dropped'];

   return (
      <View className="flex-1 bg-gray-50">
         
         {/* --- STICKY HEADER --- */}
         <View className="bg-white px-[6vw] pt-[12vw] pb-[4vw] border-b border-gray-200 z-20 shadow-sm">
            <View className="flex-row items-center gap-[2vw]">
               <Briefcase size={24} color="#4f46e5" />
               <Text className="text-[6vw] font-black text-gray-900">Deals Manager</Text>
            </View>
            <Text className="text-[3.5vw] text-gray-500 mt-[1vw]">Track your property pipeline</Text>
            
            {/* Filter Horizontal Scroll */}
            <View className="mt-[4vw]">
               <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
               >
                  {filters.map(f => (
                     <TouchableOpacity 
                        key={f} 
                        onPress={() => setFilter(f)} 
                        className={`
                           px-[4vw] py-[2vw] rounded-lg border mr-[2vw]
                           ${filter === f 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'bg-white border-gray-200'
                           }
                        `}
                     >
                        <Text className={`text-[3vw] font-bold ${filter === f ? 'text-white' : 'text-gray-500'}`}>
                           {f}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>
         </View>

         {/* --- SCROLLABLE CONTENT --- */}
         <ScrollView className="flex-1 p-[5vw]" contentContainerStyle={{ paddingBottom: 100 }}>
            {filteredDeals.length > 0 ? (
               <View className="gap-[4vw]">
                  {filteredDeals.map(deal => {
                     const prop = properties.find(p => p.id === deal.propertyId);
                     const cust = customers.find(c => c.id === deal.customerId);
                     
                     return (
                        <TouchableOpacity 
                           key={deal.id} 
                           onPress={() => onOpenDeal(deal)} 
                           activeOpacity={0.9}
                           className="bg-white p-[4vw] rounded-2xl border border-gray-100 shadow-sm"
                        >
                           {/* Card Top: Property Info & Status */}
                           <View className="flex-row justify-between items-start mb-[3vw]">
                              <View className="flex-row gap-[3vw] flex-1">
                                 <Image 
                                    source={{ uri: prop?.image }} 
                                    className="w-[12vw] h-[12vw] rounded-xl bg-gray-200" 
                                 />
                                 <View className="flex-1 mr-[2vw]">
                                    <Text className="font-bold text-[3.5vw] text-gray-900" numberOfLines={1}>
                                       {prop?.title}
                                    </Text>
                                    <Text className="text-[3vw] text-gray-500" numberOfLines={1}>
                                       {prop?.location}
                                    </Text>
                                 </View>
                              </View>
                              
                              {/* Status Badge */}
                              <View className={`px-[2vw] py-[1vw] rounded ${
                                 deal.stage === 'Closed' ? 'bg-green-100' : 
                                 deal.stage === 'Dropped' ? 'bg-red-50' : 
                                 'bg-indigo-50'
                              }`}>
                                 <Text className={`text-[2.5vw] font-bold ${
                                    deal.stage === 'Closed' ? 'text-green-700' : 
                                    deal.stage === 'Dropped' ? 'text-red-500' : 
                                    'text-indigo-700'
                                 }`}>
                                    {deal.stage}
                                 </Text>
                              </View>
                           </View>

                           {/* Card Middle: Customer & Price */}
                           <View className="bg-gray-50 p-[3vw] rounded-xl flex-row items-center justify-between mb-[3vw]">
                              <View className="flex-row items-center gap-[2vw]">
                                 <View className="w-[6vw] h-[6vw] rounded-full bg-indigo-100 items-center justify-center">
                                    <Text className="text-[2.5vw] font-bold text-indigo-700">{cust?.name.charAt(0)}</Text>
                                 </View>
                                 <Text className="text-[3vw] font-bold text-gray-700">{cust?.name}</Text>
                              </View>
                              <Text className="text-[3vw] font-black text-gray-900">{formatCurrency(prop?.price)}</Text>
                           </View>

                           {/* Card Bottom: Footer */}
                           <View className="flex-row justify-between items-center pt-[2vw] border-t border-gray-100">
                              <Text className="text-[2.5vw] font-bold text-gray-400">
                                 Updated: {new Date(deal.startedAt).toLocaleDateString()}
                              </Text>
                              <View className="flex-row items-center gap-[1vw]">
                                 <Text className="text-[2.5vw] font-bold text-indigo-600">Manage Deal</Text>
                                 <ChevronRight size={12} color="#4f46e5"/>
                              </View>
                           </View>
                        </TouchableOpacity>
                     )
                  })}
               </View>
            ) : (
               /* Empty State */
               <View className="items-center justify-center py-[20vw]">
                  <View className="bg-gray-100 h-[20vw] w-[20vw] rounded-full items-center justify-center mb-[4vw]">
                     <Briefcase size={32} color="#d1d5db"/>
                  </View>
                  <Text className="text-gray-900 font-bold text-[4.5vw]">No Deals Found</Text>
                  <Text className="text-[3.5vw] text-gray-500 mt-[1vw] text-center px-[10vw]">
                     Start a deal from Customers or Properties tab.
                  </Text>
               </View>
            )}
         </ScrollView>
      </View>
   );
};

export default DealsManagerPage;