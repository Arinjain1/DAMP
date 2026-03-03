import React from 'react';
import {
   View,
   Text,
   ScrollView,
   TouchableOpacity
} from 'react-native';
import {
   ArrowLeft,
   UserPlus,
   Clock,
   Handshake,
   Bell
} from 'lucide-react-native';

const NotificationsPage = ({ notifications, onMarkAllRead, onBack }) => {

   // Helper to get icon based on type
   const getIcon = (type) => {
      switch (type) {
         case 'lead': return <UserPlus size={22} color="#374151" />;
         case 'task': return <Clock size={22} color="#374151" />;
         case 'collab': return <Handshake size={22} color="#374151" />;
         default: return <Bell size={22} color="#374151" />;
      }
   };

   return (
      // Using a Modal or Absolute View to mimic the "Page Overlay" behavior
      <View className="absolute inset-0 z-50 bg-gray-50 flex-1">

         {/* Sticky Header */}
         <View className="bg-white px-[6vw] pt-[12vw] pb-[4vw] border-b border-gray-200 flex-row justify-between items-center shadow-sm z-10">
            <View className="flex-row items-center gap-[3vw]">
               <TouchableOpacity
                  onPress={onBack}
                  className="bg-gray-50 p-[2vw] rounded-full active:bg-gray-100"
               >
                  <ArrowLeft size={20} color="#4b5563" />
               </TouchableOpacity>
               <Text className="text-[5vw] font-black text-gray-900">Notifications</Text>
            </View>

            <TouchableOpacity
               onPress={onMarkAllRead}
               className="bg-gray-100 px-[3vw] py-[1.5vw] rounded-lg active:bg-gray-200"
            >
               <Text className="text-[3vw] font-bold text-gray-600">Mark all read</Text>
            </TouchableOpacity>
         </View>

         {/* Notification List */}
         <ScrollView className="flex-1 p-[5vw]" contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="gap-[4vw]">
               {notifications.map(n => (
                  <View
                     key={n.id}
                     className={`
                      p-[4vw] rounded-2xl flex-row gap-[4vw]
                      ${n.read
                           ? 'bg-white border border-gray-100'
                           : 'bg-white border-l-[1.5vw] border-l-gray-900 border-y border-r border-gray-100 shadow-sm'
                        }
                   `}
                  >
                     {/* Icon Container */}
                     <View className="h-[12vw] w-[12vw] rounded-2xl flex items-center justify-center bg-gray-50">
                        {getIcon(n.type)}
                     </View>

                     {/* Content */}
                     <View className="flex-1 justify-center">
                        <View className="flex-row justify-between items-start mb-[1vw]">
                           <Text
                              className={`text-[3.5vw] font-bold flex-1 mr-[2vw] ${n.read ? 'text-gray-600' : 'text-gray-900'}`}
                              numberOfLines={1}
                           >
                              {n.title}
                           </Text>
                           <Text className="text-[2.5vw] font-bold text-gray-400">{n.time}</Text>
                        </View>
                        <Text
                           className="text-[3vw] text-gray-500 leading-relaxed"
                           numberOfLines={2}
                        >
                           {n.message}
                        </Text>
                     </View>
                  </View>
               ))}
            </View>
         </ScrollView>
      </View>
   );
};

export default NotificationsPage;