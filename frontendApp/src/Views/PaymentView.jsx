import { ArrowDown, ArrowUp, RefreshCw, History, ChevronDown } from 'lucide-react-native';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Modal, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import BalanceCard from '../Components/BalanceCard';
import Skeleton from '../Components/Skeleton';
import { updateDeal } from '../store/slices/dealsSlice';
import { updateCustomerStage } from '../store/slices/customersSlice';
import { addTransaction, completeTransaction, fetchTransactionHistory, setCurrentDeal } from '../store/slices/transactionSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showToast } from '../utils/toast';
import { dealsAPI, customersAPI } from '../config/api';

export default function PaymentView() {
  const dispatch = useDispatch();
  const { selectedDeal } = useSelector(state => state.deals);
  const { properties } = useSelector(state => state.properties);
  const { currentDealSummary, loading: transactionLoading } = useSelector(state => state.transactions);
  const [activeTab, setActiveTab] = useState('Negotiation');

  // Auto-open Token tab if deal stage is Token or beyond
  useEffect(() => {
    if (selectedDeal?.stage === 'Token' || selectedDeal?.stage === 'Completed') {
      setActiveTab('Token');
    }
  }, [selectedDeal?.stage]);

  // Form states
  const [expectedPrice, setExpectedPrice] = useState('');
  const [expectedUnit, setExpectedUnit] = useState('Thousands');
  const [customerOffer, setCustomerOffer] = useState('');
  const [customerUnit, setCustomerUnit] = useState('Lakh');
  const [ownerCounter, setOwnerCounter] = useState('');
  const [ownerUnit, setOwnerUnit] = useState('Crore');
  const [finalPrice, setFinalPrice] = useState('');
  const [finalUnit, setFinalUnit] = useState('Crore');

  // Token form states
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenUnit, setTokenUnit] = useState('Thousands');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [remark, setRemark] = useState('');
  const [tokenTransactionId, setTokenTransactionId] = useState('');
  const [showTokenUnitModal, setShowTokenUnitModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);

  // Full Settlement form states
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showFullSettlementModal, setShowFullSettlementModal] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementUnit, setSettlementUnit] = useState('Thousands');
  const [settlementMode, setSettlementMode] = useState('UPI');
  const [settlementRemark, setSettlementRemark] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSettlementUnitModal, setShowSettlementUnitModal] = useState(false);
  const [showSettlementModeModal, setShowSettlementModeModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Full Settlement specific states
  const [fullSettlementMode, setFullSettlementMode] = useState('UPI');
  const [fullSettlementTransactionId, setFullSettlementTransactionId] = useState('');
  const [fullSettlementRemark, setFullSettlementRemark] = useState('');
  const [showFullSettlementModeModal, setShowFullSettlementModeModal] = useState(false);

  // Transaction ID modal for completing pending transactions
  const [showTransactionIdModal, setShowTransactionIdModal] = useState(false);
  const [completingTransactionId, setCompletingTransactionId] = useState(null);
  const [completingTransactionIdInput, setCompletingTransactionIdInput] = useState('');

  // History states
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Get property details
  const property = properties.find(p => p.id === selectedDeal?.propertyId);
  const propertyPrice = property?.price || 0;

  // Deal Amount - Priority: transaction summary > history final_price > negotiation final_price > dealAmount > property price
  const dealAmount = currentDealSummary.finalPrice || historyData?.final_price || selectedDeal?.negotiation?.finalPrice || selectedDeal?.dealAmount || propertyPrice;

  // Use transaction slice data for paid/pending amounts
  const paidAmount = currentDealSummary.totalPaid || 0;
  const pendingAmount = currentDealSummary.totalPending || 0;
  const remainingAmount = dealAmount - paidAmount - pendingAmount;

  // Fetch negotiation data and transaction history when deal changes
  useEffect(() => {
    const fetchNegotiation = async () => {
      if (selectedDeal?.id) {
        dispatch(setCurrentDeal({ dealId: selectedDeal.id, finalPrice: dealAmount }));
        dispatch(fetchTransactionHistory(selectedDeal.id));
        
        try {
          const response = await dealsAPI.getNegotiation(selectedDeal.id);
          if (response.data.success) {
            const data = response.data.data;
            
            if (data.customer_offer) {
              const customerOfferValue = data.customer_offer;
              if (customerOfferValue >= 10000000) {
                setCustomerOffer((customerOfferValue / 10000000).toString()); setCustomerUnit('Crore');
              } else if (customerOfferValue >= 100000) {
                setCustomerOffer((customerOfferValue / 100000).toString()); setCustomerUnit('Lakh');
              } else {
                setCustomerOffer((customerOfferValue / 1000).toString()); setCustomerUnit('Thousands');
              }
            }
            
            if (data.owner_counter_offer) {
              const ownerCounterValue = data.owner_counter_offer;
              if (ownerCounterValue >= 10000000) {
                setOwnerCounter((ownerCounterValue / 10000000).toString()); setOwnerUnit('Crore');
              } else if (ownerCounterValue >= 100000) {
                setOwnerCounter((ownerCounterValue / 100000).toString()); setOwnerUnit('Lakh');
              } else {
                setOwnerCounter((ownerCounterValue / 1000).toString()); setOwnerUnit('Thousands');
              }
            }
            
            if (data.final_price) {
              const finalPriceValue = data.final_price;
              if (finalPriceValue >= 10000000) {
                setFinalPrice((finalPriceValue / 10000000).toString()); setFinalUnit('Crore');
              } else if (finalPriceValue >= 100000) {
                setFinalPrice((finalPriceValue / 100000).toString()); setFinalUnit('Lakh');
              } else {
                setFinalPrice((finalPriceValue / 1000).toString()); setFinalUnit('Thousands');
              }
            }
          }
        } catch (error) {
          if (selectedDeal?.negotiation) {
            const neg = selectedDeal.negotiation;
            if (neg.customerOfferValue !== undefined) { setCustomerOffer(neg.customerOfferValue.toString()); setCustomerUnit(neg.customerOfferUnit || 'Lakh'); }
            if (neg.ownerCounterValue !== undefined) { setOwnerCounter(neg.ownerCounterValue.toString()); setOwnerUnit(neg.ownerCounterUnit || 'Crore'); }
            if (neg.finalPriceValue !== undefined) { setFinalPrice(neg.finalPriceValue.toString()); setFinalUnit(neg.finalPriceUnit || 'Crore'); }
          }
        }
      }
    };

    fetchNegotiation();

    if (propertyPrice > 0) {
      if (propertyPrice >= 10000000) {
        setExpectedPrice((propertyPrice / 10000000).toString()); setExpectedUnit('Crore');
      } else if (propertyPrice >= 100000) {
        setExpectedPrice((propertyPrice / 100000).toString()); setExpectedUnit('Lakh');
      } else {
        setExpectedPrice((propertyPrice / 1000).toString()); setExpectedUnit('Thousands');
      }
    }
  }, [selectedDeal?.id, propertyPrice]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedDeal?.id) {
        try {
          if (activeTab === 'History') setHistoryLoading(true);
          const response = await dealsAPI.getHistory(selectedDeal.id);
          if (response.data.success) {
            setHistoryData(response.data.data);
          }
        } catch (error) {
          if (activeTab === 'History') showToast.error('Failed to load payment history');
        } finally {
          if (activeTab === 'History') setHistoryLoading(false);
        }
      }
    };
    fetchHistory();
  }, [selectedDeal?.id, activeTab]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (activeTab === 'Full Settlement' && selectedDeal?.id) {
        try {
          const response = await dealsAPI.getHistory(selectedDeal.id);
          if (response.data.success && response.data.data.transactions) {
            const apiTransactions = response.data.data.transactions.map(t => ({
              id: t.id, amount: t.amount, paymentMode: t.payment_mode, transactionId: t.transaction_ref,
              remark: t.remark, dueDate: t.due_date || t.created_at, completedDate: t.completed_on, status: t.status
            }));
            dispatch(updateDeal({ ...selectedDeal, settlements: apiTransactions }));
          }
        } catch (error) {}
      }
    };
    fetchTransactions();
  }, [activeTab, selectedDeal?.id]);

  const [showExpectedModal, setShowExpectedModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  const units = ['Thousands', 'Lakh', 'Crore'];
  const paymentModes = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'RTGS', 'NEFT'];
  const statusOptions = ['Paid', 'Pending'];

  const getMultiplier = (unit) => {
    switch (unit) {
      case 'Thousands': return 1000;
      case 'Lakh': return 100000;
      case 'Crore': return 10000000;
      default: return 1;
    }
  };

  const handleSave = async () => {
    const finalValue = parseFloat(finalPrice) * getMultiplier(finalUnit);
    if (!isNaN(finalValue) && finalValue > 0) {
      try {
        const response = await dealsAPI.updateNegotiation(selectedDeal.id, {
          expected_price: parseFloat(expectedPrice) * getMultiplier(expectedUnit),
          customer_offer: parseFloat(customerOffer) * getMultiplier(customerUnit),
          owner_counter_offer: parseFloat(ownerCounter) * getMultiplier(ownerUnit),
          final_price: finalValue
        });

        if (response.data.success) {
          dispatch(updateDeal({
            ...selectedDeal, dealAmount: finalValue,
            negotiation: {
              expectedPrice: parseFloat(expectedPrice) * getMultiplier(expectedUnit), customerOffer: parseFloat(customerOffer) * getMultiplier(customerUnit), ownerCounter: parseFloat(ownerCounter) * getMultiplier(ownerUnit), finalPrice: finalValue,
              expectedPriceValue: parseFloat(expectedPrice) || 0, expectedPriceUnit: expectedUnit, customerOfferValue: parseFloat(customerOffer) || 0, customerOfferUnit: customerUnit, ownerCounterValue: parseFloat(ownerCounter) || 0, ownerCounterUnit: ownerUnit, finalPriceValue: parseFloat(finalPrice) || 0, finalPriceUnit: finalUnit
            }
          }));
          if (selectedDeal.customerId) {
            try { await customersAPI.updateStage(selectedDeal.customerId, 'Negotiation'); dispatch(updateCustomerStage({ id: selectedDeal.customerId, stage: 'Negotiation' })); } catch (error) {}
          }
          showToast.success('Negotiation saved successfully!');
        }
      } catch (error) { showToast.error('Failed to save negotiation'); }
    }
  };

  const handleCompleteNegotiation = async () => {
    const finalValue = parseFloat(finalPrice) * getMultiplier(finalUnit);
    if (!isNaN(finalValue) && finalValue > 0) {
      try {
        const response = await dealsAPI.updateNegotiation(selectedDeal.id, {
          expected_price: parseFloat(expectedPrice) * getMultiplier(expectedUnit), customer_offer: parseFloat(customerOffer) * getMultiplier(customerUnit), owner_counter_offer: parseFloat(ownerCounter) * getMultiplier(ownerUnit), final_price: finalValue, complete: true 
        });

        if (response.data.success) {
          dispatch(updateDeal({
            ...selectedDeal, dealAmount: finalValue, stage: 'Token', negotiationCompleted: true,
            negotiation: {
              expectedPrice: parseFloat(expectedPrice) * getMultiplier(expectedUnit), customerOffer: parseFloat(customerOffer) * getMultiplier(customerUnit), ownerCounter: parseFloat(ownerCounter) * getMultiplier(ownerUnit), finalPrice: finalValue, expectedPriceValue: parseFloat(expectedPrice) || 0, expectedPriceUnit: expectedUnit, customerOfferValue: parseFloat(customerOffer) || 0, customerOfferUnit: customerUnit, ownerCounterValue: parseFloat(ownerCounter) || 0, ownerCounterUnit: ownerUnit, finalPriceValue: parseFloat(finalPrice) || 0, finalPriceUnit: finalUnit
            }
          }));
          if (selectedDeal.customerId) {
            try { await customersAPI.updateStage(selectedDeal.customerId, 'Token'); dispatch(updateCustomerStage({ id: selectedDeal.customerId, stage: 'Token' })); } catch (error) {}
          }
          showToast.success('Negotiation completed!');
          setActiveTab('Token');
        }
      } catch (error) { showToast.error('Failed to complete negotiation'); }
    }
  };

  const isNegotiationCompleted = selectedDeal?.negotiationCompleted || selectedDeal?.stage === 'Token' || selectedDeal?.stage === 'Settlement' || selectedDeal?.stage === 'Agreement' || selectedDeal?.stage === 'Completed';

  const handleTabClick = (tabName) => {
    if (tabName === 'Negotiation') setActiveTab(tabName);
    else if (tabName === 'Token' && isNegotiationCompleted) setActiveTab(tabName);
    else if (tabName === 'Full Settlement' || tabName === 'History') setActiveTab(tabName);
    else if (!isNegotiationCompleted) Alert.alert('Complete Negotiation First', 'Please complete the negotiation before accessing other tabs.', [{ text: 'OK' }]);
  };

  const handleTokenSubmit = async () => {
    const tokenValue = parseFloat(tokenAmount) * getMultiplier(tokenUnit);
    if (!isNaN(tokenValue) && tokenValue > 0) {
      if (tokenValue > remainingAmount) return showToast.error(`Cannot exceed remaining ₹${remainingAmount.toLocaleString('en-IN')}`);
      if (paymentMode !== 'Cash' && !tokenTransactionId.trim()) return showToast.error('Transaction ID is required');

      Alert.alert('Confirm Transaction', 'Are you sure this transaction is done?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: async () => {
            try {
              const result = await dispatch(addTransaction({
                dealId: selectedDeal.id,
                transactionData: { transaction_type: 'Token', amount: tokenValue, payment_mode: paymentMode, transaction_ref: paymentMode !== 'Cash' ? tokenTransactionId : null, status: 'Completed', remark: remark }
              })).unwrap();

              if (result) {
                dispatch(fetchTransactionHistory(selectedDeal.id));
                dispatch(updateDeal({ ...selectedDeal, tokenPayment: { amount: tokenValue, unit: tokenUnit, paymentMode, transactionId: paymentMode !== 'Cash' ? tokenTransactionId : null, remark, date: new Date().toISOString() } }));
                if (selectedDeal.customerId) {
                  try { await customersAPI.updateStage(selectedDeal.customerId, 'Settlement'); dispatch(updateCustomerStage({ id: selectedDeal.customerId, stage: 'Settlement' })); } catch (error) {}
                }
                setTokenAmount(''); setRemark(''); setTokenTransactionId(''); setActiveTab('Full Settlement');
                showToast.success('Token payment submitted!');
              }
            } catch (error) { showToast.error('Failed to submit token payment'); }
          }
        }
      ]);
    } else { showToast.error('Please enter a valid amount'); }
  };

  const handleAddTransaction = () => {
    const settlementValue = parseFloat(settlementAmount) * getMultiplier(settlementUnit);
    if (!isNaN(settlementValue) && settlementValue > 0) {
      if (settlementValue > remainingAmount) return showToast.error(`Cannot exceed remaining ₹${remainingAmount.toLocaleString('en-IN')}`);
      if (transactionStatus === 'Paid' && settlementMode !== 'Cash' && !transactionId.trim()) return showToast.error('Transaction ID is required');

      if (transactionStatus === 'Paid') {
        Alert.alert('Confirm Transaction', 'Are you sure this transaction is done?', [{ text: 'No', style: 'cancel' }, { text: 'Yes', onPress: () => addTransactionToStore() }]);
      } else { addTransactionToStore(); }
    } else { showToast.error('Please enter a valid amount'); }
  };

  const addTransactionToStore = async () => {
    const settlementValue = parseFloat(settlementAmount) * getMultiplier(settlementUnit);
    try {
      const result = await dispatch(addTransaction({
        dealId: selectedDeal.id,
        transactionData: { transaction_type: 'Settlement', amount: settlementValue, payment_mode: settlementMode, transaction_ref: (transactionStatus === 'Paid' && settlementMode !== 'Cash') ? transactionId : null, status: transactionStatus === 'Paid' ? 'Completed' : 'Pending', due_date: dueDate.toISOString().split('T')[0], remark: settlementRemark }
      })).unwrap();

      if (result) {
        dispatch(fetchTransactionHistory(selectedDeal.id));
        const newTransaction = { id: result.transaction.id, amount: settlementValue, unit: settlementUnit, paymentMode: settlementMode, transactionId: (transactionStatus === 'Paid' && settlementMode !== 'Cash') ? transactionId : null, remark: settlementRemark, dueDate: dueDate.toISOString(), date: new Date().toISOString(), status: transactionStatus === 'Paid' ? 'Completed' : 'Pending' };
        dispatch(updateDeal({ ...selectedDeal, settlements: [...(selectedDeal?.settlements || []), newTransaction] }));
        setSettlementAmount(''); setSettlementRemark(''); setTransactionId(''); setTransactionStatus('Pending'); setDueDate(new Date()); setShowAddTransactionModal(false);
        showToast.success('Transaction added successfully!');
      }
    } catch (error) { showToast.error('Failed to add transaction'); }
  };

  const formatDate = (dateString) => { return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };

  const handleCompleteTransaction = (transactionId) => {
    const transaction = selectedDeal?.settlements?.find(t => t.id === transactionId);
    if (!transaction) return;
    if (transaction.paymentMode !== 'Cash' && !transaction.transactionId) {
      setCompletingTransactionId(transactionId); setCompletingTransactionIdInput(''); setShowTransactionIdModal(true);
    } else {
      Alert.alert('Mark as Complete', 'Are you sure you want to mark this transaction as completed?', [{ text: 'No', style: 'cancel' }, { text: 'Yes', onPress: () => completeTransactionWithId(transactionId, transaction.transactionId) }]);
    }
  };

  const handleTransactionIdSubmit = () => {
    if (!completingTransactionIdInput.trim()) return showToast.error('Transaction ID is required for non-cash payments');
    setShowTransactionIdModal(false);
    setTimeout(() => {
      Alert.alert('Mark as Complete', 'Are you sure you want to mark this transaction as completed?', [
        { text: 'No', style: 'cancel', onPress: () => { setCompletingTransactionId(null); setCompletingTransactionIdInput(''); } },
        { text: 'Yes', onPress: () => { completeTransactionWithId(completingTransactionId, completingTransactionIdInput.trim()); setCompletingTransactionId(null); setCompletingTransactionIdInput(''); } }
      ]);
    }, 300);
  };

  const completeTransactionWithId = async (transactionId, transId) => {
    try {
      const result = await dispatch(completeTransaction({ transactionId, data: { transaction_ref: transId } })).unwrap();
      if (result) {
        dispatch(fetchTransactionHistory(selectedDeal.id));
        const updatedSettlements = selectedDeal.settlements.map(t => {
          if (t.id === transactionId) return { ...t, status: 'Completed', transactionId: transId, completedDate: new Date().toISOString() };
          return t;
        });
        dispatch(updateDeal({ ...selectedDeal, settlements: updatedSettlements }));
        showToast.success('Transaction marked as completed!');
      }
    } catch (error) { showToast.error('Failed to complete transaction'); }
  };

  const handleFullSettlement = () => {
    if (fullSettlementMode !== 'Cash' && !fullSettlementTransactionId.trim()) return showToast.error('Transaction ID is required');
    Alert.alert('Confirm Full Settlement', 'Are you sure this transaction is done?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', onPress: () => {
          const newTransaction = { id: Date.now(), amount: remainingAmount, unit: 'Rupees', paymentMode: fullSettlementMode, transactionId: fullSettlementMode !== 'Cash' ? fullSettlementTransactionId : null, remark: fullSettlementRemark, dueDate: new Date().toISOString(), date: new Date().toISOString(), status: 'Completed', completedDate: new Date().toISOString() };
          dispatch(updateDeal({ ...selectedDeal, paidAmount: dealAmount, settlements: [...(selectedDeal?.settlements || []), newTransaction] }));
          setFullSettlementMode('UPI'); setFullSettlementTransactionId(''); setFullSettlementRemark(''); setShowFullSettlementModal(false);
          showToast.success('Full settlement completed successfully!');
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 160, marginTop: 6 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BalanceCard amount={dealAmount} label="Total Amount" remaining={remainingAmount} />

          <View className="flex-row justify-between mb-6 mt-2 border border-gray-300 py-5 px-3 rounded-2xl">
            <TouchableOpacity className="w-[23%] items-center gap-2" onPress={() => setActiveTab('Negotiation')}>
              <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: activeTab === 'Negotiation' ? '#9A8CFC' : '#414141' }}>
                <ArrowDown size={22} color="#fff" />
              </View>
              <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-3" numberOfLines={1}>Negotiation</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[23%] items-center gap-2" onPress={() => handleTabClick('Token')}>
              <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: activeTab === 'Token' ? '#9A8CFC' : '#414141' }}>
                <ArrowUp size={22} color="#fff" />
              </View>
              <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-3" numberOfLines={1}>Token</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[23%] items-center gap-2" onPress={() => handleTabClick('Full Settlement')}>
              <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: activeTab === 'Full Settlement' ? '#9A8CFC' : '#414141' }}>
                <RefreshCw size={22} color="#fff" />
              </View>
              <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-[10px]" numberOfLines={2}>Full Settlement</Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[23%] items-center gap-2" onPress={() => handleTabClick('History')}>
              <View className="w-14 h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: activeTab === 'History' ? '#9A8CFC' : '#414141' }}>
                <History size={22} color="#fff" />
              </View>
              <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-3" numberOfLines={1}>History</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Negotiation' && (
            <>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Property Expected Price</Text>
                  <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                    <TextInput className="flex-1 py-4 px-3 text-base text-gray-800" placeholder="eg 1000" placeholderTextColor="#d1d5db" keyboardType="numeric" value={expectedPrice} onChangeText={setExpectedPrice} />
                    <TouchableOpacity className="flex-row items-center px-3 py-3 border-l border-gray-200" onPress={() => setShowExpectedModal(true)}>
                      <Text className="text-[13px] font-semibold text-gray-600 mr-1">{expectedUnit.slice(0, 2)}</Text>
                      <ChevronDown size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Customer Offer</Text>
                  <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                    <TextInput className="flex-1 py-4 px-3 text-base text-gray-800" placeholder="eg 200" placeholderTextColor="#d1d5db" keyboardType="numeric" value={customerOffer} onChangeText={setCustomerOffer} />
                    <TouchableOpacity className="flex-row items-center px-3 py-3 border-l border-gray-200" onPress={() => setShowCustomerModal(true)}>
                      <Text className="text-[13px] font-semibold text-gray-600 mr-1">{customerUnit === 'Lakh' ? 'La' : customerUnit.slice(0, 2)}</Text>
                      <ChevronDown size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Owner Counter Offer</Text>
                  <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                    <TextInput className="flex-1 py-4 px-3 text-base text-gray-800" placeholder="eg 1000" placeholderTextColor="#d1d5db" keyboardType="numeric" value={ownerCounter} onChangeText={setOwnerCounter} />
                    <TouchableOpacity className="flex-row items-center px-3 py-3 border-l border-gray-200" onPress={() => setShowOwnerModal(true)}>
                      <Text className="text-[13px] font-semibold text-gray-600 mr-1">{ownerUnit.slice(0, 2)}</Text>
                      <ChevronDown size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="flex-1">
                  <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Final</Text>
                  <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                    <TextInput className="flex-1 py-4 px-3 text-base text-gray-800" placeholder="eg 200" placeholderTextColor="#d1d5db" keyboardType="numeric" value={finalPrice} onChangeText={setFinalPrice} />
                    <TouchableOpacity className="flex-row items-center px-3 py-3 border-l border-gray-200" onPress={() => setShowFinalModal(true)}>
                      <Text className="text-[13px] font-semibold text-gray-600 mr-1">{finalUnit.slice(0, 2)}</Text>
                      <ChevronDown size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity className="w-[23%] bg-black rounded-2xl py-4 items-center justify-center" onPress={handleSave}>
                  <Text className="text-base font-semibold text-white">Save</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-[#9A8CFC] rounded-2xl py-4 items-center justify-center" onPress={handleCompleteNegotiation}>
                  <Text className="text-base font-semibold text-white">Complete Negotiation</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {activeTab === 'Token' && (
            <View className="px-1">
              <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Token Amount</Text>
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                    <TextInput className="flex-1 py-4 px-3 text-base text-gray-800" placeholder="Enter Amount" placeholderTextColor="#d1d5db" keyboardType="numeric" value={tokenAmount} onChangeText={setTokenAmount} />
                    <TouchableOpacity className="flex-row items-center px-6 py-3 border-l border-gray-200" onPress={() => setShowTokenUnitModal(true)}>
                      <Text className="text-[13px] font-semibold text-gray-600 mr-1">{tokenUnit.slice(0, 2)}</Text>
                      <ChevronDown size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Payment Mode</Text>
              <TouchableOpacity className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-4 mb-3" onPress={() => setShowPaymentModeModal(true)}>
                <Text className="flex-1 text-base text-gray-800">{paymentMode}</Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {paymentMode !== 'Cash' && (
                <>
                  <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Transaction ID *</Text>
                  <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-4 text-base text-gray-800 mb-3" placeholder="Enter Transaction ID" placeholderTextColor="#d1d5db" value={tokenTransactionId} onChangeText={setTokenTransactionId} />
                </>
              )}

              <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Remark</Text>
              <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-4 text-base text-gray-800 mb-6" placeholder="Enter Remark" placeholderTextColor="#d1d5db" multiline numberOfLines={4} textAlignVertical="top" value={remark} onChangeText={setRemark} />

              <TouchableOpacity className="bg-[#9A8CFC] rounded-2xl py-4 items-center" onPress={handleTokenSubmit}>
                <Text className="text-base font-semibold text-white">Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'Full Settlement' && (
            <View className="px-1">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-[#3E3E3E]">Pending Transactions</Text>
                <TouchableOpacity className="bg-[#9A8CFC] rounded-full px-6 py-2 flex-row items-center gap-2" onPress={() => setShowAddTransactionModal(true)}>
                  <Text className="text-white text-2xl font-light">+</Text>
                  <Text className="text-white font-semibold">ADD</Text>
                </TouchableOpacity>
              </View>

              {selectedDeal?.settlements && selectedDeal.settlements.filter(t => t.status === 'Pending').length > 0 ? (
                selectedDeal.settlements.filter(transaction => transaction.status === 'Pending').map((transaction) => (
                  <View key={transaction.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-lg font-semibold text-gray-800">{transaction.paymentMode}</Text>
                      <Text className="text-base font-semibold text-orange-500">Pending</Text>
                    </View>
                    <View className="flex-row justify-between items-end">
                      <View>
                        <Text className="text-sm text-gray-500 mb-1">Amount</Text>
                        <Text className="text-xl font-bold text-gray-800">₹{transaction.amount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm text-gray-500 mb-1">Due Date</Text>
                        <Text className="text-base font-semibold text-gray-800">{formatDate(transaction.dueDate)}</Text>
                      </View>
                    </View>
                    {transaction.remark && (
                      <View className="mt-3 pt-3 border-t border-gray-200">
                        <Text className="text-sm text-gray-500 mb-1">Remark</Text>
                        <Text className="text-base text-gray-700">{transaction.remark}</Text>
                      </View>
                    )}
                    <TouchableOpacity className="bg-[#9A8CFC] rounded-xl py-3 items-center mt-4" onPress={() => handleCompleteTransaction(transaction.id)}>
                      <Text className="text-white font-semibold text-base">Mark as Complete</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View className="items-center py-20">
                  <Text className="text-gray-500">No pending transactions. Add your first transaction!</Text>
                </View>
              )}

              {remainingAmount > 0 && (
                <TouchableOpacity className="bg-[#9A8CFC] rounded-2xl py-4 items-center mt-8 mb-4" onPress={() => setShowFullSettlementModal(true)}>
                  <Text className="text-base font-semibold text-white">Full Settlement</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeTab === 'History' && (
            <View className="px-1">
              <Text className="text-lg font-bold text-[#3E3E3E] mb-4">Payment History</Text>
              {historyLoading ? (
                <View>
                  {[1, 2, 3].map((item) => (
                    <View key={item} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                      <View className="flex-row justify-between items-center mb-3">
                        <View>
                          <Skeleton width={100} height={20} borderRadius={8} style={{ marginBottom: 8 }} />
                          <Skeleton width={60} height={14} borderRadius={6} />
                        </View>
                        <Skeleton width={70} height={18} borderRadius={8} />
                      </View>
                      <View className="flex-row justify-between items-end mb-3">
                        <View>
                          <Skeleton width={50} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                          <Skeleton width={120} height={24} borderRadius={8} />
                        </View>
                        <View className="items-end">
                          <Skeleton width={80} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                          <Skeleton width={90} height={18} borderRadius={8} />
                        </View>
                      </View>
                      <View className="mb-2">
                        <Skeleton width={90} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                        <Skeleton width="100%" height={16} borderRadius={6} />
                      </View>
                      <View className="pt-3 border-t border-gray-200">
                        <Skeleton width={50} height={14} borderRadius={6} style={{ marginBottom: 6 }} />
                        <Skeleton width="100%" height={16} borderRadius={6} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : historyData && historyData.transactions && historyData.transactions.length > 0 ? (
                <>
                  {historyData.transactions.map((transaction) => (
                    <View key={transaction.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                      <View className="flex-row justify-between items-center mb-3">
                        <View>
                          <Text className="text-lg font-semibold text-gray-800">{transaction.payment_mode}</Text>
                          <Text className="text-xs text-gray-500 mt-1">{transaction.transaction_type}</Text>
                        </View>
                        <Text className={`text-base font-semibold ${transaction.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>
                          {transaction.status}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-end mb-3">
                        <View>
                          <Text className="text-sm text-gray-500 mb-1">Amount</Text>
                          <Text className="text-xl font-bold text-gray-800">₹{transaction.amount.toLocaleString('en-IN')}</Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm text-gray-500 mb-1">{transaction.completed_on ? 'Completed On' : 'Due Date'}</Text>
                          <Text className="text-base font-semibold text-gray-800">{formatDate(transaction.completed_on || transaction.due_date || transaction.created_at)}</Text>
                        </View>
                      </View>
                      {transaction.transaction_ref && (
                        <View className="mb-2">
                          <Text className="text-sm text-gray-500 mb-1">Transaction ID</Text>
                          <Text className="text-base text-gray-700">{transaction.transaction_ref}</Text>
                        </View>
                      )}
                      {transaction.remark && (
                        <View className="pt-3 border-t border-gray-200">
                          <Text className="text-sm text-gray-500 mb-1">Remark</Text>
                          <Text className="text-base text-gray-700">{transaction.remark}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  {historyData.final_price && (
                    <View className="bg-purple-50 rounded-2xl border border-purple-200 p-4 mt-4">
                      <Text className="text-sm text-gray-600 mb-1">Final Deal Amount</Text>
                      <Text className="text-2xl font-bold text-purple-600">₹{historyData.final_price.toLocaleString('en-IN')}</Text>
                    </View>
                  )}
                </>
              ) : (
                <View className="items-center py-10"><Text className="text-gray-500">No payment history yet.</Text></View>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================================================== */}
      {/* SARE MODALS YAHAN COMPONENT KE ANDAR HAIN PAR KEYBOARD AVOIDING VIEW KE BAHAR */}
      {/* ======================================================== */}

      {/* Simple Unit Modals */}
      <Modal visible={showExpectedModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowExpectedModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity key={unit} className="py-3 border-b border-gray-200" onPress={() => { setExpectedUnit(unit); setShowExpectedModal(false); }}>
                <Text className={`text-base ${expectedUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showCustomerModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowCustomerModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity key={unit} className="py-3 border-b border-gray-200" onPress={() => { setCustomerUnit(unit); setShowCustomerModal(false); }}>
                <Text className={`text-base ${customerUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showOwnerModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowOwnerModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity key={unit} className="py-3 border-b border-gray-200" onPress={() => { setOwnerUnit(unit); setShowOwnerModal(false); }}>
                <Text className={`text-base ${ownerUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showFinalModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowFinalModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity key={unit} className="py-3 border-b border-gray-200" onPress={() => { setFinalUnit(unit); setShowFinalModal(false); }}>
                <Text className={`text-base ${finalUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showTokenUnitModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowTokenUnitModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity key={unit} className="py-3 border-b border-gray-200" onPress={() => { setTokenUnit(unit); setShowTokenUnitModal(false); }}>
                <Text className={`text-base ${tokenUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showSettlementUnitModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowSettlementUnitModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity key={unit} className="py-3 border-b border-gray-200" onPress={() => { setSettlementUnit(unit); setShowSettlementUnitModal(false); }}>
                <Text className={`text-base ${settlementUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showPaymentModeModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowPaymentModeModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Payment Mode</Text>
            {paymentModes.map((mode) => (
              <TouchableOpacity key={mode} className="py-3 border-b border-gray-200" onPress={() => { setPaymentMode(mode); setShowPaymentModeModal(false); }}>
                <Text className={`text-base ${paymentMode === mode ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showSettlementModeModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowSettlementModeModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Payment Mode</Text>
            {paymentModes.map((mode) => (
              <TouchableOpacity key={mode} className="py-3 border-b border-gray-200" onPress={() => { setSettlementMode(mode); setShowSettlementModeModal(false); }}>
                <Text className={`text-base ${settlementMode === mode ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showStatusModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowStatusModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Status</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity key={status} className="py-3 border-b border-gray-200" onPress={() => { setTransactionStatus(status); setShowStatusModal(false); }}>
                <Text className={`text-base ${transactionStatus === status ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showFullSettlementModeModal} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/50 justify-center items-center" activeOpacity={1} onPress={() => setShowFullSettlementModeModal(false)}>
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Payment Mode</Text>
            {paymentModes.map((mode) => (
              <TouchableOpacity key={mode} className="py-3 border-b border-gray-200" onPress={() => { setFullSettlementMode(mode); setShowFullSettlementModeModal(false); }}>
                <Text className={`text-base ${fullSettlementMode === mode ? 'text-[#C4B5FD] font-semibold' : 'text-gray-700'}`}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Forms wale modals (Keyboard Avoiding View ke sath) */}
      <Modal visible={showAddTransactionModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">Add Transaction</Text>
                <TouchableOpacity onPress={() => setShowAddTransactionModal(false)}>
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Amount</Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 mb-4">
                  <TextInput className="flex-1 py-3 px-3 text-base text-gray-800" placeholder="Enter Amount" placeholderTextColor="#d1d5db" keyboardType="numeric" value={settlementAmount} onChangeText={setSettlementAmount} />
                  <TouchableOpacity className="flex-row items-center px-3 py-3 border-l border-gray-200" onPress={() => setShowSettlementUnitModal(true)}>
                    <Text className="text-[13px] font-semibold text-gray-600 mr-1">{settlementUnit.slice(0, 2)}</Text>
                    <ChevronDown size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Payment Mode</Text>
                <TouchableOpacity className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4" onPress={() => setShowSettlementModeModal(true)}>
                  <Text className="flex-1 text-base text-gray-800">{settlementMode}</Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>

                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Status</Text>
                <TouchableOpacity className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4" onPress={() => setShowStatusModal(true)}>
                  <Text className="flex-1 text-base text-gray-800">{transactionStatus}</Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>

                {transactionStatus === 'Paid' && settlementMode !== 'Cash' && (
                  <>
                    <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Transaction ID *</Text>
                    <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-4" placeholder="Enter Transaction ID" placeholderTextColor="#d1d5db" value={transactionId} onChangeText={setTransactionId} />
                  </>
                )}

                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Due Date</Text>
                <TouchableOpacity className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4" onPress={() => setShowDatePicker(true)}>
                  <Text className="flex-1 text-base text-gray-800">{dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker value={dueDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, selectedDate) => { setShowDatePicker(Platform.OS === 'ios'); if (selectedDate) setDueDate(selectedDate); }} />
                )}

                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Remark</Text>
                <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-6" placeholder="Enter Remark" placeholderTextColor="#d1d5db" multiline numberOfLines={3} textAlignVertical="top" value={settlementRemark} onChangeText={setSettlementRemark} />

                <TouchableOpacity className="bg-[#9A8CFC] rounded-2xl py-4 items-center" onPress={handleAddTransaction}>
                  <Text className="text-base font-semibold text-white">Add Transaction</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showFullSettlementModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">Full Settlement</Text>
                <TouchableOpacity onPress={() => setShowFullSettlementModal(false)}>
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                  <Text className="text-sm text-gray-600 mb-1">Remaining Amount</Text>
                  <Text className="text-2xl font-bold text-[#9A8CFC]">₹{remainingAmount.toLocaleString('en-IN')}</Text>
                </View>

                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Payment Mode</Text>
                <TouchableOpacity className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4" onPress={() => setShowFullSettlementModeModal(true)}>
                  <Text className="flex-1 text-base text-gray-800">{fullSettlementMode}</Text>
                  <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>

                {fullSettlementMode !== 'Cash' && (
                  <>
                    <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Transaction ID *</Text>
                    <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-4" placeholder="Enter Transaction ID" placeholderTextColor="#d1d5db" value={fullSettlementTransactionId} onChangeText={setFullSettlementTransactionId} />
                  </>
                )}

                <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Remark</Text>
                <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-6" placeholder="Enter Remark" placeholderTextColor="#d1d5db" multiline numberOfLines={3} textAlignVertical="top" value={fullSettlementRemark} onChangeText={setFullSettlementRemark} />

                <TouchableOpacity className="bg-[#9A8CFC] rounded-2xl py-4 items-center" onPress={handleFullSettlement}>
                  <Text className="text-base font-semibold text-white">Complete Full Settlement</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showTransactionIdModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">Transaction ID Required</Text>
                <TouchableOpacity onPress={() => { setShowTransactionIdModal(false); setCompletingTransactionId(null); setCompletingTransactionIdInput(''); }}>
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Transaction ID *</Text>
              <TextInput className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-6" placeholder="Enter Transaction ID" placeholderTextColor="#d1d5db" value={completingTransactionIdInput} onChangeText={setCompletingTransactionIdInput} autoFocus />

              <TouchableOpacity className="bg-[#C4B5FD] rounded-2xl py-4 items-center" onPress={handleTransactionIdSubmit}>
                <Text className="text-base font-semibold text-white">Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}