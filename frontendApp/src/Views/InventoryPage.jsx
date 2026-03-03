import React, { useMemo, useState } from 'react';
import {
   View,
   Text,
   ScrollView,
   TouchableOpacity,
   ImageBackground,
   Image
} from 'react-native';
import {
   Filter,
   Edit3,
   MapPin,
   Briefcase,
   Layout,
   Building,
   Search
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';



const PROPERTY_STRUCTURE = {
   Residential: { types: ['Apartment/Flats', 'Villa', 'Plot', 'Duplex'] },
   Commercial: { types: ['Office Space', 'Shop', 'Showroom', 'Warehouse'] },
   Agriculture: { types: ['Farm Land', 'Farm House'] }
};

const formatCurrency = (amount) => {
   const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
   return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
   }).format(numAmount || 0);
};

const InventoryPage = ({ properties = [], onSelect, onEdit }) => {
   // Local state for UI filters
   const [listingFilter, setListingFilter] = useState('Sell');
   const [activeCategory, setActiveCategory] = useState('Residential');
   const [activeType, setActiveType] = useState('All');

   const filteredProperties = useMemo(() => {
      if (!Array.isArray(properties)) return [];
      return properties.filter(p => {
         // Ensure we handle missing fields gracefully
         const pType = p.listingType || 'Sell';

         const matchListing = pType === listingFilter;
         const matchCategory = p.category === activeCategory;
         const matchType = activeType === 'All' || p.type === activeType;

         return matchListing && matchCategory && matchType;
      });
   }, [properties, listingFilter, activeCategory, activeType]);

   return (
      <View className="flex-1 bg-gray-50">

         {/* --- HEADER & FILTERS --- */}
         {/* Absolute positioned header ensures it stays on top while scrolling */}
         <View className="absolute top-0 left-0 right-0 z-30 bg-white pt-14 px-5 border-b border-gray-100 shadow-sm">

            {/* Title & Sell/Rent Switch */}
            <View className="flex-row justify-between items-end mb-6">
               <View>
                  <Text className="text-3xl font-black text-gray-900 tracking-tight">Inventory</Text>
                  <Text className="text-sm text-gray-400 font-medium mt-1">Manage your portfolio</Text>
               </View>

               <View className="bg-gray-100 p-1 rounded-lg flex-row items-center">
                  {['Sell', 'Rent'].map(f => (
                     <TouchableOpacity
                        key={f}
                        onPress={() => setListingFilter(f)}
                        className={`px-4 py-1.5 rounded-md ${listingFilter === f ? 'bg-white shadow-sm' : ''}`}
                     >
                        <Text className={`text-xs font-bold ${listingFilter === f ? 'text-gray-900' : 'text-gray-500'}`}>
                           {f}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </View>

            {/* Categories (Residential, Commercial...) */}
            <View className="border-b border-gray-100 pb-1 mb-4">
               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {Object.keys(PROPERTY_STRUCTURE).map(cat => {
                     const isActive = activeCategory === cat;
                     return (
                        <TouchableOpacity
                           key={cat}
                           onPress={() => {
                              setActiveCategory(cat);
                              setActiveType('All');
                           }}
                           className="pb-3 mr-6 relative"
                        >
                           <Text className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                              {cat}
                           </Text>
                           {isActive && <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />}
                        </TouchableOpacity>
                     );
                  })}
               </ScrollView>
            </View>

            {/* Sub-Types (Apartment, Villa...) */}
            <View className="pb-4">
               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                     onPress={() => setActiveType('All')}
                     className={`px-4 py-1.5 rounded-full border mr-2 ${activeType === 'All' ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                  >
                     <Text className={`text-xs font-bold ${activeType === 'All' ? 'text-white' : 'text-gray-500'}`}>All</Text>
                  </TouchableOpacity>

                  {PROPERTY_STRUCTURE[activeCategory]?.types.map(t => (
                     <TouchableOpacity
                        key={t}
                        onPress={() => setActiveType(t)}
                        className={`px-4 py-1.5 rounded-full border mr-2 ${activeType === t ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
                     >
                        <Text className={`text-xs font-bold ${activeType === t ? 'text-white' : 'text-gray-500'}`}>{t}</Text>
                     </TouchableOpacity>
                  ))}
               </ScrollView>
            </View>
         </View>

         {/* --- SCROLLABLE CONTENT --- */}
         <ScrollView
            className="flex-1 px-4"
            // Large paddingTop pushes content below the absolute header
            // Large paddingBottom ensures the last card isn't hidden behind the FAB
            contentContainerStyle={{ paddingTop: 280, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
         >
            <View className="flex-row justify-between items-center px-1 mb-4">
               <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {filteredProperties.length} Properties found
               </Text>
               <TouchableOpacity className="flex-row items-center gap-1">
                  <Filter size={14} color="#111827" />
                  <Text className="text-xs font-bold text-gray-900">Filters</Text>
               </TouchableOpacity>
            </View>

            {filteredProperties.length > 0 ? (
               <View className="gap-5">
                  {filteredProperties.map(p => (
                     p && p.id ? (
                        <TouchableOpacity
                           key={p.id}
                           onPress={() => onSelect(p)}
                           activeOpacity={0.9}
                           className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                           {/* Image Section */}
                           <View className="h-56 relative">
                              <ImageBackground
                                 source={{ uri: p.image || 'https://via.placeholder.com/400x300' }}
                                 className="w-full h-full"
                                 resizeMode="cover"
                              >
                                 <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' }}
                                 />

                                 {/* Edit Button */}
                                 <TouchableOpacity
                                    onPress={(e) => {
                                       e.stopPropagation();
                                       onEdit(p, 'Property');
                                    }}
                                    className="absolute top-3 right-3 bg-black/20 backdrop-blur-md p-2 rounded-full"
                                 >
                                    <Edit3 size={16} color="white" />
                                 </TouchableOpacity>

                                 {/* Price Tag */}
                                 <View className="absolute bottom-3 left-4">
                                    <Text className="text-2xl font-black text-white shadow-sm">
                                       {formatCurrency(p.price)}
                                    </Text>
                                    {listingFilter === 'Rent' && (
                                       <Text className="text-xs text-white opacity-90 font-medium">/ month</Text>
                                    )}
                                 </View>
                              </ImageBackground>
                           </View>

                           {/* Details Section */}
                           <View className="p-4">
                              <Text className="text-[10px] font-bold text-blue-600 bg-blue-50 self-start px-2 py-1 rounded-md uppercase tracking-wider mb-2">
                                 {p.category}
                              </Text>
                              <Text className="font-bold text-gray-900 text-lg mb-1 leading-tight" numberOfLines={1}>
                                 {p.title}
                              </Text>

                              <View className="flex-row items-center mb-4">
                                 <MapPin size={12} color="#9ca3af" />
                                 <Text className="text-xs text-gray-500 font-medium ml-1" numberOfLines={1}>
                                    {p.location}
                                 </Text>
                              </View>

                              {/* Features Grid */}
                              <View className="flex-row gap-4 pt-3 border-t border-gray-50">
                                 <View className="flex-row items-center gap-1.5">
                                    <Briefcase size={14} color="#6b7280" />
                                    <Text className="text-xs font-bold text-gray-700">{p.type}</Text>
                                 </View>
                                 <View className="flex-row items-center gap-1.5">
                                    <Layout size={14} color="#6b7280" />
                                    <Text className="text-xs font-bold text-gray-700">{p.size}</Text>
                                 </View>
                                 {p.bhk && (
                                    <View className="flex-row items-center gap-1.5">
                                       <Building size={14} color="#6b7280" />
                                       <Text className="text-xs font-bold text-gray-700">{p.bhk}</Text>
                                    </View>
                                 )}
                              </View>
                           </View>
                        </TouchableOpacity>
                     ) : null
                  ))}
               </View>
            ) : (
               <View className="items-center justify-center py-20 opacity-50">
                  <Search size={48} color="#9ca3af" />
                  <Text className="text-gray-900 font-bold text-lg mt-4">No Properties Found</Text>
                  <Text className="text-gray-500 text-sm mt-1 text-center px-10">
                     We couldn't find any properties matching your current filters.
                  </Text>
                  <TouchableOpacity
                     onPress={() => {
                        setActiveCategory('Residential');
                        setActiveType('All');
                     }}
                     className="mt-6 bg-gray-900 px-6 py-3 rounded-lg"
                  >
                     <Text className="text-white font-bold text-sm">Clear Filters</Text>
                  </TouchableOpacity>
               </View>
            )}
         </ScrollView>
      </View>
   );
};

export default InventoryPage;