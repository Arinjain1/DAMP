import React from 'react';
import {
  View,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const bgDesign = require('../../assets/Group (2).png');
const illustration = require('../../assets/ChatGPT Image Sep 29, 2026, 08_05_56 PM 1.png');

/**
 * CardLayout provides:
 * 1. Fixed Header area with background color #2C5849, the wavy background design (Group (2).png),
 *    and the central illustration (ChatGPT Image...).
 * 2. Bottom Card sheet in pure white with large curved top corners (borderTopRadius: 36).
 * 3. The card content (children) changes dynamically based on current auth step.
 */
const CardLayout = ({ children }) => {
  return (
    <View style={styles.screenContainer}>
      {/* Top Fixed Header with #2C5849 Background */}
      <View style={styles.headerSection}>
        <ImageBackground
          source={bgDesign}
          style={styles.headerBgPattern}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.illustrationWrapper}>
              <Image
                source={illustration}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>

      {/* Bottom White Card Layout */}
      <View style={styles.cardContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.cardScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#2C5849',
  },
  headerSection: {
    height: SCREEN_HEIGHT * 0.38,
    backgroundColor: '#2C5849',
    width: '100%',
    overflow: 'hidden',
  },
  headerBgPattern: {
    flex: 1,
    width: '78%',
    height: '95%',
    justifyContent: 'center',
    alignItems:'flex-end',
    left:153
    
  },
  headerSafeArea: {
    flex: 1,
    width: '110%',
    
    justifyContent: 'center',
    alignItems: 'center',
    
    right:90,
    top:29
  },
  illustrationWrapper: {
    width: '100%',
    height: '120%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '120%',
  },
  cardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
});

export default CardLayout;
