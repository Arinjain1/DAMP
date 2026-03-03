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
            <Text style={styles.emptyTitle}>You&apos;re all caught up ✨</Text>
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
import styles from '../src/styles/notificationStyles';
