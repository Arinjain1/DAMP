import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Center Action Button (Tasks / Quick Action)
          if (route.name === 'Action') {
            return (
              <View key={route.key} style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={onPress}
                  style={styles.centerButton}
                >
                  <MaterialCommunityIcons
                    name="clipboard-check-outline"
                    size={28}
                    color="#000000"
                  />
                </TouchableOpacity>
              </View>
            );
          }

          // Regular Tab Items: Home, CRM, Inventory, Profile
          let iconName = 'home-outline';
          let label = route.name;

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
            label = 'Home';
          } else if (route.name === 'CRM') {
            iconName = isFocused ? 'wallet' : 'wallet-outline';
            label = 'CRM';
          } else if (route.name === 'Inventory') {
            iconName = isFocused ? 'cube' : 'cube-outline';
            label = 'Inventory';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
            label = 'Profile';
          }

          const iconColor = isFocused ? '#0F172A' : '#94A3B8';
          const textColor = isFocused ? '#0F172A' : '#94A3B8';

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons name={iconName} size={22} color={iconColor} />
              <Text
                style={[
                  styles.tabLabel,
                  { color: textColor },
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom:-13,
    backgroundColor: 'transparent',
  },
  tabBarInner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: 68,
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    // Elegant floating shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  tabLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerButton: {
    position: 'absolute',
    top: -44,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#05DF8E',
    justifyContent: 'center',
    alignItems: 'center',
    // Mint green luminous glow shadow
    
    
  },
});

export default CustomTabBar;
