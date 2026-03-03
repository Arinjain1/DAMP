import React, { useState } from 'react';
import {
   View,
   Text,
   ScrollView,
   TouchableOpacity,
   Image,
   Platform,
   StatusBar,
   RefreshControl
} from 'react-native';
import styles from '../styles/dealsManagerStyles';
import { useSelector } from 'react-redux';
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
   const sortedDeals = [...deals].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
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
                                    <ChevronRight size={12} color="#8B7CF6" />
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
                        <Briefcase size={32} color="#d1d5db" />
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

export default DealsManagerPage;