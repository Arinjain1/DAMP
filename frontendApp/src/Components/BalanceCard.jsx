import { View, Text, ImageBackground } from 'react-native';
import styles from '../styles/balanceCardStyles';

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
