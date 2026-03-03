import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Scale, FileText } from 'lucide-react-native';

const LegalPage = () => {

  const documents = [
    'Sale Agreement',
    'Rent Agreement',
    'Token Receipt',
    'MOU Draft',
    'NOC Format',
    'Commission Slip'
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-[6vw] pb-[4vw] pt-[12vw] border-b border-gray-200">
        <View className="flex-row items-center gap-[2vw]">
          <Scale size={28} color="#4f46e5" />
          <Text className="text-[6vw] font-black text-gray-900">Legal Desk</Text>
        </View>
        <Text className="text-[3.5vw] text-gray-500 mt-[1vw]">Generate & Manage Documents</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Document Grid */}
        <View className="p-[5vw] flex-row flex-wrap gap-[4vw]">
          {documents.map((doc, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              className="w-[43vw] h-[32vw] bg-white rounded-2xl border border-gray-100 items-center justify-center gap-[3vw] shadow-sm active:scale-95 active:border-indigo-200"
            >
              <View className="bg-indigo-50 p-[3vw] rounded-full">
                <FileText size={24} color="#4f46e5" />
              </View>
              <Text className="text-[3vw] font-bold text-gray-700 text-center px-[2vw]">
                {doc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Expert Help Banner */}
        <View className="px-[5vw] mt-[2vw]">
          <View className="bg-indigo-900 p-[5vw] rounded-2xl shadow-lg relative overflow-hidden">

            {/* Content (Z-Index 10) */}
            <View className="relative z-10">
              <Text className="font-bold text-[4.5vw] text-white">Need Expert Help?</Text>
              <Text className="text-[3vw] text-indigo-200 mt-[1vw] mb-[3vw]">
                Connect with our partner legal experts for verification.
              </Text>
              <TouchableOpacity className="bg-white px-[4vw] py-[2vw] rounded-lg self-start">
                <Text className="text-indigo-900 text-[3vw] font-bold">Contact Lawyer</Text>
              </TouchableOpacity>
            </View>

            {/* Background Icon Decoration */}
            <View className="absolute -bottom-4 -right-4 opacity-10 transform rotate-12">
              <Scale size={100} color="white" />
            </View>

          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default LegalPage;