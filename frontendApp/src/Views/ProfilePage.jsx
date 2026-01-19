import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { 
  Award, 
  CreditCard, 
  Zap, 
  User, 
  Phone, 
  Briefcase, 
  MapPin, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  ChevronRight 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ProfilePage = ({ subscription, onRenew }) => {
  return (
    <ScrollView 
      className="flex-1 bg-gray-50" 
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      
      {/* --- HERO HEADER --- */}
      <View className="bg-gray-900 pt-[14vw] pb-[20vw] px-[6vw] items-center rounded-b-[12vw] relative overflow-hidden shadow-xl">
        
        {/* Background Gradient */}
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.2)', 'rgba(147, 51, 234, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />

        <View className="relative z-10 items-center">
           {/* Profile Image Ring */}
           <View className="w-[28vw] h-[28vw] bg-white/20 rounded-full p-[1.5vw] border-2 border-white/30 mb-[4vw] shadow-2xl">
              <Image 
                 source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' }} 
                 className="w-full h-full rounded-full border-2 border-gray-800"
                 resizeMode="cover"
              />
           </View>
           
           <Text className="text-[6vw] font-black text-white tracking-tight">Rajesh Sharma</Text>
           <Text className="text-gray-400 text-[3.5vw] font-medium">Senior Property Consultant</Text>
           
           {/* Badges */}
           <View className="flex-row justify-center gap-[3vw] mt-[4vw]">
              <View className="bg-amber-500/20 border border-amber-400/30 px-[3vw] py-[1vw] rounded-full flex-row items-center gap-[1vw]">
                 <Award size={12} color="#fcd34d" />
                 <Text className="text-amber-300 text-[2.5vw] font-bold uppercase tracking-wider">Top Rated</Text>
              </View>
              <View className="bg-white/10 border border-white/20 px-[3vw] py-[1vw] rounded-full">
                 <Text className="text-white text-[2.5vw] font-bold uppercase tracking-wider">ID: BROK-8821</Text>
              </View>
           </View>
        </View>
      </View>

      {/* --- OVERLAPPING CONTENT --- */}
      <View className="px-[6vw] -mt-[12vw] relative z-20 gap-[6vw]">
         
         {/* Stats Grid */}
         <View className="flex-row justify-between gap-[3vw]">
            <View className="flex-1 bg-white p-[3vw] rounded-2xl shadow-sm border border-gray-100 items-center">
               <Text className="text-[5vw] font-black text-gray-900">45</Text>
               <Text className="text-[2.2vw] text-gray-400 font-bold uppercase">Deals Closed</Text>
            </View>
            <View className="flex-1 bg-white p-[3vw] rounded-2xl shadow-sm border border-gray-100 items-center">
               <Text className="text-[5vw] font-black text-gray-900">128</Text>
               <Text className="text-[2.2vw] text-gray-400 font-bold uppercase">Happy Clients</Text>
            </View>
            <View className="flex-1 bg-white p-[3vw] rounded-2xl shadow-sm border border-gray-100 items-center">
               <Text className="text-[5vw] font-black text-gray-900">4.9</Text>
               <Text className="text-[2.2vw] text-gray-400 font-bold uppercase">Rating</Text>
            </View>
         </View>

         {/* Subscription Card */}
         <View className="bg-white p-[5vw] rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
            {/* Decorative Shape */}
            <View className="absolute top-0 right-0 w-[24vw] h-[24vw] bg-blue-50 rounded-bl-[10vw] -mr-[4vw] -mt-[4vw] z-0" />
            
            <View className="relative z-10">
               <View className="flex-row justify-between items-center mb-[4vw] pb-[4vw] border-b border-gray-100">
                  <View className="flex-row items-center gap-[2vw]">
                     <CreditCard size={18} color="#2563eb"/>
                     <Text className="font-bold text-gray-900 text-[4vw]">Subscription</Text>
                  </View>
                  <View className={`px-[2vw] py-[1vw] rounded border ${subscription.active ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                     <Text className={`text-[2.5vw] font-bold ${subscription.active ? 'text-green-700' : 'text-red-700'}`}>
                        {subscription.active ? 'PRO ACTIVE' : 'EXPIRED'}
                     </Text>
                  </View>
               </View>

               <View className="gap-[3vw] mb-[5vw]">
                  <View className="flex-row justify-between">
                     <Text className="text-gray-500 font-medium text-[3.5vw]">Current Plan</Text>
                     <Text className="font-bold text-gray-900 text-[3.5vw]">{subscription.plan || 'Free Tier'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                     <Text className="text-gray-500 font-medium text-[3.5vw]">Valid Until</Text>
                     <Text className="font-bold text-gray-900 text-[3.5vw]">{subscription.expiry || 'N/A'}</Text>
                  </View>
               </View>

               <TouchableOpacity 
                  onPress={onRenew} 
                  className="w-full bg-gray-900 py-[3vw] rounded-xl shadow-md flex-row items-center justify-center gap-[2vw] active:scale-95"
               >
                  <Zap size={16} color="#fbbf24" fill="#fbbf24"/> 
                  <Text className="text-white font-bold text-[3.5vw]">
                     {subscription.active ? 'Manage Plan' : 'Upgrade to Pro'}
                  </Text>
               </TouchableOpacity>
            </View>
         </View>

         {/* Account Info Card */}
         <View className="bg-white p-[5vw] rounded-2xl shadow-sm border border-gray-100">
            <View className="flex-row items-center gap-[2vw] mb-[4vw]">
               <User size={18} color="#9ca3af"/>
               <Text className="font-bold text-gray-900 text-[4vw]">Account Info</Text>
            </View>

            <View className="gap-[4vw]">
               <View className="flex-row items-center gap-[4vw] border-b border-gray-50 pb-[3vw]">
                  <View className="w-[10vw] h-[10vw] rounded-full bg-gray-50 items-center justify-center">
                     <Phone size={18} color="#6b7280"/>
                  </View>
                  <View>
                     <Text className="text-[2.5vw] text-gray-400 font-bold uppercase">Phone</Text>
                     <Text className="font-bold text-[3.5vw] text-gray-900">+91 98765 43210</Text>
                  </View>
               </View>

               <View className="flex-row items-center gap-[4vw] border-b border-gray-50 pb-[3vw]">
                  <View className="w-[10vw] h-[10vw] rounded-full bg-gray-50 items-center justify-center">
                     <Briefcase size={18} color="#6b7280"/>
                  </View>
                  <View>
                     <Text className="text-[2.5vw] text-gray-400 font-bold uppercase">Agency Name</Text>
                     <Text className="font-bold text-[3.5vw] text-gray-900">Sharma Real Estate</Text>
                  </View>
               </View>

               <View className="flex-row items-center gap-[4vw]">
                  <View className="w-[10vw] h-[10vw] rounded-full bg-gray-50 items-center justify-center">
                     <MapPin size={18} color="#6b7280"/>
                  </View>
                  <View>
                     <Text className="text-[2.5vw] text-gray-400 font-bold uppercase">Location</Text>
                     <Text className="font-bold text-[3.5vw] text-gray-900">Indiranagar, Bangalore</Text>
                  </View>
               </View>
            </View>
         </View>

         {/* Actions */}
         <View className="gap-[3vw] mb-[4vw]">
            <TouchableOpacity className="w-full bg-white p-[4vw] rounded-xl flex-row items-center justify-between shadow-sm border border-gray-100 active:bg-gray-50">
               <View className="flex-row items-center gap-[3vw]">
                  <Settings size={18} color="#374151"/>
                  <Text className="font-bold text-gray-700 text-[3.5vw]">App Settings</Text>
               </View>
               <ChevronRight size={18} color="#d1d5db"/>
            </TouchableOpacity>

            <TouchableOpacity className="w-full bg-white p-[4vw] rounded-xl flex-row items-center justify-between shadow-sm border border-gray-100 active:bg-gray-50">
               <View className="flex-row items-center gap-[3vw]">
                  <ShieldCheck size={18} color="#374151"/>
                  <Text className="font-bold text-gray-700 text-[3.5vw]">Privacy & Security</Text>
               </View>
               <ChevronRight size={18} color="#d1d5db"/>
            </TouchableOpacity>

            <TouchableOpacity className="w-full bg-red-50 p-[4vw] rounded-xl flex-row items-center gap-[3vw] justify-center border border-red-100 mt-[2vw] active:bg-red-100">
               <LogOut size={18} color="#dc2626"/>
               <Text className="text-red-600 font-bold text-[3.5vw]">Sign Out</Text>
            </TouchableOpacity>
         </View>

      </View>
    </ScrollView>
  );
};

export default ProfilePage;