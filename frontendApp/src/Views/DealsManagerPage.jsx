import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Platform,
  StatusBar,
  StyleSheet
} from 'react-native';
import { Briefcase, ChevronRight, X } from 'lucide-react-native';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const DealsManagerPage = ({ deals, properties, customers, onOpenDeal, onBack }) => {
   const [filter, setFilter] = useState('All');

   // Sort and Filter Logic
   const sortedDeals = [...deals].sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt));
   const filteredDeals = filter === 'All' ? sortedDeals : sortedDeals.filter(d => d.stage === filter);

   const filters = ['All', 'New', 'Contacted', 'Site Visit', 'Interested', 'In-Process', 'Completed'];

   // Calculate stats
   const stats = {
     total: deals.length,
     active: deals.filter(d => d.stage !== 'Completed').length,
     completed: deals.filter(d => d.stage === 'Completed').length,
   };

   return (
      <View style={styles.container}>
         <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

         {/* ===== HEADER ===== */}
         <View style={styles.header}>
            {/* Title */}
            <View style={styles.headerContent}>
               <Text style={styles.headerTitle}>Deals Manager</Text>
               <Text style={styles.headerSubtitle}>Track your property pipeline</Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity 
               onPress={onBack}
               style={styles.closeButton}
            >
               <X size={24} color="#6b7280" />
            </TouchableOpacity>
         </View>

         <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
         >
            {/* ===== MAIN CONTENT ===== */}
            <View style={styles.mainBody}>
               
               {/* Filter Chips */}
               <View style={styles.filterSection}>
                  
                  <ScrollView 
                     horizontal 
                     showsHorizontalScrollIndicator={false}
                     contentContainerStyle={styles.filterScroll}
                  >
                     {filters.map(f => (
                        <TouchableOpacity 
                           key={f} 
                           onPress={() => setFilter(f)} 
                           style={[
                              styles.filterChip,
                              filter === f && styles.filterChipActive
                           ]}
                        >
                           <Text style={[
                              styles.filterChipText,
                              filter === f && styles.filterChipTextActive
                           ]}>
                              {f}
                           </Text>
                        </TouchableOpacity>
                     ))}
                  </ScrollView>
               </View>

               {/* Deals List */}
               {filteredDeals.length > 0 ? (
                  <View style={styles.dealsContainer}>
                     {filteredDeals.map(deal => {
                        const prop = properties.find(p => p.id === deal.propertyId);
                        const cust = customers.find(c => c.id === deal.customerId);
                        
                        return (
                           <TouchableOpacity 
                              key={deal.id} 
                              onPress={() => onOpenDeal(deal)} 
                              activeOpacity={0.9}
                              style={styles.dealCard}
                           >
                              {/* Card Top: Property Info & Status */}
                              <View style={styles.dealCardTop}>
                                 <View style={styles.dealInfoRow}>
                                    <Image 
                                       source={{ uri: prop?.image || 'https://via.placeholder.com/100' }} 
                                       style={styles.dealImage}
                                    />
                                    <View style={styles.dealTextInfo}>
                                       <Text style={styles.dealTitle} numberOfLines={1}>
                                          {prop?.title || 'Unknown Property'}
                                       </Text>
                                       <Text style={styles.dealLocation} numberOfLines={1}>
                                          {prop?.location || 'Location N/A'}
                                       </Text>
                                    </View>
                                 </View>
                                 
                                 {/* Status Badge */}
                                 <View style={[
                                    styles.stageBadge,
                                    deal.stage === 'Completed' && styles.stageBadgeCompleted,
                                 ]}>
                                    <Text style={[
                                       styles.stageText,
                                       deal.stage === 'Completed' && styles.stageTextCompleted,
                                    ]}>
                                       {deal.stage}
                                    </Text>
                                 </View>
                              </View>

                              {/* Card Middle: Customer & Price */}
                              <View style={styles.dealCardMiddle}>
                                 <View style={styles.customerRow}>
                                    <View style={styles.customerAvatar}>
                                       <Text style={styles.customerInitial}>
                                          {cust?.name?.charAt(0) || '?'}
                                       </Text>
                                    </View>
                                    <Text style={styles.customerName}>{cust?.name || 'Unknown Client'}</Text>
                                 </View>
                                 <Text style={styles.dealPrice}>{formatCurrency(prop?.price)}</Text>
                              </View>

                              {/* Card Bottom: Footer */}
                              <View style={styles.dealCardBottom}>
                                 <Text style={styles.dealDate}>
                                    Updated: {new Date(deal.startedAt).toLocaleDateString()}
                                 </Text>
                                 <View style={styles.manageButton}>
                                    <Text style={styles.manageText}>Manage</Text>
                                    <ChevronRight size={12} color="#8B7CF6"/>
                                 </View>
                              </View>
                           </TouchableOpacity>
                        )
                     })}
                  </View>
               ) : (
                  /* Empty State */
                  <View style={styles.emptyState}>
                     <View style={styles.emptyIconContainer}>
                        <Briefcase size={32} color="#d1d5db"/>
                     </View>
                     <Text style={styles.emptyTitle}>No Deals Found</Text>
                     <Text style={styles.emptySubtitle}>
                        Start a deal from Customers or Properties tab.
                     </Text>
                  </View>
               )}
            </View>
         </ScrollView>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#ffffff',
   },
   scrollContent: {
      paddingBottom: 120,
   },

   // Header
   header: {
      backgroundColor: 'white',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
      paddingHorizontal: 20,
      paddingBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
   },
   closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#f9fafb',
      alignItems: 'center',
      justifyContent: 'center',
   },
   headerContent: {
      flex: 1,
   },
   headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#3E3E3E',
      letterSpacing: -0.5,
   },
   headerSubtitle: {
      fontSize: 14,
      color: '#9ca3af',
      fontWeight: '500',
      marginTop: 4,
   },

   // Main Body
   mainBody: {
      paddingHorizontal: 20,
   },

   // Filter Section
   filterSection: {
      marginTop: 2,
      marginBottom: 28,
   },
   sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
   },
   filterScroll: {
      gap: 8,
      paddingRight: 20,
   },
   filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: '#e5e7eb',
   },
   filterChipActive: {
      backgroundColor: '#8B7CF6',
      borderColor: '#8B7CF6',
   },
   filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6b7280',
   },
   filterChipTextActive: {
      color: 'white',
   },

   // Deals Container
   dealsContainer: {
      gap: 12,
   },

   // Deal Card
   dealCard: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#e5e7eb',
   },
   dealCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
   },
   dealInfoRow: {
      flexDirection: 'row',
      gap: 12,
      flex: 1,
   },
   dealImage: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
   },
   dealTextInfo: {
      flex: 1,
      justifyContent: 'center',
   },
   dealTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
   },
   dealLocation: {
      fontSize: 12,
      color: '#6b7280',
   },
   stageBadge: {
      backgroundColor: '#faf5ff',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
   },
   stageBadgeCompleted: {
      backgroundColor: '#d1fae5',
   },
   stageText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#8B7CF6',
   },
   stageTextCompleted: {
      color: '#059669',
   },

   // Card Middle
   dealCardMiddle: {
      backgroundColor: '#f9fafb',
      padding: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
   },
   customerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
   },
   customerAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#faf5ff',
      alignItems: 'center',
      justifyContent: 'center',
   },
   customerInitial: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#8B7CF6',
   },
   customerName: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#374151',
   },
   dealPrice: {
      fontSize: 14,
      fontWeight: '900',
      color: '#111827',
   },

   // Card Bottom
   dealCardBottom: {
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
   },
   dealDate: {
      fontSize: 11,
      fontWeight: '600',
      color: '#9ca3af',
   },
   manageButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
   },
   manageText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#8B7CF6',
   },

   // Empty State
   emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
   },
   emptyIconContainer: {
      backgroundColor: '#f3f4f6',
      height: 80,
      width: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
   },
   emptyTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 6,
   },
   emptySubtitle: {
      fontSize: 13,
      color: '#6b7280',
      textAlign: 'center',
      paddingHorizontal: 40,
   },
});

export default DealsManagerPage;