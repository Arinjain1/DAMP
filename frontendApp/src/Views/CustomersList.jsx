import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Phone, Search } from 'lucide-react-native';
import { useState } from 'react';
import {
    Dimensions, Linking, Platform, ScrollView, StatusBar, StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// Helper for random background colors for avatars
const getRandomColor = (char) => {
  const colors = ['#e0f2fe', '#fce7f3', '#dcfce7', '#fef3c7', '#f3e8ff'];
  const textColors = ['#0284c7', '#db2777', '#16a34a', '#d97706', '#9333ea'];
  const index = char.charCodeAt(0) % colors.length;
  return { bg: colors[index], text: textColors[index] };
};

const CustomersList = ({ customers = [], onSelect }) => {
  const [query, setQuery] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  // Call handler
  const handleCall = (phone, customerName) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      console.log(`No phone number available for ${customerName}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* 🔮 GRADIENT HEADER */}
      <LinearGradient
        colors={['#BFB7FD', '#E5E1FF', '#f9fafb']}
        locations={[0, 0.7, 1]}
        style={styles.headerContainer}
      >
        {/* Title */}
        <Text style={styles.headerTitle}>Leads</Text>

        {/* 🔍 CLEAN & SLIM SEARCH BAR */}
        <View style={styles.searchBar}>
          <Search size={16} color="#6b7280" />
          <TextInput
            placeholder="Search leads..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      {/* 📜 GRID LIST */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <Search size={40} color="#e5e7eb" />
            <Text style={styles.emptyText}>No leads found</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredCustomers.map((customer) => {
              const colorTheme = getRandomColor(customer.name.charAt(0));
              
              return (
                <TouchableOpacity
                  key={customer.id}
                  onPress={() => onSelect(customer)}
                  activeOpacity={0.8}
                  style={styles.card}
                >
                  {/* Header: Status Badge */}
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: customer.status === 'Hot' ? '#fee2e2' : '#f3f4f6' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: customer.status === 'Hot' ? '#ef4444' : '#4b5563' }
                      ]}>
                        {customer.status || 'New'}
                      </Text>
                    </View>
                  </View>

                  {/* Avatar & Info */}
                  <View style={styles.cardBody}>
                    <View style={[styles.avatar, { backgroundColor: colorTheme.bg }]}>
                      <Text style={[styles.avatarText, { color: colorTheme.text }]}>
                        {customer.name.charAt(0)}
                      </Text>
                    </View>
                    
                    <Text style={styles.nameText} numberOfLines={1}>
                      {customer.name}
                    </Text>
                    
                    <Text style={styles.budgetText}>
                      {formatCurrency(customer.budget)}
                    </Text>
                  </View>

                  {/* Footer Actions */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent card selection
                        handleCall(customer.phone, customer.name);
                      }}
                      activeOpacity={0.7}
                    >
                       <Phone size={14} color="#22c55e" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity 
                      style={styles.iconButton}
                      onPress={() => onSelect(customer)}
                      activeOpacity={0.7}
                    >
                       <ChevronRight size={16} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  // Header
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 64,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#3E3E3E',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12, // Gap between rows
  },
  
  // Card Design
  card: {
    width: (SCREEN_WIDTH - 52) / 2, // 2 Columns with padding calculation
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 4,
  },
  cardHeader: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardBody: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
});

export default CustomersList;