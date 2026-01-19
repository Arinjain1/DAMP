import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { Lock, ArrowRight, Crown } from 'lucide-react-native';

// Mock Data
const SUBSCRIPTION_PLANS = [
  { id: 1, name: 'Starter', duration: 'Monthly', price: 999, label: null },
  { id: 2, name: 'Pro', duration: 'Yearly', price: 4999, label: 'Save 20%' },
  { id: 3, name: 'Enterprise', duration: 'Lifetime', price: 14999, label: 'Best Value' },
];

const SubscriptionSheet = ({ isOpen, onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[1]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSubscribe(selectedPlan);
    }, 1500);
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 justify-end">

          {/* Backdrop */}
          <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0 bg-black/80" />

          {/* Sheet */}
          <View className="bg-white w-full h-[95vh] rounded-t-[8vw] shadow-2xl overflow-hidden flex-col">
            
            {/* Header */}
            <View className="bg-gray-900 pb-[12vw] relative overflow-hidden rounded-b-[10vw]">
              <View className="absolute top-0 left-0 right-0 bottom-0 bg-blue-600 opacity-20" />
              <View className="p-[8vw] items-center">
                <View className="bg-white/10 p-[4vw] rounded-full w-[20vw] h-[20vw] items-center justify-center mb-[4vw] border border-white/10">
                  <Crown size={40} color="#fbbf24" fill="#fbbf24" />
                </View>
                <Text className="text-[6vw] font-black text-white mb-[1vw]">BrokerOne Pro</Text>
                <Text className="text-gray-300 text-[3.5vw] text-center px-[4vw]">
                  Unlock unlimited access to manage properties, leads, and tasks efficiently.
                </Text>
              </View>
            </View>

            {/* Plans */}
            <ScrollView className="flex-1 px-[6vw] -mt-[8vw] relative z-10" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View className="space-y-[4vw] mb-[4vw]">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => setSelectedPlan(plan)}
                    className={`relative p-[5vw] rounded-2xl border-2 flex-row justify-between items-center ${selectedPlan.id === plan.id ? 'border-gray-900 bg-blue-50' : 'border-gray-100 bg-white'}`}
                  >
                    {selectedPlan.id === plan.id && (
                      <View className="absolute -top-[2.5vw] left-[4vw] bg-gray-900 px-[2vw] py-[0.5vw] rounded-md">
                        <Text className="text-white text-[2.5vw] font-bold uppercase tracking-wider">Selected</Text>
                      </View>
                    )}
                    <View>
                      <Text className="font-bold text-gray-900 text-[4vw]">{plan.name}</Text>
                      <Text className="text-[3vw] text-gray-500 font-medium">{plan.duration}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[5vw] font-black text-gray-900">₹{plan.price}</Text>
                      {plan.label && <View className="bg-green-50 px-[1.5vw] py-[0.5vw] rounded mt-[0.5vw]"><Text className="text-[2.5vw] font-bold text-green-600">{plan.label}</Text></View>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* API Key */}
              <View className="bg-gray-50 p-[4vw] rounded-2xl border border-gray-200">
                <View className="flex-row items-center gap-[2vw] mb-[2vw]">
                  <Lock size={16} color="#9ca3af" />
                  <Text className="text-[3vw] font-bold text-gray-500 uppercase tracking-wide">Secure Payment Gateway</Text>
                </View>
                <TextInput
                  placeholder="Enter Gateway API Key (Optional)"
                  placeholderTextColor="#9ca3af"
                  value={apiKey}
                  onChangeText={setApiKey}
                  className="w-full bg-white p-[3vw] rounded-xl border border-gray-200 text-[3.5vw] font-bold text-gray-900"
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="p-[6vw] border-t border-gray-100 bg-white pb-[8vw]">
              <TouchableOpacity
                onPress={handlePayment}
                disabled={loading}
                className={`w-full bg-gray-900 py-[4vw] rounded-2xl shadow-xl shadow-gray-200 flex-row items-center justify-center gap-[3vw] ${loading ? 'opacity-80' : 'active:scale-95'}`}
              >
                {loading ? <ActivityIndicator color="white" /> : <><Text className="text-white font-bold text-[4.5vw]">Pay ₹{selectedPlan.price} & Start</Text><ArrowRight size={20} color="white" /></>}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SubscriptionSheet;
