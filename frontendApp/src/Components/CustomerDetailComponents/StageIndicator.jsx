import { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SkeletonStageIndicator from './SkeletonStageIndicator';
import {
  Check,
  Phone,
  MapPin,
  ThumbsUp,
  RefreshCw,
  Handshake,
  BadgeIndianRupee,
  FileText,
  CircleCheckBig,
} from 'lucide-react-native';

const SALES_STAGES = [
  { id: 'New', label: 'New', icon: 'Check' },
  { id: 'Contacted', label: 'Contacted', icon: 'Phone' },
  { id: 'Site Visit', label: 'Site Visit', icon: 'MapPin' },
  { id: 'Interested', label: 'Interested', icon: 'ThumbsUp' },
  { id: 'In-Process', label: 'In-Process', icon: 'RefreshCw' },
  { id: 'Negotiation', label: 'Negotiation', icon: 'Handshake' },
  { id: 'Token', label: 'Token', icon: 'BadgeIndianRupee' },
  { id: 'Settlement', label: 'Settlement', icon: 'FileText' },
  { id: 'Agreement', label: 'Agreement', icon: 'FileText' },
  { id: 'Completed', label: 'Completed', icon: 'CircleCheckBig' },
];

function getStageIcon({ iconName, size, color }) {
  const icons = {
    Check,
    Phone,
    ThumbsUp,
    MapPin,
    RefreshCw,
    Handshake,
    BadgeIndianRupee,
    FileText,
    CircleCheckBig,
  };
  const IconComponent = icons[iconName] || Check;
  return <IconComponent size={size} color={color} />;
}

const StageIndicator = memo(({ currentStage, loading }) => {
  if (loading) return <SkeletonStageIndicator />;
  const currentIndex = SALES_STAGES.findIndex(s => s.id === currentStage);
  return (
    <View style={styles.stageContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stageScrollContent}
      >
        {SALES_STAGES.map((stage, index) => {
          const isCurrent = currentIndex === index;
          const isCompleted = currentIndex > index;
          let circleStyle, iconColor;
          if (isCompleted) {
            circleStyle = styles.stageCircleCompleted;
            iconColor = '#ffffff';
          } else if (isCurrent) {
            circleStyle = styles.stageCircleCurrent;
            iconColor = '#ffffff';
          } else {
            circleStyle = styles.stageCircleFuture;
            iconColor = '#d1d5db';
          }
          return (
            <View key={stage.id} style={styles.stageItem}>
              <View style={[styles.stageCircle, circleStyle]}>
                {getStageIcon({ iconName: stage.icon, size: 20, color: iconColor })}
              </View>
              <Text style={[styles.stageLabel, isCurrent && styles.stageLabelActive]}>
                {stage.label}
              </Text>
              {isCurrent && <View style={styles.stageUnderline} />}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
});

StageIndicator.displayName = 'StageIndicator';

const styles = StyleSheet.create({
  stageContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stageScrollContent: {
    paddingHorizontal: 8,
    gap: 24,
  },
  stageItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  stageCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stageCircleCompleted: { backgroundColor: '#86efac' },
  stageCircleCurrent: { backgroundColor: '#1f2937' },
  stageCircleFuture: { backgroundColor: '#f3f4f6' },
  stageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textAlign: 'center',
  },
  stageLabelActive: { color: '#1f2937', fontWeight: '700' },
  stageUnderline: {
    width: 32,
    height: 3,
    backgroundColor: '#1f2937',
    borderRadius: 2,
    marginTop: 4,
  },
});

export default StageIndicator;
export { SALES_STAGES };
