import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Linking 
} from 'react-native';
import { 
  Home, 
  CheckCircle, 
  Map, 
  Phone, 
  MessageCircle 
} from 'lucide-react-native';

// Mock helper if not provided globally
const generateId = () => Math.random().toString(36).substr(2, 9);

const FollowUpsList = ({ followUps, customers, properties, onUpdateStatus, onDelete, onStartVisit }) => {
  const [filter, setFilter] = useState('Pending');
  
  const filteredTasks = followUps
    .filter(t => t.status === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Action Handlers
  const handleCall = (phone) => {
    if(phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone) => {
    if(phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Sticky Header (Fixed View at top) */}
      <View className="bg-white/95 pt-[12vw] pb-[4vw] px-[6vw] border-b border-gray-200 flex-row justify-between items-end z-20 shadow-sm">
         <Text className="text-[6vw] font-black text-gray-900">Daily Planner</Text>
         <View className="flex-row bg-gray-100 p-[1vw] rounded-lg">
            {['Pending', 'Done'].map(f => (
               <TouchableOpacity 
                  key={f} 
                  onPress={() => setFilter(f)} 
                  className={`px-[4vw] py-[1.5vw] rounded-md transition-all ${filter === f ? 'bg-white shadow-sm' : ''}`}
               >
                  <Text className={`text-[3vw] font-bold ${filter === f ? 'text-gray-900' : 'text-gray-500'}`}>
                     {f}
                  </Text>
               </TouchableOpacity>
            ))}
         </View>
      </View>
      
      {/* Scrollable List Area */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
         <View className="p-[5vw] relative min-h-screen">
            
            {/* Vertical Timeline Line */}
            <View className="absolute top-[5vw] left-[11vw] bottom-0 w-[0.5vw] bg-gray-200 z-0" />

            <View className="gap-[6vw] relative z-10">
               {filteredTasks.length > 0 ? filteredTasks.map((task) => {
                  const customer = customers.find(c => c.id === task.customerId);
                  const property = properties.find(p => p.id === task.propertyId);
                  const date = new Date(task.date);
                  const isVisit = task.type === 'Visit' || task.type === 'Meeting';
                  
                  return (
                     <View key={task.id} className="flex-row gap-[4vw]">
                        
                        {/* Left Column: Time & Dot */}
                        <View className="flex-col items-center w-[12vw] pt-[1vw]">
                           <Text className="text-[3vw] font-bold text-gray-900">
                              {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </Text>
                           <View className={`w-[3.5vw] h-[3.5vw] rounded-full border-2 mt-[1vw] bg-white ${isVisit ? 'border-amber-500' : 'border-blue-500'}`} />
                        </View>

                        {/* Right Column: Task Card */}
                        <View className={`flex-1 bg-white p-[4vw] rounded-2xl shadow-sm border-l-[1.5vw] ${isVisit ? 'border-l-amber-500' : 'border-l-blue-500'} border-y border-r border-gray-100`}>
                           
                           {/* Card Header */}
                           <View className="flex-row justify-between items-start mb-[2vw]">
                              <View className="flex-1 mr-[2vw]">
                                 <View className={`self-start px-[2vw] py-[0.5vw] rounded mb-[1vw] ${isVisit ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                    <Text className={`text-[2.5vw] font-bold uppercase tracking-wider ${isVisit ? 'text-amber-700' : 'text-blue-700'}`}>
                                       {isVisit ? 'Site Visit' : 'Call / Follow-up'}
                                    </Text>
                                 </View>
                                 <Text className="font-bold text-gray-900 text-[3.5vw]">{customer?.name}</Text>
                                 {property && (
                                    <View className="flex-row items-center gap-[1vw] mt-[0.5vw]">
                                       <Home size={10} color="#6b7280" />
                                       <Text className="text-[2.5vw] text-gray-500 font-bold" numberOfLines={1}>
                                          {property.title}
                                       </Text>
                                    </View>
                                 )}
                              </View>
                              
                              {/* Check/Done Button */}
                              {filter !== 'Done' && (
                                 <TouchableOpacity 
                                    onPress={() => onUpdateStatus(task.id, 'Done')} 
                                    className="bg-gray-50 p-[1.5vw] rounded-full active:bg-green-50"
                                 >
                                    <CheckCircle size={22} color="#9ca3af" />
                                 </TouchableOpacity>
                              )}
                           </View>
                           
                           {/* Note */}
                           <Text className="text-[3vw] text-gray-500 mb-[3vw]">{task.note}</Text>
                           
                           {/* Action Buttons */}
                           {isVisit && filter === 'Pending' && property ? (
                              <TouchableOpacity 
                                 onPress={() => onStartVisit({ id: generateId(), customer, property, taskId: task.id })}
                                 className="w-full bg-gray-900 py-[2.5vw] rounded-xl shadow-md active:scale-95 flex-row items-center justify-center gap-[2vw]"
                              >
                                 <Map size={14} color="#fbbf24" />
                                 <Text className="text-white text-[3vw] font-bold">Start Site Visit Flow</Text>
                              </TouchableOpacity>
                           ) : (
                              <View className="flex-row gap-[2vw] pt-[2vw] border-t border-gray-50">
                                 <TouchableOpacity 
                                    onPress={() => handleCall(customer?.phone)} 
                                    className="flex-1 flex-row items-center justify-center gap-[1.5vw] py-[2vw] rounded-lg bg-green-50 active:bg-green-100"
                                 >
                                    <Phone size={14} color="#15803d" />
                                    <Text className="text-green-700 text-[3vw] font-bold">Call</Text>
                                 </TouchableOpacity>
                                 
                                 <TouchableOpacity 
                                    onPress={() => handleWhatsApp(customer?.phone)}
                                    className="flex-1 flex-row items-center justify-center gap-[1.5vw] py-[2vw] rounded-lg bg-gray-50 active:bg-gray-100"
                                 >
                                    <MessageCircle size={14} color="#4b5563" />
                                    <Text className="text-gray-600 text-[3vw] font-bold">WhatsApp</Text>
                                 </TouchableOpacity>
                              </View>
                           )}
                        </View>
                     </View>
                  );
               }) : (
                  <View className="items-center py-[20vw]">
                     <Text className="text-gray-400 font-medium text-[3.5vw]">No tasks scheduled.</Text>
                  </View>
               )}
            </View>
         </View>
      </ScrollView>
    </View>
  );
};

export default FollowUpsList;