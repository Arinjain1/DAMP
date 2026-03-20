import { ChevronDown, ChevronRight, ChevronUp, CirclePlus, MessageCircle, Phone, Search, Edit2 } from 'lucide-react-native';
import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  ImageBackground, Linking, Platform, FlatList, ScrollView, StatusBar, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Skeleton from '../Components/Skeleton';

// --- CONSTANTS & HELPERS ---
const SALES_STAGES = [
  { id: 'New', label: 'New', isFirst: true },
  { id: 'Contacted', label: 'Contacted', isFirst: false },
  { id: 'Site Visit', label: 'Site Visit', isFirst: false },
  { id: 'Interested', label: 'Interested', isFirst: false },
  { id: 'In-Process', label: 'In-Process', isFirst: false },
  { id: 'Negotiation', label: 'Negotiation', isFirst: false },
  { id: 'Token', label: 'Token', isFirst: false },
  { id: 'Settlement', label: 'Settlement', isFirst: false },
  { id: 'Agreement', label: 'Agreement', isFirst: false },
  { id: 'Completed', label: 'Completed', isFirst: false },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const getRandomColor = (char) => {
  if (!char) return { bg: '#e0f2fe', text: '#0284c7' };
  const colors = ['#e0f2fe', '#fce7f3', '#dcfce7', '#fef3c7', '#f3e8ff'];
  const textColors = ['#0284c7', '#db2777', '#16a34a', '#d97706', '#9333ea'];
  const index = char.charCodeAt(0) % colors.length;
  return { bg: colors[index], text: textColors[index] };
};

const isBeyondInterested = (stage) => {
  const dealStages = ['In-Process', 'Negotiation', 'Token', 'Settlement', 'Agreement', 'Completed'];
  return dealStages.includes(stage);
};

const getMockTask = (customerId) => {
  const tasks = {
    'c1': { title: 'Schedule site visit', time: 'Today 2:30 PM', type: 'Site Visit' },
    'c2': { title: 'Token payment follow-up', time: 'Tomorrow 11:00 AM', type: 'Follow-up' },
    'c3': { title: 'Initial contact call', time: 'Today 4:00 PM', type: 'Call' },
    'c4': { title: 'Document handover', time: 'Completed', type: 'Documentation' },
  };
  return tasks[customerId] || { title: 'Follow up required', time: 'Pending', type: 'General' };
};

// --- STAGE INDICATOR COMPONENT ---
const StageIndicator = memo(({ currentStage }) => {
  const currentIndex = SALES_STAGES.findIndex(s => s.id === currentStage);
  const lastStageIndex = SALES_STAGES.length - 1;

  const renderStageItem = useCallback(({ item: stage, index }) => {
    const isCompleted = currentIndex > index;
    const isLastStage = index === lastStageIndex;

    let backgroundImage;
    if (stage.isFirst) {
      backgroundImage = require('../../assets/images/Front Bg (2).png');
    } else if (isLastStage) {
      backgroundImage = (isCompleted || currentIndex === index) 
        ? require('../../assets/images/Done last bg.png') 
        : require('../../assets/images/Last Bg.png');
    } else if (isCompleted || currentIndex === index) {
      backgroundImage = require('../../assets/images/Done middle Bg.png');
    } else {
      backgroundImage = require('../../assets/images/Middle Bg.png');
    }

    return (
      <View className="mr-0 h-8">
        <ImageBackground
          source={backgroundImage}
          className={`min-w-[100px] justify-center items-center px-1.5 ${stage.isFirst || isLastStage ? 'h-[36px] pb-1' : 'h-10'}`}
          resizeMode="stretch"
        >
          <View className="justify-center items-center">
            <Text className={`text-[11px] font-medium text-center ${isCompleted || currentIndex === index ? 'text-[#7B6FDA]' : 'text-gray-600'}`}>
              {stage.label}
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  }, [currentIndex, lastStageIndex]);

  return (
    <View className="h-[46px]">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 2, alignItems: 'center', paddingRight: 20 }}
        data={SALES_STAGES}
        keyExtractor={(item) => item.id}
        renderItem={renderStageItem}
      />
    </View>
  );
});
StageIndicator.displayName = 'StageIndicator';

