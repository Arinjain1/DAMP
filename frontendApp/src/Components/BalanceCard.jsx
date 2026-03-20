import { View, Text, StyleSheet, ImageBackground } from 'react-native';

export default function BalanceCard({ amount, label = 'Total Amount', remaining }) {
  // Use remaining if provided, otherwise use amount
  const displayRemaining = remaining !== undefined ? remaining : amount;
  
  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={require('../../assets/images/Balance (1).png')}
        style={styles.cardBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.cardAmount}>₹{amount?.toLocaleString('en-IN') || '25,000.40'}</Text>
          <Text style={styles.remainingText}>Remaining  -- ₹{displayRemaining?.toLocaleString('en-IN') || '400'}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    borderWidth:1,
    borderColor:'#B4B4B4',
    marginBottom: 16,
  },
  cardBackground: {
    padding: 20,
    minHeight: 145,
    justifyContent: 'flex-start',
    bottom:1,
  },
  imageStyle: {
    borderRadius: 16,
    height:152,
  },
  cardContent: {
    zIndex: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 1,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 22,
  },
  remainingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
