import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { collabAPI } from '../src/config/api';
import { setSelectedCustomer } from '../src/store/slices/customersSlice';
import { setSelectedProperty } from '../src/store/slices/propertiesSlice';
import { showToast } from '../src/utils/toast';

export default function MatchOpportunitiesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redux lists for resolving local customer/property entities
  const { properties } = useSelector((state) => state.properties);
  const { customers } = useSelector((state) => state.customers);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await collabAPI.getMatchOpportunities();
      if (res.data.success) {
        setOpportunities(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching match opportunities:', err);
      showToast.error('Failed to load match opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleOpportunityPress = (item) => {
    const isProp = item.tag === 'MATCHING PROPERTY';
    const localId = item.localId;
    const matchedId = item.matchedId;

    if (isProp) {
      const cust = customers.find((c) => c.id === localId);
      if (cust) {
        dispatch(setSelectedCustomer(cust));
        router.push(`/find-properties?initialStep=detail&matchedId=${matchedId}`);
      } else {
        showToast.error('Associated local client not found');
      }
    } else {
      const prop = properties.find((p) => p.id === localId);
      if (prop) {
        dispatch(setSelectedProperty(prop));
        router.push(`/find-clients?initialStep=detail&matchedId=${matchedId}`);
      } else {
        showToast.error('Associated local property not found');
      }
    }
  };

  // Map backend opportunities exactly like Dashboard.jsx does
  const mappedOpportunities = React.useMemo(() => {
    return opportunities.map(item => {
      const isProp = item.tag === 'MATCHING PROPERTY';
      const formattedPrice = isProp 
        ? (item.price_min >= 10000000 
            ? `₹${(item.price_min / 10000000).toFixed(1)} Cr` 
            : `₹${(item.price_min / 100000).toFixed(0)} L`)
        : (item.price_min >= 10000000 
            ? `₹${(item.price_min / 10000000).toFixed(1)}-${(item.price_max / 10000000).toFixed(1)} Cr` 
            : `₹${(item.price_min / 100000).toFixed(0)}-${(item.price_max / 100000).toFixed(0)} L`);

      const specText = isProp 
        ? `${item.configuration || '2 BHK'} Flat • ${item.loc_text || 'Mumbai'}`
        : `Requires ${item.configuration || '2 BHK'} • ${item.loc_text || 'Mumbai'}`;

      const colorBg = isProp ? '#EDE9FE' : '#DBEAFE';
      const colorBorder = isProp ? '#DDD6FE' : '#BFDBFE';
      const colorText = isProp ? '#6D28D9' : '#1D4ED8';
      const btnStyle = isProp ? styles.matchCardBtnPurple : styles.matchCardBtnDark;

      return {
        id: item.property_id || item.client_id,
        tag: item.tag,
        compat: Math.round(item.compatibility || 50),
        name: item.broker_name || 'Network Broker',
        price: formattedPrice,
        spec: specText,
        colorBg,
        colorBorder,
        colorText,
        btnStyle,
        localId: isProp ? item.client_id : item.property_id,
        matchedId: isProp ? item.property_id : item.client_id
      };
    });
  }, [opportunities]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Match Opportunities</Text>
          <Text style={styles.headerSubtitle}>Explore high-compatibility matches across the broker network</Text>
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#635BFF" />
          <Text style={styles.loadingText}>Finding opportunities for you...</Text>
        </View>
      ) : mappedOpportunities.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconBg}>
            <Sparkles size={36} color="#9333ea" />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>No new match opportunities found in your area at the moment.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {mappedOpportunities.map((item) => (
            <View key={item.id} style={styles.matchOpportunityCard}>
              <View style={[styles.matchCardTag, { backgroundColor: item.colorBg, borderColor: item.colorBorder, marginBottom: 6 }]}>
                <Text style={[styles.matchCardTagText, { color: item.colorText }]}>{item.tag} • {item.compat}%</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={styles.matchCardTitle}>{item.name}</Text>
                <Text style={[styles.matchCardTitle, { color: '#635BFF' }]}>{item.price}</Text>
              </View>
              <Text style={[styles.matchCardSubtitle, { marginBottom: 10 }]}>{item.spec}</Text>
              <TouchableOpacity 
                style={item.btnStyle} 
                onPress={() => handleOpportunityPress(item)}
              >
                <Text style={styles.matchCardBtnTextLight}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 15 : 45,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#6b7280',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#4b5563',
    marginTop: 12,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#faf5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContent: {
    padding: 16,
  },
  // Match Opportunities styling matching home page exactly
  matchOpportunityCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 3,
  },
  matchCardTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  matchCardTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  matchCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  matchCardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  matchCardBtnDark: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  matchCardBtnPurple: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  matchCardBtnTextLight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
