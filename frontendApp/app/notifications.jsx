import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CheckCheck, Bell, Clock } from 'lucide-react-native';

import { markAllAsRead } from '../src/store/slices/notificationsSlice';

export default function Notifications() {
  const dispatch = useDispatch();
  const router = useRouter();

  // 🔥 Redux notifications
  const { notifications } = useSelector(state => state.notifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* 🔮 PURPLE GRADIENT HEADER */}
      <LinearGradient
        colors={['#A5B4FC', '#DDD6FE', '#F9FAFB']}
        locations={[0, 0.65, 1]}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={22} color="#374151" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => dispatch(markAllAsRead())}
            disabled={unreadCount === 0}
            style={[
              styles.iconBtn,
              unreadCount === 0 && { opacity: 0.4 },
            ]}
          >
            <CheckCheck
              size={22}
              color={unreadCount > 0 ? '#4f46e5' : '#9ca3af'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 📜 NOTIFICATIONS LIST */}
      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Bell size={42} color="#818cf8" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up ✨</Text>
            <Text style={styles.emptySubtitle}>
              No new notifications right now
            </Text>
          </View>
        ) : (
          notifications.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.75}
              style={[styles.card, !item.read && styles.unreadCard]}
            >
              {/* 🔵 LEFT INDICATOR */}
              {!item.read && <View style={styles.leftIndicator} />}

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    {!item.read && <View style={styles.unreadDot} />}
                    <Text
                      style={[
                        styles.cardTitle,
                        !item.read && styles.unreadTitle,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>

                  {item.time && (
                    <View style={styles.time}>
                      <Clock size={12} color="#9ca3af" />
                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardMsg}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  header: {
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight ?? 24) + 18
        : 68,
    paddingHorizontal: 20,
    paddingBottom: 28,
   
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1f2937',
  },

  badge: {
    backgroundColor: '#4f46e5',
    borderRadius: 999,
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  iconBtn: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden', // 🔥 IMPORTANT for indicator
  },

  unreadCard: {
    backgroundColor: '#eef2ff',
    borderColor: '#c7d2fe',
  },

  leftIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#6366f1',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  cardContent: {
    padding: 16,
    paddingLeft: 20, // indicator spacing
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },

  unreadTitle: {
    color: '#111827',
  },

  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  timeText: {
    fontSize: 11,
    color: '#9ca3af',
  },

  cardMsg: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

  empty: {
    alignItems: 'center',
    marginTop: 120,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 15,
    color: '#9ca3af',
  },
});
