import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('../assets/images/onboard1.png'),
    title: 'Property Manager\nfor Brokers',
    description: 'Add, edit & organize all your listings\nrent, resale or commercial — in one place.',
  },
  {
    id: 2,
    image: require('../assets/images/onboard2.png'),
    title: 'Client Manager\nBuilt-in',
    description: 'Track buyers & sellers, calls, visits\nand follow-ups without missing anything.',
  },
  {
    id: 3,
    image: require('../assets/images/onboard3.png'),
    title: 'Smart Deal\nManager',
    description: 'Handle negotiations, commissions\nand deal status from lead to closure.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleNext = async () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await handleSkip();
    }
  };

  const currentScreen = onboardingData[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Skip Button - Only on first screen */}
      {currentIndex === 0 && (
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 10,
            paddingHorizontal: 13,
            paddingVertical: 3,
            backgroundColor:'black',
            borderRadius:20,
          }}
        >
          <Text style={{ fontSize: 14, color: 'white', fontFamily: 'Poppins_500Medium' }}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Image */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <Image
          source={currentScreen.image}
          style={{ width: width }}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: 30, paddingBottom: 60 }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: 'Poppins_700Bold',
            color: '#1F2937',
            textAlign: 'center',
            marginBottom: 1,
          }}
        >
          {currentScreen.title}
        </Text>

        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Poppins_400Regular',
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 22,
          }}
        >
          {currentScreen.description}
        </Text>

        {/* Pagination Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 32 : 8,
                height: 6,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? '#2C3E50' : '#D1D5DB',
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: '#2C3E50',
            paddingVertical: 10,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Poppins_600SemiBold',
              marginRight: 8,
            }}
          >
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Text style={{ color: 'white', fontSize: 20 ,alignSelf:'flex-end'}}>→</Text>
        </TouchableOpacity>

        {/* Terms & Privacy */}
        <Text
          style={{
            fontSize: 10,
            fontFamily: 'Poppins_400Regular',
            color: '#9CA3AF',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          By continuing, you agree that you have read and accept our{'\n'}
          <Text style={{ color: '#2C3E50' }}>T&Cs</Text> and{' '}
          <Text style={{ color: '#2C3E50' }}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}
