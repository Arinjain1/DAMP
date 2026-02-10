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
    description:
      'Add, edit & organize all your listings\nrent, resale or commercial — in one place.',
  },
  {
    id: 2,
    image: require('../assets/images/onboard2.png'),
    title: 'Client Manager\nBuilt-in',
    description:
      'Track buyers & sellers, calls, visits\nand follow-ups without missing anything.',
  },
  {
    id: 3,
    image: require('../assets/images/onboard3.png'),
    title: 'Smart Deal\nManager',
    description:
      'Handle negotiations, commissions\nand deal status from lead to closure.',
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
      {/* Skip Button */}
      {currentIndex === 0 && (
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: 'absolute',
            top: height * 0.06,
            right: width * 0.05,
            zIndex: 10,
            paddingHorizontal: width * 0.04,
            paddingVertical: height * 0.004,
            backgroundColor: 'black',
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontSize: height * 0.016,
              color: 'white',
              fontFamily: 'Poppins_500Medium',
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Image (UNCHANGED) */}
      <View
        style={{
          height: height * 0.6,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: height * 0.03,
        }}
      >
        <Image
          source={currentScreen.image}
          style={{ width: width, height: '100%' }}
          resizeMode="contain"
        />
      </View>

      {/* Text Content (Responsive like vh) */}
      <View
        style={{
          height: height * 0.4,
          paddingHorizontal: width * 0.08,
          justifyContent: 'space-between',
          paddingBottom: height * 0.03,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: height * 0.03,
            fontFamily: 'Poppins_700Bold',
            color: '#1F2937',
            textAlign: 'center',
            marginBottom: height * 0.008,
          }}
        >
          {currentScreen.title}
        </Text>

        {/* Description */}
        <Text
          style={{
            fontSize: height * 0.017,
            fontFamily: 'Poppins_400Regular',
            color: '#6B7280',
            textAlign: 'center',
            lineHeight: height * 0.025,
            marginBottom: height * 0.025,
          }}
        >
          {currentScreen.description}
        </Text>

        {/* Pagination */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: height * 0.03,
          }}
        >
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? width * 0.08 : width * 0.02,
                height: height * 0.007,
                borderRadius: 4,
                backgroundColor:
                  index === currentIndex ? '#2C3E50' : '#D1D5DB',
                marginHorizontal: width * 0.01,
              }}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: '#2C3E50',
            height: height * 0.065,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: width * 0.05,
          }}
        >
          <View style={{ flex: 1 }} />
          <Text
            style={{
              color: 'white',
              fontSize: height * 0.02,
              fontFamily: 'Poppins_600SemiBold',
              textAlign: 'center',
            }}
          >
            {currentIndex === onboardingData.length - 1
              ? 'Get Started'
              : 'Next'}
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text
              style={{
                color: 'white',
                fontSize: height * 0.028,
              }}
            >
              →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Terms */}
        <Text
          style={{
            fontSize: height * 0.012,
            fontFamily: 'Poppins_400Regular',
            color: '#9CA3AF',
            textAlign: 'center',
            marginTop: height * 0.02,
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
