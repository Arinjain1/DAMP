import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Filter } from 'lucide-react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const StatsPage = ({ properties, customers }) => {
  // Calculations
  const totalValue = properties.reduce((sum, p) => sum + (p.status === 'Available' ? p.price : 0), 0);
  const availableCount = properties.filter(p => p.status === 'Available').length;
  const soldCount = properties.filter(p => p.status === 'Sold').length;
  const totalProperties = properties.length || 1; // Avoid divide by zero

  // Calculate percentages for progress bars
  const availablePercent = (availableCount / totalProperties) * 100;
  const soldPercent = (soldCount / totalProperties) * 100;

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Header */}
      <View className="bg-white px-[6vw] pb-[4vw] pt-[12vw] border-b border-gray-200 shadow-sm">
        <Text className="text-[6vw] font-black text-gray-900">Analytics</Text>
        <Text className="text-[3.5vw] text-gray-500 mt-[1vw]">Business Performance Overview</Text>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 p-[5vw]" contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Total Value Card (Dark) */}
        <View className="bg-gray-900 rounded-2xl p-[6vw] shadow-lg mb-[6vw]">
          <Text className="text-gray-400 text-[3vw] font-bold uppercase tracking-wider mb-[2vw]">
            Total Inventory Value
          </Text>
          <Text className="text-[8vw] font-black text-white tracking-tight">
            {formatCurrency(totalValue)}
          </Text>
          <Text className="text-[3vw] text-gray-400 mt-[2vw] font-medium">
            {availableCount} Active Listings
          </Text>
        </View>

        {/* Inventory Stats Card (White) */}
        <View className="bg-white p-[6vw] rounded-2xl border border-gray-100 shadow-sm">
          <View className="flex-row items-center gap-[2vw] mb-[5vw]">
             <Filter size={18} color="#9ca3af" />
             <Text className="font-bold text-gray-900 text-[4.5vw]">Inventory Stats</Text>
          </View>
          
          <View className="gap-[5vw]">
             {/* Available Progress Bar */}
             <View>
                <View className="flex-row justify-between mb-[2vw]">
                   <Text className="text-[3vw] font-bold text-blue-600">Available</Text>
                   <Text className="text-[3vw] font-bold text-gray-900">{availableCount}</Text>
                </View>
                <View className="w-full bg-blue-50 h-[2.5vw] rounded-full overflow-hidden">
                   <View 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${availablePercent}%` }}
                   />
                </View>
             </View>

             {/* Sold Out Progress Bar */}
             <View>
                <View className="flex-row justify-between mb-[2vw]">
                   <Text className="text-[3vw] font-bold text-green-600">Sold Out</Text>
                   <Text className="text-[3vw] font-bold text-gray-900">{soldCount}</Text>
                </View>
                <View className="w-full bg-green-50 h-[2.5vw] rounded-full overflow-hidden">
                   <View 
                      className="bg-green-600 h-full rounded-full" 
                      style={{ width: `${soldPercent}%` }}
                   />
                </View>
             </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default StatsPage;