import { MapPin, Calendar, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { createSiteVisit } from '../utils/siteVisitHelper';

/**
 * Component to schedule a site visit with multiple properties
 * Usage: Pass client and selected properties
 */
export default function SiteVisitScheduler({ 
  client, 
  selectedProperties, 
  onSuccess, 
  onCancel 
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select date and time');
      return;
    }

    if (!selectedProperties || selectedProperties.length === 0) {
      Alert.alert('Error', 'Please select at least one property');
      return;
    }

    try {
      setLoading(true);
      
      const result = await createSiteVisit({
        client_id: client.id,
        property_ids: selectedProperties.map(p => p.id),
        scheduled_date: selectedDate,
        scheduled_time: selectedTime
      });

      if (result.success) {
        Alert.alert('Success', result.message);
        onSuccess?.(result.visitId);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to schedule site visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        {/* Client Info */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-[#1f2937] mb-2">Client</Text>
          <View className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
            <Text className="text-base font-semibold text-[#1f2937]">{client.name}</Text>
            <Text className="text-sm text-[#6b7280]">{client.phone}</Text>
          </View>
        </View>

        {/* Selected Properties */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-[#1f2937] mb-2">
            Properties ({selectedProperties.length})
          </Text>
          <View className="gap-3">
            {selectedProperties.map((property) => (
              <View
                key={property.id}
                className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]"
              >
                <View className="flex-row items-start gap-3">
                  <MapPin size={20} color="#6366f1" />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-[#1f2937] mb-1">
                      {property.title}
                    </Text>
                    <Text className="text-sm text-[#6b7280] mb-1">
                      {property.address}
                    </Text>
                    <Text className="text-sm font-semibold text-[#10b981]">
                      ₹{property.price?.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-[#1f2937] mb-2">Schedule</Text>
          
          <View className="flex-row items-center gap-3 mb-3">
            <Calendar size={20} color="#6b7280" />
            <Text className="text-base text-[#6b7280]">Date</Text>
          </View>
          {/* Add your date picker component here */}
          <Text className="text-sm text-[#9ca3af] mb-4">
            Selected: {selectedDate || 'Not selected'}
          </Text>

          <View className="flex-row items-center gap-3 mb-3">
            <Clock size={20} color="#6b7280" />
            <Text className="text-base text-[#6b7280]">Time</Text>
          </View>
          {/* Add your time picker component here */}
          <Text className="text-sm text-[#9ca3af]">
            Selected: {selectedTime || 'Not selected'}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-[#e5e7eb] gap-3">
        <TouchableOpacity
          onPress={handleSchedule}
          disabled={loading}
          className={`bg-[#9A8CFC] rounded-xl py-4 items-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? 'Scheduling...' : 'Schedule Site Visit'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          disabled={loading}
          className="bg-[#f3f4f6] rounded-xl py-4 items-center"
        >
          <Text className="text-[#6b7280] text-base font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
