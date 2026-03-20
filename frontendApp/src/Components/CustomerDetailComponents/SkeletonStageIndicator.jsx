import { View, StyleSheet } from 'react-native';

const SkeletonStageIndicator = () => (
  <View style={styles.stageContainer}>
    <View style={styles.skeletonRow}>
      {[...Array(5)].map((_, idx) => (
        <View key={idx} style={styles.skeletonCircle} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  stageContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
  },
  skeletonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },
});

export default SkeletonStageIndicator;
