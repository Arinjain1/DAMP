import { ArrowDown, ArrowUp, RefreshCw, History, ChevronDown } from 'lucide-react-native';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Modal, Platform, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import BalanceCard from '../Components/BalanceCard';
import { updateDeal } from '../store/slices/dealsSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { showToast } from '../utils/toast';

export default function PaymentView() {
  const dispatch = useDispatch();
  const { selectedDeal } = useSelector(state => state.deals);
  const { properties } = useSelector(state => state.properties);
  const [activeTab, setActiveTab] = useState('Negotiation');

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

  // Get property details
  const property = properties.find(p => p.id === selectedDeal?.propertyId);
  const propertyPrice = property?.price || 0;

  // Deal Amount - get from selectedDeal or use property price
  const dealAmount = selectedDeal?.dealAmount || propertyPrice;

  // Calculate remaining amount
  const paidAmount = selectedDeal?.paidAmount || 0;
  const remainingAmount = dealAmount - paidAmount;

  // Load saved negotiation data when component mounts or deal changes
  useEffect(() => {
    if (selectedDeal?.negotiation) {
      const neg = selectedDeal.negotiation;

      // Load saved values and units (skip expectedPrice - it should always be property price)
      if (neg.customerOfferValue !== undefined) {
        setCustomerOffer(neg.customerOfferValue.toString());
        setCustomerUnit(neg.customerOfferUnit || 'Lakh');
      }
      if (neg.ownerCounterValue !== undefined) {
        setOwnerCounter(neg.ownerCounterValue.toString());
        setOwnerUnit(neg.ownerCounterUnit || 'Crore');
      }
      if (neg.finalPriceValue !== undefined) {
        setFinalPrice(neg.finalPriceValue.toString());
        setFinalUnit(neg.finalPriceUnit || 'Crore');
      }
    }

    // Always set expected price to property price
    if (propertyPrice > 0) {
      // Convert property price to appropriate unit
      if (propertyPrice >= 10000000) {
        // Crore
        setExpectedPrice((propertyPrice / 10000000).toString());
        setExpectedUnit('Crore');
      } else if (propertyPrice >= 100000) {
        // Lakh
        setExpectedPrice((propertyPrice / 100000).toString());
        setExpectedUnit('Lakh');
      } else {
        // Thousands
        setExpectedPrice((propertyPrice / 1000).toString());
        setExpectedUnit('Thousands');
      }
    }
  }, [selectedDeal?.id, propertyPrice]);

  // Modal states
  const [showExpectedModal, setShowExpectedModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  const units = ['Thousands', 'Lakh', 'Crore'];
  const paymentModes = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'RTGS', 'NEFT'];
  const statusOptions = ['Paid', 'Pending'];

  // Calculate actual value based on unit
  const getMultiplier = (unit) => {
    switch (unit) {
      case 'Thousands': return 1000;
      case 'Lakh': return 100000;
      case 'Crore': return 10000000;
      default: return 1;
    }
  };

  const handleSave = () => {
    // Calculate final value
    const finalValue = parseFloat(finalPrice) * getMultiplier(finalUnit);

    if (!isNaN(finalValue) && finalValue > 0) {
      // Update the deal with new amount in Redux
      const updatedDeal = {
        ...selectedDeal,
        dealAmount: finalValue,
        negotiation: {
          // Store calculated values
          expectedPrice: parseFloat(expectedPrice) * getMultiplier(expectedUnit),
          customerOffer: parseFloat(customerOffer) * getMultiplier(customerUnit),
          ownerCounter: parseFloat(ownerCounter) * getMultiplier(ownerUnit),
          finalPrice: finalValue,
          // Store raw values and units for editing
          expectedPriceValue: parseFloat(expectedPrice) || 0,
          expectedPriceUnit: expectedUnit,
          customerOfferValue: parseFloat(customerOffer) || 0,
          customerOfferUnit: customerUnit,
          ownerCounterValue: parseFloat(ownerCounter) || 0,
          ownerCounterUnit: ownerUnit,
          finalPriceValue: parseFloat(finalPrice) || 0,
          finalPriceUnit: finalUnit
        }
      };

      dispatch(updateDeal(updatedDeal));


    }
  };

  const handleCompleteNegotiation = () => {
    // Calculate final value
    const finalValue = parseFloat(finalPrice) * getMultiplier(finalUnit);

    if (!isNaN(finalValue) && finalValue > 0) {
      // Update the deal with negotiation completed flag
      const updatedDeal = {
        ...selectedDeal,
        dealAmount: finalValue,
        negotiationCompleted: true, // Mark negotiation as completed
        negotiation: {
          // Store calculated values
          expectedPrice: parseFloat(expectedPrice) * getMultiplier(expectedUnit),
          customerOffer: parseFloat(customerOffer) * getMultiplier(customerUnit),
          ownerCounter: parseFloat(ownerCounter) * getMultiplier(ownerUnit),
          finalPrice: finalValue,
          // Store raw values and units for editing
          expectedPriceValue: parseFloat(expectedPrice) || 0,
          expectedPriceUnit: expectedUnit,
          customerOfferValue: parseFloat(customerOffer) || 0,
          customerOfferUnit: customerUnit,
          ownerCounterValue: parseFloat(ownerCounter) || 0,
          ownerCounterUnit: ownerUnit,
          finalPriceValue: parseFloat(finalPrice) || 0,
          finalPriceUnit: finalUnit
        }
      };

      dispatch(updateDeal(updatedDeal));

      // Then switch to Token tab
      setActiveTab('Token');
    }
  };

  // Check if negotiation is completed
  const isNegotiationCompleted = selectedDeal?.negotiationCompleted || false;

  // Check if token is paid
  const isTokenPaid = selectedDeal?.tokenPayment !== undefined;

  // Handle tab click with validation
  const handleTabClick = (tabName) => {
    if (tabName === 'Negotiation') {
      setActiveTab(tabName);
    } else if (tabName === 'Token' && isNegotiationCompleted) {
      setActiveTab(tabName);
    } else if ((tabName === 'Full Settlement' || tabName === 'History') && isTokenPaid) {
      setActiveTab(tabName);
    } else if (!isNegotiationCompleted) {
      Alert.alert(
        'Complete Negotiation First',
        'Please complete the negotiation before accessing other tabs.',
        [{ text: 'OK' }]
      );
    } else if (!isTokenPaid) {
      Alert.alert(
        'Complete Token Payment First',
        'Please complete the token payment before accessing Full Settlement or History.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTokenSubmit = () => {
    const tokenValue = parseFloat(tokenAmount) * getMultiplier(tokenUnit);

    if (!isNaN(tokenValue) && tokenValue > 0) {
      // Validate transaction ID for non-cash payments
      if (paymentMode !== 'Cash' && !tokenTransactionId.trim()) {
        showToast.error('Transaction ID is required for non-cash payments');
        return;
      }

      // Show confirmation alert
      Alert.alert(
        'Confirm Transaction',
        'Are you sure this transaction is done?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: () => {
              // Update paid amount
              const newPaidAmount = paidAmount + tokenValue;

              const updatedDeal = {
                ...selectedDeal,
                paidAmount: newPaidAmount,
                tokenPayment: {
                  amount: tokenValue,
                  unit: tokenUnit,
                  paymentMode: paymentMode,
                  transactionId: paymentMode !== 'Cash' ? tokenTransactionId : null,
                  remark: remark,
                  date: new Date().toISOString()
                }
              };

              dispatch(updateDeal(updatedDeal));

              // Clear form
              setTokenAmount('');
              setRemark('');
              setTokenTransactionId('');

              // Switch to Full Settlement tab
              setActiveTab('Full Settlement');

              showToast.success('Token payment submitted successfully!');
            }
          }
        ]
      );
    } else {
      showToast.error('Please enter a valid amount');
    }
  };

  const handleAddTransaction = () => {
    const settlementValue = parseFloat(settlementAmount) * getMultiplier(settlementUnit);

    if (!isNaN(settlementValue) && settlementValue > 0) {
      // Validate transaction ID for paid non-cash transactions
      if (transactionStatus === 'Paid' && settlementMode !== 'Cash' && !transactionId.trim()) {
        showToast.error('Transaction ID is required for paid non-cash transactions');
        return;
      }

      // If Paid, show confirmation alert
      if (transactionStatus === 'Paid') {
        Alert.alert(
          'Confirm Transaction',
          'Are you sure this transaction is done?',
          [
            {
              text: 'No',
              style: 'cancel'
            },
            {
              text: 'Yes',
              onPress: () => addTransactionToStore()
            }
          ]
        );
      } else {
        // If Pending, add directly without alert
        addTransactionToStore();
      }
    } else {
      showToast.error('Please enter a valid amount');
    }
  };

  const addTransactionToStore = () => {
    const settlementValue = parseFloat(settlementAmount) * getMultiplier(settlementUnit);

    const newTransaction = {
      id: Date.now(),
      amount: settlementValue,
      unit: settlementUnit,
      paymentMode: settlementMode,
      transactionId: (transactionStatus === 'Paid' && settlementMode !== 'Cash') ? transactionId : null,
      remark: settlementRemark,
      dueDate: dueDate.toISOString(),
      date: new Date().toISOString(),
      status: transactionStatus === 'Paid' ? 'Completed' : 'Pending'
    };

    const existingTransactions = selectedDeal?.settlements || [];

    // Only add to paid amount if status is Paid
    const newPaidAmount = transactionStatus === 'Paid' ? paidAmount + settlementValue : paidAmount;

    const updatedDeal = {
      ...selectedDeal,
      paidAmount: newPaidAmount,
      settlements: [...existingTransactions, newTransaction]
    };

    dispatch(updateDeal(updatedDeal));

    // Clear form and close modal
    setSettlementAmount('');
    setSettlementRemark('');
    setTransactionId('');
    setTransactionStatus('Pending');
    setDueDate(new Date());
    setShowAddTransactionModal(false);

    showToast.success('Transaction added successfully!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCompleteTransaction = (transactionId) => {
    const transaction = selectedDeal?.settlements?.find(t => t.id === transactionId);

    if (!transaction) return;

    // If not cash and no transaction ID, ask for it first
    if (transaction.paymentMode !== 'Cash' && !transaction.transactionId) {
      setCompletingTransactionId(transactionId);
      setCompletingTransactionIdInput('');
      setShowTransactionIdModal(true);
    } else {
      // Cash payment - just show confirmation
      Alert.alert(
        'Mark as Complete',
        'Are you sure you want to mark this transaction as completed?',
        [
          {
            text: 'No',
            style: 'cancel'
          },
          {
            text: 'Yes',
            onPress: () => completeTransactionWithId(transactionId, transaction.transactionId)
          }
        ]
      );
    }
  };

  const handleTransactionIdSubmit = () => {
    if (!completingTransactionIdInput.trim()) {
      showToast.error('Transaction ID is required for non-cash payments');
      return;
    }

    // Close modal and show confirmation
    setShowTransactionIdModal(false);

    setTimeout(() => {
      Alert.alert(
        'Mark as Complete',
        'Are you sure you want to mark this transaction as completed?',
        [
          {
            text: 'No',
            style: 'cancel',
            onPress: () => {
              setCompletingTransactionId(null);
              setCompletingTransactionIdInput('');
            }
          },
          {
            text: 'Yes',
            onPress: () => {
              completeTransactionWithId(completingTransactionId, completingTransactionIdInput.trim());
              setCompletingTransactionId(null);
              setCompletingTransactionIdInput('');
            }
          }
        ]
      );
    }, 300);
  };

  const completeTransactionWithId = (transactionId, transId) => {
    const updatedSettlements = selectedDeal.settlements.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          status: 'Completed',
          transactionId: transId,
          completedDate: new Date().toISOString()
        };
      }
      return t;
    });

    // Calculate new paid amount (add only this transaction amount)
    const transaction = selectedDeal.settlements.find(t => t.id === transactionId);
    const newPaidAmount = paidAmount + transaction.amount;

    const updatedDeal = {
      ...selectedDeal,
      paidAmount: newPaidAmount,
      settlements: updatedSettlements
    };

    dispatch(updateDeal(updatedDeal));
    showToast.success('Transaction marked as completed!');
  };

  const handleFullSettlement = () => {
    // Validate transaction ID for non-cash payments
    if (fullSettlementMode !== 'Cash' && !fullSettlementTransactionId.trim()) {
      showToast.error('Transaction ID is required for non-cash payments');
      return;
    }

    // Show confirmation alert
    Alert.alert(
      'Confirm Full Settlement',
      'Are you sure this transaction is done?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => {
            const newTransaction = {
              id: Date.now(),
              amount: remainingAmount,
              unit: 'Rupees',
              paymentMode: fullSettlementMode,
              transactionId: fullSettlementMode !== 'Cash' ? fullSettlementTransactionId : null,
              remark: fullSettlementRemark,
              dueDate: new Date().toISOString(),
              date: new Date().toISOString(),
              status: 'Completed',
              completedDate: new Date().toISOString()
            };

            const existingTransactions = selectedDeal?.settlements || [];
            const newPaidAmount = dealAmount; // Full settlement means paid amount = deal amount

            const updatedDeal = {
              ...selectedDeal,
              paidAmount: newPaidAmount,
              settlements: [...existingTransactions, newTransaction]
            };

            dispatch(updateDeal(updatedDeal));

            // Clear form and close modal
            setFullSettlementMode('UPI');
            setFullSettlementTransactionId('');
            setFullSettlementRemark('');
            setShowFullSettlementModal(false);

            showToast.success('Full settlement completed successfully!');
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 160, marginTop: 6 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Amount Card - Full Width */}
      <BalanceCard amount={dealAmount} label="Total Amount" remaining={remainingAmount} />

      {/* Action Buttons */}
      <View className="flex-row justify-between mb-6 mt-2 border border-gray-300 py-5 px-3 rounded-2xl">
        <TouchableOpacity
          className="w-[23%] items-center gap-2"
          onPress={() => setActiveTab('Negotiation')}
        >
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: activeTab === 'Negotiation' ? '#9A8CFC' : '#414141' }}
          >
            <ArrowDown size={22} color="#fff" />
          </View>
          <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-3" numberOfLines={1}>
            Negotiation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[23%] items-center gap-2"
          onPress={() => handleTabClick('Token')}
        >
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: activeTab === 'Token' ? '#9A8CFC' : '#414141' }}
          >
            <ArrowUp size={22} color="#fff" />
          </View>
          <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-3" numberOfLines={1}>
            Token
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[23%] items-center gap-2"
          onPress={() => handleTabClick('Full Settlement')}
        >
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: activeTab === 'Full Settlement' ? '#9A8CFC' : '#414141' }}
          >
            <RefreshCw size={22} color="#fff" />
          </View>
          <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-[10px]" numberOfLines={2}>
            Full Settlement
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-[23%] items-center gap-2"
          onPress={() => handleTabClick('History')}
        >
          <View
            className="w-14 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: activeTab === 'History' ? '#9A8CFC' : '#414141' }}
          >
            <History size={22} color="#fff" />
          </View>
          <Text className="text-[10px] font-medium text-[#3E3E3E] text-center leading-3" numberOfLines={1}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Content Based on Active Tab */}
      {activeTab === 'Negotiation' && (
        <>
          {/* Price Input Fields */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Property Expected Price</Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-gray-800"
                  placeholder="eg 1000"
                  placeholderTextColor="#d1d5db"
                  keyboardType="numeric"
                  value={expectedPrice}
                  onChangeText={setExpectedPrice}
                />
                <TouchableOpacity
                  className="flex-row items-center px-3 py-3 border-l border-gray-200"
                  onPress={() => setShowExpectedModal(true)}
                >
                  <Text className="text-[13px] font-semibold text-gray-600 mr-1">{expectedUnit.slice(0, 2)}</Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Customer Offer</Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-gray-800"
                  placeholder="eg 200"
                  placeholderTextColor="#d1d5db"
                  keyboardType="numeric"
                  value={customerOffer}
                  onChangeText={setCustomerOffer}
                />
                <TouchableOpacity
                  className="flex-row items-center px-3 py-3 border-l border-gray-200"
                  onPress={() => setShowCustomerModal(true)}
                >
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
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-gray-800"
                  placeholder="eg 1000"
                  placeholderTextColor="#d1d5db"
                  keyboardType="numeric"
                  value={ownerCounter}
                  onChangeText={setOwnerCounter}
                />
                <TouchableOpacity
                  className="flex-row items-center px-3 py-3 border-l border-gray-200"
                  onPress={() => setShowOwnerModal(true)}
                >
                  <Text className="text-[13px] font-semibold text-gray-600 mr-1">{ownerUnit.slice(0, 2)}</Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-[#3E3E3E] mb-2">Final</Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-gray-800"
                  placeholder="eg 200"
                  placeholderTextColor="#d1d5db"
                  keyboardType="numeric"
                  value={finalPrice}
                  onChangeText={setFinalPrice}
                />
                <TouchableOpacity
                  className="flex-row items-center px-3 py-3 border-l border-gray-200"
                  onPress={() => setShowFinalModal(true)}
                >
                  <Text className="text-[13px] font-semibold text-gray-600 mr-1">{finalUnit.slice(0, 2)}</Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Complete Negotiation Button */}
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              className="w-[23%] bg-black rounded-2xl py-4 items-center justify-center"
              onPress={handleSave}
            >
              <Text className="text-base font-semibold text-white">Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-[#9A8CFC] rounded-2xl py-4 items-center justify-center"
              onPress={handleCompleteNegotiation}
            >
              <Text className="text-base font-semibold text-white">Complete Negotiation</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {activeTab === 'Token' && (
        <View className="px-1">
          {/* Token Amount */}
          <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Token Amount</Text>
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200">
                <TextInput
                  className="flex-1 py-4 px-3 text-base text-gray-800"
                  placeholder="Enter Amount"
                  placeholderTextColor="#d1d5db"
                  keyboardType="numeric"
                  value={tokenAmount}
                  onChangeText={setTokenAmount}
                />
                <TouchableOpacity
                  className="flex-row items-center px-6 py-3 border-l border-gray-200"
                  onPress={() => setShowTokenUnitModal(true)}
                >
                  <Text className="text-[13px] font-semibold text-gray-600 mr-1">{tokenUnit.slice(0, 2)}</Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Payment Mode */}
          <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Payment Mode</Text>
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-4 mb-3"
            onPress={() => setShowPaymentModeModal(true)}
          >
            <Text className="flex-1 text-base text-gray-800">{paymentMode}</Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Transaction ID (if not Cash) */}
          {paymentMode !== 'Cash' && (
            <>
              <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Transaction ID *</Text>
              <TextInput
                className="bg-white rounded-2xl border border-gray-200 px-4 py-4 text-base text-gray-800 mb-3"
                placeholder="Enter Transaction ID"
                placeholderTextColor="#d1d5db"
                value={tokenTransactionId}
                onChangeText={setTokenTransactionId}
              />
            </>
          )}

          {/* Remark */}
          <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Remark</Text>
          <TextInput
            className="bg-white rounded-2xl border border-gray-200 px-4 py-4 text-base text-gray-800 mb-6"
            placeholder="Enter Remark"
            placeholderTextColor="#d1d5db"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={remark}
            onChangeText={setRemark}
          />

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-[#9A8CFC] rounded-2xl py-4 items-center"
            onPress={handleTokenSubmit}
          >
            <Text className="text-base font-semibold text-white">Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'Full Settlement' && (
        <View className="px-1">
          {/* Schedule Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#3E3E3E]">Schedule</Text>
            <TouchableOpacity
              className="bg-[#9A8CFC] rounded-full px-6 py-2 flex-row items-center gap-2"
              onPress={() => setShowAddTransactionModal(true)}
            >
              <Text className="text-white text-2xl font-light">+</Text>
              <Text className="text-white font-semibold">ADD</Text>
            </TouchableOpacity>
          </View>

          {/* Transactions List */}
          {selectedDeal?.settlements && selectedDeal.settlements.length > 0 ? (
            selectedDeal.settlements.map((transaction) => (
              <View key={transaction.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                {/* Header: Payment Mode and Status */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-semibold text-gray-800">{transaction.paymentMode}</Text>
                  <Text className={`text-base font-semibold ${transaction.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>
                    {transaction.status}
                  </Text>
                </View>

                {/* Amount and Due Date Row */}
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-sm text-gray-500 mb-1">Paid</Text>
                    <Text className="text-xl font-bold text-gray-800">₹{transaction.amount.toLocaleString('en-IN')}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-500 mb-1">Due Date</Text>
                    <Text className="text-base font-semibold text-gray-800">{formatDate(transaction.dueDate)}</Text>
                  </View>
                </View>

                {/* Mark as Complete Button (for Pending) */}
                {transaction.status === 'Pending' && (
                  <TouchableOpacity
                    className="bg-[#9A8CFC] rounded-xl py-3 items-center mt-4"
                    onPress={() => handleCompleteTransaction(transaction.id)}
                  >
                    <Text className="text-white font-semibold text-base">Mark as Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View className="items-center py-20">
              <Text className="text-gray-500">No transactions yet. Add your first transaction!</Text>
            </View>
          )}

          {/* Full Settlement Button - Only show if remaining amount > 0 */}
          {remainingAmount > 0 && (
            <TouchableOpacity
              className="bg-[#9A8CFC] rounded-2xl py-4 items-center mt-8 mb-4"
              onPress={() => setShowFullSettlementModal(true)}
            >
              <Text className="text-base font-semibold text-white">Full Settlement</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTab === 'History' && (
        <View className="px-1">
          <Text className="text-lg font-bold text-[#3E3E3E] mb-4">Payment History</Text>

          {/* Token Payment History */}
          {selectedDeal?.tokenPayment && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Token Payment</Text>
              <View className="bg-white rounded-2xl border border-gray-200 p-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-semibold text-gray-800">{selectedDeal.tokenPayment.paymentMode}</Text>
                  <Text className="text-base font-semibold text-green-500">Completed</Text>
                </View>
                <View className="flex-row justify-between items-end">
                  <View>
                    <Text className="text-sm text-gray-500 mb-1">Amount</Text>
                    <Text className="text-xl font-bold text-gray-800">₹{selectedDeal.tokenPayment.amount.toLocaleString('en-IN')}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm text-gray-500 mb-1">Date</Text>
                    <Text className="text-base font-semibold text-gray-800">{formatDate(selectedDeal.tokenPayment.date)}</Text>
                  </View>
                </View>
                {selectedDeal.tokenPayment.transactionId && (
                  <View className="mt-3">
                    <Text className="text-sm text-gray-500 mb-1">Transaction ID</Text>
                    <Text className="text-base text-gray-700">{selectedDeal.tokenPayment.transactionId}</Text>
                  </View>
                )}
                {selectedDeal.tokenPayment.remark && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <Text className="text-sm text-gray-500 mb-1">Remark</Text>
                    <Text className="text-base text-gray-700">{selectedDeal.tokenPayment.remark}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Completed Settlements */}
          {selectedDeal?.settlements && selectedDeal.settlements.filter(t => t.status === 'Completed').length > 0 ? (
            <>
              <Text className="text-base font-semibold text-[#3E3E3E] mb-3">Completed Settlements</Text>
              {selectedDeal.settlements
                .filter(transaction => transaction.status === 'Completed')
                .map((transaction) => (
                  <View key={transaction.id} className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-lg font-semibold text-gray-800">{transaction.paymentMode}</Text>
                      <Text className="text-base font-semibold text-green-500">Completed</Text>
                    </View>

                    <View className="flex-row justify-between items-end mb-3">
                      <View>
                        <Text className="text-sm text-gray-500 mb-1">Amount</Text>
                        <Text className="text-xl font-bold text-gray-800">₹{transaction.amount.toLocaleString('en-IN')}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm text-gray-500 mb-1">Completed On</Text>
                        <Text className="text-base font-semibold text-gray-800">{formatDate(transaction.completedDate)}</Text>
                      </View>
                    </View>

                    {transaction.transactionId && (
                      <View className="mb-2">
                        <Text className="text-sm text-gray-500 mb-1">Transaction ID</Text>
                        <Text className="text-base text-gray-700">{transaction.transactionId}</Text>
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
            </>
          ) : (
            !selectedDeal?.tokenPayment && (
              <View className="items-center py-10">
                <Text className="text-gray-500">No completed transactions yet.</Text>
              </View>
            )
          )}
        </View>
      )}

      {/* Unit Selection Modals */}
      <Modal visible={showExpectedModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowExpectedModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setExpectedUnit(unit);
                  setShowExpectedModal(false);
                }}
              >
                <Text className={`text-base ${expectedUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showCustomerModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowCustomerModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setCustomerUnit(unit);
                  setShowCustomerModal(false);
                }}
              >
                <Text className={`text-base ${customerUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showOwnerModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowOwnerModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setOwnerUnit(unit);
                  setShowOwnerModal(false);
                }}
              >
                <Text className={`text-base ${ownerUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showFinalModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowFinalModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setFinalUnit(unit);
                  setShowFinalModal(false);
                }}
              >
                <Text className={`text-base ${finalUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Token Unit Modal */}
      <Modal visible={showTokenUnitModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowTokenUnitModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setTokenUnit(unit);
                  setShowTokenUnitModal(false);
                }}
              >
                <Text className={`text-base ${tokenUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment Mode Modal */}
      <Modal visible={showPaymentModeModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowPaymentModeModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Payment Mode</Text>
            {paymentModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setPaymentMode(mode);
                  setShowPaymentModeModal(false);
                }}
              >
                <Text className={`text-base ${paymentMode === mode ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal visible={showAddTransactionModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '90%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Add Transaction</Text>
              <TouchableOpacity onPress={() => setShowAddTransactionModal(false)}>
                <Text className="text-2xl text-gray-500">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Amount</Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 mb-4">
                <TextInput
                  className="flex-1 py-3 px-3 text-base text-gray-800"
                  placeholder="Enter Amount"
                  placeholderTextColor="#d1d5db"
                  keyboardType="numeric"
                  value={settlementAmount}
                  onChangeText={setSettlementAmount}
                />
                <TouchableOpacity
                  className="flex-row items-center px-3 py-3 border-l border-gray-200"
                  onPress={() => setShowSettlementUnitModal(true)}
                >
                  <Text className="text-[13px] font-semibold text-gray-600 mr-1">{settlementUnit.slice(0, 2)}</Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Payment Mode */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Payment Mode</Text>
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4"
                onPress={() => setShowSettlementModeModal(true)}
              >
                <Text className="flex-1 text-base text-gray-800">{settlementMode}</Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {/* Status */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Status</Text>
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4"
                onPress={() => setShowStatusModal(true)}
              >
                <Text className="flex-1 text-base text-gray-800">{transactionStatus}</Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {/* Transaction ID (if Paid and not Cash) */}
              {transactionStatus === 'Paid' && settlementMode !== 'Cash' && (
                <>
                  <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Transaction ID *</Text>
                  <TextInput
                    className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-4"
                    placeholder="Enter Transaction ID"
                    placeholderTextColor="#d1d5db"
                    value={transactionId}
                    onChangeText={setTransactionId}
                  />
                </>
              )}

              {/* Due Date */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Due Date</Text>
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="flex-1 text-base text-gray-800">
                  {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setDueDate(selectedDate);
                    }
                  }}
                />
              )}

              {/* Remark */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Remark</Text>
              <TextInput
                className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-6"
                placeholder="Enter Remark"
                placeholderTextColor="#d1d5db"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={settlementRemark}
                onChangeText={setSettlementRemark}
              />

              {/* Submit Button */}
              <TouchableOpacity
                className="bg-[#9A8CFC] rounded-2xl py-4 items-center"
                onPress={handleAddTransaction}
              >
                <Text className="text-base font-semibold text-white">Add Transaction</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Settlement Unit Modal */}
      <Modal visible={showSettlementUnitModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowSettlementUnitModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setSettlementUnit(unit);
                  setShowSettlementUnitModal(false);
                }}
              >
                <Text className={`text-base ${settlementUnit === unit ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Settlement Mode Modal */}
      <Modal visible={showSettlementModeModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowSettlementModeModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Payment Mode</Text>
            {paymentModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setSettlementMode(mode);
                  setShowSettlementModeModal(false);
                }}
              >
                <Text className={`text-base ${settlementMode === mode ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Status Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Status</Text>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setTransactionStatus(status);
                  setShowStatusModal(false);
                }}
              >
                <Text className={`text-base ${transactionStatus === status ? 'text-[#9A8CFC] font-semibold' : 'text-gray-700'}`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Transaction ID Modal for Completing Pending Transactions */}
      <Modal visible={showTransactionIdModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Transaction ID Required</Text>
              <TouchableOpacity onPress={() => {
                setShowTransactionIdModal(false);
                setCompletingTransactionId(null);
                setCompletingTransactionIdInput('');
              }}>
                <Text className="text-2xl text-gray-500">×</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Transaction ID *</Text>
            <TextInput
              className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-6"
              placeholder="Enter Transaction ID"
              placeholderTextColor="#d1d5db"
              value={completingTransactionIdInput}
              onChangeText={setCompletingTransactionIdInput}
              autoFocus
            />

            <TouchableOpacity
              className="bg-[#C4B5FD] rounded-2xl py-4 items-center"
              onPress={handleTransactionIdSubmit}
            >
              <Text className="text-base font-semibold text-white">Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Settlement Modal */}
      <Modal visible={showFullSettlementModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Full Settlement</Text>
              <TouchableOpacity onPress={() => setShowFullSettlementModal(false)}>
                <Text className="text-2xl text-gray-500">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Remaining Amount Display */}
              <View className="bg-purple-50 rounded-2xl p-4 mb-4">
                <Text className="text-sm text-gray-600 mb-1">Remaining Amount</Text>
                <Text className="text-2xl font-bold text-[#9A8CFC]">₹{remainingAmount.toLocaleString('en-IN')}</Text>
              </View>

              {/* Payment Mode */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Payment Mode</Text>
              <TouchableOpacity
                className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 py-3 mb-4"
                onPress={() => setShowFullSettlementModeModal(true)}
              >
                <Text className="flex-1 text-base text-gray-800">{fullSettlementMode}</Text>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {/* Transaction ID (if not Cash) */}
              {fullSettlementMode !== 'Cash' && (
                <>
                  <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Transaction ID *</Text>
                  <TextInput
                    className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-4"
                    placeholder="Enter Transaction ID"
                    placeholderTextColor="#d1d5db"
                    value={fullSettlementTransactionId}
                    onChangeText={setFullSettlementTransactionId}
                  />
                </>
              )}

              {/* Remark */}
              <Text className="text-sm font-semibold text-[#3E3E3E] mb-2">Remark</Text>
              <TextInput
                className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-base text-gray-800 mb-6"
                placeholder="Enter Remark"
                placeholderTextColor="#d1d5db"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={fullSettlementRemark}
                onChangeText={setFullSettlementRemark}
              />

              {/* Submit Button */}
              <TouchableOpacity
                className="bg-[#9A8CFC] rounded-2xl py-4 items-center"
                onPress={handleFullSettlement}
              >
                <Text className="text-base font-semibold text-white">Complete Full Settlement</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Settlement Mode Modal */}
      <Modal visible={showFullSettlementModeModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowFullSettlementModeModal(false)}
        >
          <View className="bg-white rounded-2xl w-[80%] p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Select Payment Mode</Text>
            {paymentModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setFullSettlementMode(mode);
                  setShowFullSettlementModeModal(false);
                }}
              >
                <Text className={`text-base ${fullSettlementMode === mode ? 'text-[#C4B5FD] font-semibold' : 'text-gray-700'}`}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}
