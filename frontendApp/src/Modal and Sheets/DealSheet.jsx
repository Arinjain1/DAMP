import {
    BadgeCheck,
    Calendar,
    Check,
    CheckCircle,
    Coffee,
    FileCheck,
    FileText,
    IndianRupee,
    Phone,
    Printer,
    X
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper for currency formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const DealSheet = ({ deal, properties, customers, onClose, onUpdateDeal, onCloseDeal, onAddTask }) => {
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingNote, setMeetingNote] = useState('');
  const [showDocModal, setShowDocModal] = useState(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [isSettling, setIsSettling] = useState(false);
  const [settleAmount, setSettleAmount] = useState('0');
  
  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    if (deal?.financials) {
      setFinalPrice(deal.financials.finalPrice);
      setTokenAmount(deal.financials.tokenAmount);
      setPendingAmount(deal.financials.pendingAmount);
    } else if (deal) {
      const property = properties.find(p => p.id === deal.propertyId);
      setFinalPrice(property?.price || 0);
      setTokenAmount(0);
      setPendingAmount(property?.price || 0);
    }
  }, [deal, properties]);

  if (!deal) return null;

  const property = properties.find(p => p.id === deal.propertyId);
  const customer = customers.find(c => c.id === deal.customerId);

  // --- Handlers ---

  const handleScheduleMeeting = () => {
    if (!meetingDate) return Alert.alert("Error", "Select a date");
    const newMeeting = { id: Date.now(), date: meetingDate, note: meetingNote, status: 'Scheduled' };
    
    // Mock update calls
    onUpdateDeal(deal.id, { ...deal, meetings: [...(deal.meetings || []), newMeeting] });
    onAddTask({
      customerId: customer?.id,
      propertyId: property?.id,
      date: meetingDate,
      note: `Meeting for Deal: ${property?.title} - ${meetingNote}`,
      type: 'Meeting',
      status: 'Pending'
    });
    
    setMeetingDate('');
    setMeetingNote('');
    Alert.alert("Success", "Meeting Scheduled & Added to Tasks!");
  };

  // Date/Time picker handlers
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event?.type === 'set' && selectedDate) {
        setTempDate(selectedDate);
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
        setMeetingDate(selectedDate.toISOString());
      }
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (event?.type === 'set' && selectedTime) {
      const combinedDateTime = new Date(tempDate);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());
      setMeetingDate(combinedDateTime.toISOString());
    } else if (Platform.OS === 'android' && event?.type === 'dismissed') {
      setMeetingDate(tempDate.toISOString());
    }
  };

  const handleMeetingOutcome = (success) => {
    if (success) {
      onUpdateDeal(deal.id, { ...deal, stage: 'Negotiation' });
    } else {
      Alert.alert(
        "Drop Deal?",
        "Mark Deal as Lost/Dropped?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Yes, Drop", 
            style: 'destructive',
            onPress: () => {
              onUpdateDeal(deal.id, { ...deal, stage: 'Dropped' });
              onClose();
            }
          }
        ]
      );
    }
  };

  const handleConfirmToken = () => {
    if (tokenAmount <= 0) return Alert.alert("Error", "Enter valid token amount");
    const pending = finalPrice - tokenAmount;
    onUpdateDeal(deal.id, {
      ...deal,
      stage: 'Agreement',
      financials: { finalPrice, tokenAmount, pendingAmount: pending, tokenDate: new Date().toISOString() }
    });
    setShowDocModal('Receipt');
  };

  const handleSettlementSubmit = () => {
    const amount = parseFloat(settleAmount);
    if (isNaN(amount) || amount <= 0) return Alert.alert("Error", "Please enter valid amount");

    const newPending = pendingAmount - amount;
    const newTotalPaid = tokenAmount + amount;

    setPendingAmount(newPending);
    setTokenAmount(newTotalPaid);

    if (newPending <= 0) {
      const updatedDeal = {
        ...deal,
        financials: { ...deal.financials, tokenAmount: newTotalPaid, pendingAmount: 0 }
      };
      
      Alert.alert(
        "Full Payment Received",
        `Close Deal for ${property?.title}?`,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Close Deal", 
            onPress: () => onCloseDeal(updatedDeal) 
          }
        ]
      );
    } else {
      onUpdateDeal(deal.id, {
        ...deal,
        financials: { ...deal.financials, tokenAmount: newTotalPaid, pendingAmount: newPending }
      });
      setIsSettling(false);
      setSettleAmount('0');
      Alert.alert("Success", `Payment Recorded. Pending Balance: ${formatCurrency(newPending)}`);
    }
  };

  const makeCall = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  // --- Sub Components ---

  const DealStage = ({ label, active, completed, icon: Icon }) => (
    <View className="flex-col items-center flex-1 relative z-10">
      <View className={`w-[8vw] h-[8vw] rounded-full flex items-center justify-center border-2 ${active ? 'bg-indigo-600 border-indigo-600' : completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'}`}>
        <Icon size={14} color={active || completed ? 'white' : '#d1d5db'} />
      </View>
      <Text className={`text-[2.5vw] font-bold mt-[0.5vh] ${active ? 'text-indigo-600' : completed ? 'text-green-600' : 'text-gray-300'}`}>
        {label}
      </Text>
    </View>
  );

  const PartyCard = ({ title, name, phone, type }) => (
    <View className="bg-white p-[3vw] rounded-xl border border-gray-100 flex-row items-center justify-between shadow-sm mb-2">
      <View className="flex-row items-center gap-[3vw]">
        <View className={`w-[10vw] h-[10vw] rounded-full flex items-center justify-center ${type === 'owner' ? 'bg-amber-100' : 'bg-blue-100'}`}>
          <Text className={`font-bold text-[3.5vw] ${type === 'owner' ? 'text-amber-700' : 'text-blue-700'}`}>
            {name?.charAt(0)}
          </Text>
        </View>
        <View>
          <Text className="text-[2.5vw] text-gray-400 font-bold uppercase tracking-wider">{title}</Text>
          <Text className="text-[3.5vw] font-bold text-gray-900">{name}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => makeCall(phone)} className="bg-green-50 p-[2vw] rounded-full border border-green-100">
        <Phone size={16} color="#16a34a" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white w-full h-[90vh] rounded-t-[8vw] shadow-2xl relative flex-col overflow-hidden">
          
          {/* Header */}
          <View className="bg-gray-900 p-[6vw] pb-[12vw]">
            <View className="flex-row justify-between items-start mb-[4vw]">
              <View>
                <View className={`self-start px-[2vw] py-[0.5vw] rounded ${deal.stage === 'Closed' ? 'bg-green-500' : deal.stage === 'Dropped' ? 'bg-red-500' : 'bg-amber-400'}`}>
                    <Text className={`text-[2.5vw] font-black uppercase ${deal.stage === 'Closed' || deal.stage === 'Dropped' ? 'text-white' : 'text-black'}`}>
                        {deal.stage === 'Closed' ? 'Deal Closed' : deal.stage === 'Dropped' ? 'Deal Dropped' : 'Deal in Progress'}
                    </Text>
                </View>
                <Text className="text-[5vw] font-black text-white mt-[1vw]">Deal #{deal.id}</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-white/20 p-[2vw] rounded-full">
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Stage Tracker */}
            <View className="flex-row items-center justify-between relative px-[2vw]">
              <View className="absolute top-[4vw] left-0 right-0 h-[0.5vw] bg-gray-700 z-0" />
              <DealStage icon={Check} label="Lead" completed={true} />
              <DealStage icon={Coffee} label="Meeting" active={deal.stage === 'Meeting'} completed={['Meeting', 'Negotiation', 'Agreement', 'Closed'].includes(deal.stage)} />
              <DealStage icon={IndianRupee} label="Token" active={deal.stage === 'Negotiation'} completed={['Negotiation', 'Agreement', 'Closed'].includes(deal.stage)} />
              <DealStage icon={FileCheck} label="Close" active={deal.stage === 'Agreement' || deal.stage === 'Closed'} completed={deal.stage === 'Closed'} />
            </View>
          </View>

          {/* Content Area */}
          <ScrollView className="flex-1 bg-gray-50 px-[6vw] pt-[6vw] -mt-[4vh] rounded-t-[6vw]" contentContainerStyle={{ paddingBottom: 40 }}>
            
            {/* Property Card */}
            <View className="bg-white p-[4vw] rounded-2xl shadow-sm border border-gray-100 flex-row gap-[4vw] mb-[6vw]">
              <Image source={{ uri: property?.image }} className="w-[20vw] h-[20vw] rounded-xl bg-gray-200" />
              <View className="flex-1 justify-center">
                <Text className="font-bold text-gray-900 text-[4vw]" numberOfLines={1}>{property?.title}</Text>
                <Text className="text-[3vw] text-gray-500">{property?.location}</Text>
                <View className="mt-[2vw]">
                  <Text className="font-black text-indigo-600 text-[4vw]">{formatCurrency(property?.price)}</Text>
                </View>
              </View>
            </View>

            {/* STAGE: MEETING */}
            {deal.stage === 'Meeting' && (
              <View className="bg-white p-[5vw] rounded-2xl shadow-sm border border-gray-100 mb-[4vw]">
                <View className="flex-row items-center gap-[2vw] mb-[4vw]">
                    <Calendar size={18} color="#2563eb" />
                    <Text className="font-bold text-gray-900 text-[4vw]">Coordination Center</Text>
                </View>

                <View className="mb-[4vw]">
                  <Text className="text-[3vw] text-gray-500 mb-[2vw]">Coordinate time with parties:</Text>
                  <PartyCard title="Property Owner" name={property?.owner} phone={property?.ownerPhone} type="owner" />
                  <PartyCard title="Prospective Buyer" name={customer?.name} phone={customer?.phone} type="buyer" />
                </View>

                <View className="bg-blue-50 p-[4vw] rounded-xl border border-blue-100 mb-[4vw]">
                  <Text className="text-[3vw] font-bold text-blue-800 uppercase tracking-wide mb-[3vw]">Schedule Meeting</Text>
                  
                  <TouchableOpacity
                    onPress={() => {
                      setTempDate(meetingDate ? new Date(meetingDate) : new Date());
                      setShowDatePicker(true);
                    }}
                    className="bg-white border border-blue-200 p-[3vw] rounded-xl mb-[3vw]"
                  >
                    <Text className="text-[3.5vw] font-bold text-gray-700">
                      {meetingDate ? new Date(meetingDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Select Date & Time'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TextInput 
                    placeholder="Agenda / Notes" 
                    value={meetingNote} 
                    onChangeText={setMeetingNote}
                    className="bg-white border border-blue-200 p-[3vw] rounded-xl text-[3.5vw] font-medium text-gray-700 mb-[3vw]"
                  />
                  
                  <TouchableOpacity onPress={handleScheduleMeeting} className="w-full bg-blue-600 py-[3vw] rounded-xl shadow-lg shadow-blue-200 items-center">
                    <Text className="text-white font-bold text-[3.5vw]">Confirm Schedule</Text>
                  </TouchableOpacity>
                </View>

                {/* Date/Time Pickers */}
                {showDatePicker && (
                  <DateTimePicker
                    value={tempDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
                {showTimePicker && (
                  <DateTimePicker
                    value={tempDate || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                  />
                )}

                {deal.meetings && deal.meetings.length > 0 && (
                   <View>
                      <Text className="text-[2.5vw] font-bold text-gray-400 uppercase mb-[2vw]">Meeting Outcome</Text>
                      <View className="flex-row gap-[2vw]">
                        <TouchableOpacity onPress={() => handleMeetingOutcome(false)} className="flex-1 border border-gray-200 p-[3vw] rounded-xl items-center bg-white">
                            <Text className="font-bold text-gray-500 text-[3.5vw]">Not Interested</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleMeetingOutcome(true)} className="flex-1 bg-green-600 p-[3vw] rounded-xl shadow-md items-center">
                            <Text className="font-bold text-white text-[3.5vw]">Interested (Next)</Text>
                        </TouchableOpacity>
                      </View>
                   </View>
                )}
              </View>
            )}

            {/* STAGE: NEGOTIATION */}
            {deal.stage === 'Negotiation' && (
              <View className="bg-white p-[5vw] rounded-2xl shadow-sm border border-gray-100 mb-[4vw]">
                 <View className="flex-row items-center gap-[2vw] mb-[4vw]">
                    <IndianRupee size={18} color="#d97706" />
                    <Text className="font-bold text-gray-900 text-[4vw]">Financials</Text>
                </View>

                <View className="gap-[4vw]">
                    <View>
                        <Text className="text-[2.5vw] font-bold text-gray-400 uppercase">Final Agreed Price</Text>
                        <View className="flex-row items-center border-b border-gray-200 py-[2vw]">
                            <Text className="font-black text-gray-400 text-[5vw] mr-2">₹</Text>
                            <TextInput 
                                value={String(finalPrice)} 
                                onChangeText={(v) => setFinalPrice(Number(v))} 
                                keyboardType="numeric"
                                className="flex-1 font-black text-[5vw] text-gray-900"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-[2.5vw] font-bold text-gray-400 uppercase">Token Amount Received</Text>
                        <View className="flex-row items-center border-b border-gray-200 py-[2vw]">
                            <Text className="font-black text-gray-400 text-[5vw] mr-2">₹</Text>
                            <TextInput 
                                value={String(tokenAmount)} 
                                onChangeText={(v) => setTokenAmount(Number(v))} 
                                keyboardType="numeric"
                                placeholder="Enter Token"
                                className="flex-1 font-black text-[5vw] text-green-600"
                            />
                        </View>
                    </View>

                    <View className="bg-gray-50 p-[4vw] rounded-xl flex-row justify-between items-center">
                        <Text className="text-[3vw] font-bold text-gray-500">Pending Balance</Text>
                        <Text className="text-[4.5vw] font-black text-gray-900">{formatCurrency(finalPrice - tokenAmount)}</Text>
                    </View>

                    <TouchableOpacity onPress={handleConfirmToken} className="w-full bg-amber-500 py-[4vw] rounded-xl shadow-lg flex-row items-center justify-center gap-[2vw]">
                        <CheckCircle size={18} color="white"/>
                        <Text className="text-white font-bold text-[3.5vw]">Accept Token & Proceed</Text>
                    </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STAGE: AGREEMENT / CLOSED */}
            {(deal.stage === 'Agreement' || deal.stage === 'Closed') && (
              <View className="bg-white p-[5vw] rounded-2xl shadow-sm border border-gray-100 mb-[4vw]">
                <View className="flex-row items-center gap-[2vw] mb-[4vw]">
                    <FileText size={18} color="#9333ea" />
                    <Text className="font-bold text-gray-900 text-[4vw]">Documentation</Text>
                </View>

                <View className="flex-row gap-[3vw] mb-[4vw]">
                    <TouchableOpacity onPress={() => setShowDocModal('Receipt')} className="flex-1 bg-gray-50 p-[3vw] rounded-xl border border-gray-100">
                         <FileCheck size={20} color="#16a34a" style={{ marginBottom: 8 }}/>
                         <Text className="text-[3vw] font-bold text-gray-900">Token Receipt</Text>
                         <Text className="text-[2.5vw] text-gray-500">View Generated</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowDocModal('Agreement')} className="flex-1 bg-gray-50 p-[3vw] rounded-xl border border-gray-100">
                         <FileText size={20} color="#2563eb" style={{ marginBottom: 8 }}/>
                         <Text className="text-[3vw] font-bold text-gray-900">Sale Agreement</Text>
                         <Text className="text-[2.5vw] text-gray-500">Draft Ready</Text>
                    </TouchableOpacity>
                </View>

                {deal.stage !== 'Closed' && (
                    <View className="bg-green-50 p-[4vw] rounded-xl border border-green-100 gap-[4vw]">
                        <View className="flex-row justify-between items-center pb-[3vw] border-b border-green-200">
                            <Text className="text-[3vw] font-bold text-green-800">Pending Balance</Text>
                            <Text className="text-[4.5vw] font-black text-green-900">{formatCurrency(pendingAmount)}</Text>
                        </View>

                        {!isSettling ? (
                             <TouchableOpacity onPress={() => { setIsSettling(true); setSettleAmount(String(pendingAmount)); }} className="w-full bg-green-600 py-[3vw] rounded-xl shadow-lg flex-row items-center justify-center gap-[2vw]">
                                <BadgeCheck size={18} color="white"/>
                                <Text className="text-white font-bold text-[3.5vw]">Settle & Close Deal</Text>
                             </TouchableOpacity>
                        ) : (
                            <View className="bg-white p-[3vw] rounded-xl border border-green-200">
                                <Text className="text-[2.5vw] font-bold text-green-700 uppercase mb-[2vw]">Enter Amount Received</Text>
                                <TextInput 
                                    keyboardType="numeric"
                                    value={settleAmount}
                                    onChangeText={setSettleAmount}
                                    className="w-full bg-gray-50 border border-gray-200 p-[3vw] rounded-lg text-[4.5vw] font-black text-gray-900 mb-[3vw]"
                                />
                                <View className="flex-row gap-[2vw]">
                                    <TouchableOpacity onPress={() => setIsSettling(false)} className="flex-1 bg-gray-100 py-[2vw] rounded-lg items-center">
                                        <Text className="text-gray-600 font-bold text-[3vw]">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSettlementSubmit} className="flex-[2] bg-green-600 py-[2vw] rounded-lg items-center">
                                        <Text className="text-white font-bold text-[3vw]">
                                            {parseFloat(settleAmount) >= pendingAmount ? 'Full Settle & Close' : 'Record Partial'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {deal.stage === 'Closed' && (
                    <View className="bg-green-100 p-[4vw] rounded-xl items-center border border-green-200">
                        <View className="bg-white w-[14vw] h-[14vw] rounded-full items-center justify-center mb-[3vw] shadow-sm">
                            <Check size={32} color="#16a34a" />
                        </View>
                        <Text className="font-bold text-green-900 text-[4.5vw]">Deal Closed Successfully!</Text>
                        <Text className="text-[3vw] text-green-700 mt-[1vw] text-center">Property marked as sold & commissions recorded.</Text>
                    </View>
                )}
              </View>
            )}

            {/* SPACER for bottom safety */}
            <View className="h-[10vh]" />
          </ScrollView>

          {/* DOCUMENT MODAL OVERLAY */}
          {showDocModal && (
            <View className="absolute inset-0 bg-black/50 z-50 items-center justify-center p-[4vw]">
                <View className="bg-white w-full max-w-md h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex-col">
                    <View className="p-[4vw] border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
                        <Text className="font-bold text-gray-900 text-[4.5vw]">{showDocModal === 'Receipt' ? 'Token Receipt' : 'Sale Agreement'}</Text>
                        <TouchableOpacity onPress={() => setShowDocModal(null)}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView className="flex-1 p-[6vw] bg-white">
                         {/* Content is purely text based here for simulation */}
                         {showDocModal === 'Receipt' ? (
                            <View className="border-2 border-gray-800 p-[4vw]">
                                <Text className="text-[5vw] font-black text-center mb-[6vw] underline">RECEIPT</Text>
                                <Text className="mb-[4vw] text-[3.5vw]">Received with thanks from <Text className="font-bold">{customer?.name}</Text></Text>
                                <Text className="mb-[4vw] text-[3.5vw]">The sum of <Text className="font-bold">{formatCurrency(deal.financials?.tokenAmount || tokenAmount)}</Text></Text>
                                <Text className="mb-[4vw] text-[3.5vw]">Towards token advance for: <Text className="font-bold">{property?.title}</Text></Text>
                                <Text className="mb-[4vw] text-[3.5vw]">Total: {formatCurrency(deal.financials?.finalPrice || finalPrice)}</Text>
                            </View>
                         ) : (
                            <View>
                                <Text className="text-[4vw] font-bold text-center mb-[4vw] uppercase underline">Agreement to Sale</Text>
                                <Text className="mb-[4vw] text-[3.5vw]">BETWEEN: {property?.owner} (SELLER)</Text>
                                <Text className="mb-[4vw] text-[3.5vw]">AND: {customer?.name} (BUYER)</Text>
                                <Text className="mb-[4vw] text-[3.5vw]">Consideration: {formatCurrency(deal.financials?.finalPrice || finalPrice)}</Text>
                            </View>
                         )}
                    </ScrollView>

                    <View className="p-[4vw] border-t border-gray-100 bg-gray-50">
                        <TouchableOpacity className="w-full bg-gray-900 py-[3vw] rounded-xl flex-row items-center justify-center gap-[2vw]">
                            <Printer size={16} color="white" />
                            <Text className="text-white font-bold text-[3.5vw]">Print / Save PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

export default DealSheet;