import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Linking,
  Platform,
  StatusBar
} from 'react-native';
import {
  X,
  MapPin,
  Navigation,
  Phone,
  FileSearch,
  CheckCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const SiteVisitSheet = ({ activeVisit, onClose, onFinish }) => {
  if (!activeVisit) return null;
  const { customer, property } = activeVisit;

  const handleMap = () => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    Linking.openURL(`${scheme}${encodeURIComponent(property.location)}`)
      .catch(() =>
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`
        )
      );
  };

  const handleCall = () => Linking.openURL(`tel:${customer.phone}`);

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>

        {/* 🌈 GRADIENT TOP (Dashboard style) */}
        <LinearGradient
          colors={['#BFB7FD', '#E5E1FF', '#f9fafb']}
          locations={[0, 0.65, 1]}
          style={{
            paddingTop: Platform.OS === 'android'
              ? StatusBar.currentHeight + 20
              : 60,
            paddingHorizontal: 20,
            paddingBottom: 32,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          {/* Top Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '900',
              color: '#3E3E3E'
            }}>
              Live Site Visit
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                padding: 10,
                borderRadius: 14
              }}
            >
              <X size={18} color="#111827" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 📜 CONTENT */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
          style={{ paddingHorizontal: 20 }}
        >

          {/* 🏠 PROPERTY CARD */}
          <View style={{
            marginTop: -24,
            backgroundColor: 'white',
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#e5e7eb'
          }}>
            <View style={{ height: 200 }}>
              <ImageBackground
                source={{ uri: property.image }}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={{ position: 'absolute', inset: 0 }}
                />
                <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '900',
                    color: 'white'
                  }}>
                    {property.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <MapPin size={12} color="#e5e7eb" />
                    <Text style={{ color: '#e5e7eb', fontSize: 12, marginLeft: 6 }}>
                      {property.location}
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </View>

            <View style={{ padding: 16 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 12
              }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>Price</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800' }}>
                    {formatCurrency(property.price)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>Size</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800' }}>
                    {property.size} sqft
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleMap}
                style={{
                  backgroundColor: '#3E3E3E',
                  paddingVertical: 12,
                  borderRadius: 14,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Navigation size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Navigate to Property
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 👤 CUSTOMER */}
          <View style={{
            marginTop: 20,
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#e5e7eb'
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '700',
              color: '#9ca3af',
              marginBottom: 12
            }}>
              VISITING WITH
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                height: 44,
                width: 44,
                borderRadius: 22,
                backgroundColor: '#4f46e5',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: 'white', fontWeight: '900' }}>
                  {customer.name.charAt(0)}
                </Text>
              </View>

              <View>
                <Text style={{ fontSize: 15, fontWeight: '800' }}>
                  {customer.name}
                </Text>
                <TouchableOpacity
                  onPress={handleCall}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
                >
                  <Phone size={12} color="#16a34a" />
                  <Text style={{ color: '#16a34a', fontSize: 12 }}>
                    {customer.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 💡 TIP */}
          <View style={{
            marginTop: 20,
            backgroundColor: '#eef2ff',
            padding: 16,
            borderRadius: 20
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FileSearch size={14} color="#4f46e5" />
              <Text style={{ fontWeight: '700', color: '#4f46e5' }}>
                Analysis Tip
              </Text>
            </View>
            <Text style={{
              fontSize: 13,
              color: '#3730a3',
              marginTop: 8
            }}>
              Ask buyer about layout comfort, ventilation & objections instantly.
            </Text>
          </View>

        </ScrollView>

        {/* ✅ BOTTOM ACTION */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderColor: '#e5e7eb'
        }}>
          <TouchableOpacity
            onPress={() => onFinish(activeVisit)}
            style={{
              backgroundColor: '#22c55e',
              paddingVertical: 14,
              borderRadius: 18,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>
              Mark Visit Complete
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
};

export { SiteVisitSheet };
