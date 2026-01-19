import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  Platform 
} from 'react-native';
import { X, Search, MapPin } from 'lucide-react-native';

// Mock Data
const INITIAL_BROKERS = [
  { id: 1, name: 'Rahul Sharma', location: 'Indore, MP' },
  { id: 2, name: 'Priya Verma', location: 'Bhopal, MP' },
  { id: 3, name: 'Amit Singh', location: 'Dewas, MP' },
  { id: 4, name: 'Sneha Gupta', location: 'Ujjain, MP' },
];

const CollaborationSheet = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/60">
        
        {/* Backdrop Tap to Close */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          className="absolute inset-0"
        />

        {/* Sheet Container */}
        <View className="bg-white w-full h-[85vh] rounded-t-[8vw] shadow-2xl flex-col overflow-hidden">
          
          {/* Header */}
          <View className="p-[6vw] border-b border-gray-100 flex-row justify-between items-center bg-white">
            <View>
              <Text className="text-[5vw] font-black text-gray-900">Broker Network</Text>
              <Text className="text-[3vw] text-gray-500 font-medium mt-[0.5vw]">Connect & Share Inventory</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-[2vw] rounded-full bg-gray-50">
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-[5vw]" contentContainerStyle={{ paddingBottom: 40 }}>
            
            {/* Search Bar */}
            <View className="relative mb-[4vw]">
              <View className="flex-row items-center bg-gray-50 rounded-2xl px-[4vw] py-[1vw] border border-gray-100">
                 <Search size={18} color="#9ca3af" />
                 <TextInput 
                    placeholder="Search brokers by area..."
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-[3vw] py-[3vw] font-bold text-gray-700 text-[3.5vw]"
                 />
              </View>
            </View>

            {/* Broker List */}
            <View className="space-y-[3vw] gap-[3vw]">
              {INITIAL_BROKERS.map(broker => (
                <View 
                  key={broker.id} 
                  className="border border-gray-100 rounded-2xl p-[4vw] flex-row items-center justify-between shadow-sm bg-white"
                >
                  <View className="flex-row items-center gap-[4vw]">
                    {/* Avatar (Solid color fallback for gradient) */}
                    <View className="w-[12vw] h-[12vw] bg-indigo-500 rounded-2xl items-center justify-center shadow-md shadow-indigo-200">
                      <Text className="text-white font-bold text-[4.5vw]">{broker.name.charAt(0)}</Text>
                    </View>
                    
                    <View>
                      <Text className="font-bold text-[3.5vw] text-gray-900">{broker.name}</Text>
                      <View className="flex-row items-center mt-[0.5vw]">
                        <MapPin size={12} color="#818cf8" />
                        <Text className="text-[3vw] text-gray-500 font-medium ml-[1vw]">{broker.location}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity className="bg-indigo-50 px-[4vw] py-[2vw] rounded-xl border border-indigo-100 active:bg-indigo-100">
                    <Text className="text-indigo-700 text-[3vw] font-bold">Connect</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Invite Banner */}
            <View className="mt-[6vw] bg-blue-50 p-[5vw] rounded-2xl border border-blue-100 items-center">
              <Text className="text-[3.5vw] text-blue-800 font-bold mb-[1vw]">Expand your reach</Text>
              <Text className="text-[3vw] text-blue-600 mb-[3vw]">Invite fellow brokers to BrokerOne.</Text>
              <TouchableOpacity className="bg-blue-600 px-[5vw] py-[2.5vw] rounded-xl shadow-lg shadow-blue-200 active:opacity-90">
                <Text className="text-white text-[3vw] font-bold">Invite Friends</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default CollaborationSheet;