// --- CUSTOMER CARD COMPONENT ---
const CustomerCard = memo(({ 
  customer, isExpanded, onToggleExpand, onEditCustomer, onOpenDeal, onSelect, handleCall 
}) => {
  const colorTheme = useMemo(() => getRandomColor(customer.name?.charAt(0)), [customer.name]);
  const currentTask = useMemo(() => getMockTask(customer.id), [customer.id]);

  const handlePressCard = useCallback(() => {
    onToggleExpand(customer.id);
  }, [onToggleExpand, customer.id]);

  const handleEditPress = useCallback((e) => {
    e.stopPropagation();
    if (onEditCustomer) onEditCustomer(customer);
  }, [onEditCustomer, customer]);

  const handleDetailsPress = useCallback(() => {
    if (isBeyondInterested(customer.stage) && onOpenDeal) {
      onOpenDeal(customer);
    } else {
      if (onSelect) onSelect(customer);
    }
  }, [customer, onOpenDeal, onSelect]);

  const handleWhatsApp = useCallback(() => {
    Linking.openURL(`https://wa.me/${customer.phone?.replace(/[^0-9]/g, '')}`);
  }, [customer.phone]);

  const handleCallPress = useCallback(() => {
    handleCall(customer.phone);
  }, [handleCall, customer.phone]);

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-3">
      {/* Header Info */}
      <TouchableOpacity 
        className="flex-row items-center gap-3 mb-1.5"
        onPress={handlePressCard}
        activeOpacity={0.9}
      >
        <View 
          className="w-12 h-12 rounded-full items-center justify-center" 
          style={{ backgroundColor: colorTheme.bg }}
        >
          <Text className="text-xl font-bold" style={{ color: colorTheme.text }}>
            {customer.name?.charAt(0) || '?'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-[#3E3E3E] mb-0.5" numberOfLines={1}>
            {customer.name}
          </Text>
          <Text className="text-[13px] font-semibold text-gray-500">
            {formatCurrency(customer.budgetMax || customer.budget || 0)}
          </Text>
        </View>
        
        <View className={`px-2.5 py-1.5 rounded-lg ${customer.status === 'Hot' ? 'bg-red-100' : 'bg-gray-100'}`}>
          <Text className={`text-[10px] font-semibold uppercase tracking-wider ${customer.status === 'Hot' ? 'text-red-500' : 'text-gray-600'}`}>
            {customer.status || 'New'}
          </Text>
        </View>

        <TouchableOpacity className="p-0 ml-0" onPress={handleEditPress}>
          <Edit2 size={18} color="#6b7280" />
        </TouchableOpacity>

        <View className="p-0 ml-0">
          {isExpanded ? <ChevronUp size={20} color="#6b7280" /> : <ChevronDown size={20} color="#6b7280" />}
        </View>
      </TouchableOpacity>

      {/* Stage Scroll Section */}
      <View className="mb-1.5 py-2 rounded-xl">
        <StageIndicator currentStage={customer.stage || 'New'} />
      </View>

      {/* Expanded Task Section */}
      {isExpanded && currentTask && (
        <View className="rounded-xl p-3 mb-3 border border-gray-200">
          <Text className="text-sm font-semibold text-gray-800 mb-1.5">{currentTask.title}</Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-200 px-2.5 py-1.5 rounded-lg text-center">
              {currentTask.type}
            </Text>
            <Text className="text-xs font-medium text-gray-500">{currentTask.time}</Text>
          </View>
        </View>
      )}

      {/* Actions - Only show when expanded */}
      {isExpanded && (
        <>
          <View className="flex-row items-center gap-2.5 pt-3 border-t border-gray-100">
            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200"
              onPress={handleCallPress}
            >
              <Phone size={18} color="#16a34a" />
              <Text className="text-[13px] font-semibold text-gray-700">Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200"
              onPress={handleWhatsApp}
            >
              <MessageCircle size={18} color="#25D366" />
              <Text className="text-[13px] font-semibold text-gray-700">Message</Text>
            </TouchableOpacity>
          </View>

          {/* View Details Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-[#9A8CFC] py-3.5 rounded-xl mt-3"
            onPress={handleDetailsPress}
            activeOpacity={0.8}
          >
            <Text className="text-[15px] font-semibold text-white">
              {isBeyondInterested(customer.stage) ? 'View Deal' : 'View Details'}
            </Text>
            <ChevronRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
});
CustomerCard.displayName = 'CustomerCard';

// --- SKELETON COMPONENT ---
const SkeletonList = memo(() => (
  <View className="gap-2.5">
    {[1, 2, 3, 4, 5].map((index) => (
      <View key={index} className="bg-white rounded-2xl p-4 border border-gray-200 mb-3">
        <View className="flex-row items-center gap-3 mb-3">
          <Skeleton width={48} height={48} circle className="mr-3" />
          <View className="flex-1">
            <Skeleton width="60%" height={16} className="mb-2" />
            <Skeleton width="40%" height={14} />
          </View>
          <Skeleton width={60} height={24} borderRadius={8} />
        </View>
        <Skeleton width="100%" height={32} borderRadius={12} className="mb-3" />
        <Skeleton width="100%" height={80} borderRadius={12} className="mb-3" />
        <Skeleton width="100%" height={40} borderRadius={10} />
      </View>
    ))}
  </View>
));
SkeletonList.displayName = 'SkeletonList';

// --- MAIN COMPONENT ---
const CustomersList = ({ customers = [], onSelect, onAddCustomer, onOpenDeal, onEditCustomer, loading = false }) => {
  const [query, setQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredCustomers = useMemo(() => {
    if (!customers || customers.length === 0) return [];
    
    return customers.filter((c) => {
      const matchesSearch = c.name?.toLowerCase().includes(query.toLowerCase()) ?? false;
      const customerType = c.requirement_type || c.type || c.requirement; 
      const matchesType = typeFilter === 'All' || customerType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [customers, query, typeFilter]);

  const toggleCardExpansion = useCallback((customerId) => {
    setExpandedCards(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(customerId)) {
        newExpanded.delete(customerId);
      } else {
        newExpanded.add(customerId);
      }
      return newExpanded;
    });
  }, []);

  const handleCall = useCallback((phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <CustomerCard
      customer={item}
      isExpanded={expandedCards.has(item.id)}
      onToggleExpand={toggleCardExpansion}
      onEditCustomer={onEditCustomer}
      onOpenDeal={onOpenDeal}
      onSelect={onSelect}
      handleCall={handleCall}
    />
  ), [expandedCards, toggleCardExpansion, onEditCustomer, onOpenDeal, onSelect, handleCall]);

  const keyExtractor = useCallback((item) => item.id?.toString() || Math.random().toString(), []);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View 
        className="bg-white rounded-b-[24px] px-5 pb-2.5 items-center"
        style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 16 : 64 }}
      >
        <Text className="text-2xl font-bold text-[#3E3E3E] mb-4">Leads</Text>

        <View className="flex-row items-center gap-1.5 mb-4">
          <View className="flex-1 flex-row items-center bg-white rounded-xl px-3.5 py-0.5 border border-gray-200 h-[50px]">
            <Search size={16} color="#6b7280" />
            <TextInput
              placeholder="Search leads..."
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
              className="ml-2.5 flex-1 text-base text-gray-900 font-medium items-center h-full"
            />
          </View>

          <TouchableOpacity 
            className="flex-row items-center gap-1.5 bg-black px-3 py-3 rounded-xl h-[50px] border border-gray-200" 
            onPress={onAddCustomer}
          >
            <CirclePlus size={16} color="#ffffff" />
            <Text className="text-[13px] font-semibold text-white">Add Clients</Text>
          </TouchableOpacity>
        </View>

        {/* TYPE FILTER */}
        <View className="flex-row py-4 gap-2 w-full items-center">
          {/* Buy Button */}
          <View className="flex-1 relative">
            <TouchableOpacity
              onPress={() => setTypeFilter("Buy")}
              className={`${typeFilter === "Buy" ? "bg-white" : "bg-gray-50"} py-2.5 rounded-2xl ${typeFilter === "Buy" ? "" : "border border-gray-400"} w-full items-center relative flex-row justify-center`}
              style={{ borderEndStartRadius: 0 }}
            >
              {typeFilter === "Buy" && (
                <View className="absolute -top-3 self-center">
                  <ChevronDown size={18} color="#a855f7" />
                </View>
              )}
              <Text className={`${typeFilter === "Buy" ? "text-purple-500 font-semibold" : "text-gray-500 font-normal"} text-sm ${typeFilter === "Buy" ? "mt-1" : ""}`}>
                Buy
              </Text>
            </TouchableOpacity>
          </View>

          {/* All Button */}
          <View className="flex-1 relative">
            <TouchableOpacity
              onPress={() => setTypeFilter("All")}
              className={`${typeFilter === "All" ? "bg-white" : "bg-gray-50"} py-2.5 rounded-2xl ${typeFilter === "All" ? "" : "border border-gray-400"} w-full items-center relative flex-row justify-center`}
            >
              {typeFilter === "All" && (
                <View className="absolute -top-3 self-center">
                  <ChevronDown size={18} color="#a855f7" />
                </View>
              )}
              <Text className={`${typeFilter === "All" ? "text-purple-500 font-semibold" : "text-gray-500 font-normal"} text-sm ${typeFilter === "All" ? "mt-1" : ""}`}>
                All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rent Button */}
          <View className="flex-1 relative">
            <TouchableOpacity
              onPress={() => setTypeFilter("Rent")}
              className={`${typeFilter === "Rent" ? "bg-white" : "bg-gray-50"} py-2.5 rounded-2xl ${typeFilter === "Rent" ? "" : "border border-gray-400"} w-full items-center relative flex-row justify-center`}
              style={{ borderStartStartRadius: 0 }}
            >
              {typeFilter === "Rent" && (
                <View className="absolute -top-3 self-center">
                  <ChevronDown size={18} color="#9333ea" />
                </View>
              )}
              <Text className={`${typeFilter === "Rent" ? "text-purple-600 font-semibold" : "text-gray-500 font-normal"} text-sm ${typeFilter === "Rent" ? "mt-1" : ""}`}>
                Rent
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* OPTIMIZED LIST */}
      {loading ? (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingTop: 4, paddingBottom: 100, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
          <SkeletonList />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100, paddingHorizontal: 20 }}
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Search size={40} color="#e5e7eb" />
              <Text className="mt-4 text-base font-semibold text-gray-400">No leads found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default CustomersList;