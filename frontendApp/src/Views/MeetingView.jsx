import { Calendar, CheckCircle, CirclePlus, Clock, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { updateDeal } from '../store/slices/dealsSlice';
// No StyleSheet import needed for NativeWind

export default function MeetingView({ selectedDeal, reminderEnabled, setReminderEnabled, setShowReminderSetAlert }) {
  const dispatch = useDispatch();
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const meetings = selectedDeal.meetings || [];

  const handleAddMeeting = () => {
    setShowMeetingModal(true);
  };

  const handleSaveMeeting = () => {
    if (!meetingTitle.trim()) return;

    const newMeeting = {
      id: Math.random().toString(36).substring(2, 11),
      title: meetingTitle,
      date: meetingDate.toISOString(),
      status: 'upcoming'
    };

    const updatedDeal = {
      ...selectedDeal,
      meetings: [...meetings, newMeeting]
    };

    dispatch(updateDeal(updatedDeal));

    setMeetingTitle('');
    setMeetingDate(new Date());
    setShowMeetingModal(false);
  };

  const handleMarkDone = (meetingId) => {
    const updatedMeetings = meetings.map(m =>
      m.id === meetingId ? { ...m, status: 'completed' } : m
    );

    const updatedDeal = {
      ...selectedDeal,
      meetings: updatedMeetings
    };

    dispatch(updateDeal(updatedDeal));
  };

  const handleReminderToggle = (value) => {
    setReminderEnabled(value);
    const updatedDeal = {
      ...selectedDeal,
      reminderEnabled: value
    };
    dispatch(updateDeal(updatedDeal));

    if (value) {
      setShowReminderSetAlert(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <View className="flex-1 relative">
      <ScrollView 
        className="flex-1" 
        contentContainerClassName="pb-[100px]"
      >
        {/* Schedule Header */}
        <View className="flex-row justify-between items-center mb-[26px]">
          <Text className="text-lg font-bold text-[#1f2937] left-[10px]">Schedule</Text>
          <TouchableOpacity 
            className="flex-row items-center gap-[6px] bg-[#BFB7FD] px-3 py-2 rounded-[20px] border border-[#9A8CFC]" 
            onPress={handleAddMeeting}
          >
            <CirclePlus size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-[13px] font-normal text-white">Add Meeting</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Items */}
        {meetings.length > 0 ? (
          <View className="gap-3 mb-6">
            {[...meetings]
              .sort((a, b) => {
                if (a.status === 'upcoming' && b.status === 'completed') return -1;
                if (a.status === 'completed' && b.status === 'upcoming') return 1;
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                if (a.status === 'upcoming') {
                  return dateA - dateB;
                } else {
                  return dateB - dateA;
                }
              })
              .map((item) => (
                <View
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border border-[#e5e7eb] flex-row justify-between items-center ${
                    item.status === 'completed' ? 'bg-[#f9fafb]' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text 
                      className={`text-lg font-bold text-[#1f2937] mb-1 ${
                        item.status === 'completed' ? 'text-[#6b7280]' : ''
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-[13px] text-[#9ca3af]">
                      {formatDate(item.date)} • {formatTime(item.date)}
                    </Text>
                  </View>
                  {item.status === 'completed' ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <View className="items-end gap-2">
                      <View className="bg-[#fef3c7] px-3 py-1 rounded-lg">
                        <Text className="text-[11px] font-semibold text-[#d97706]">Upcoming</Text>
                      </View>
                      <TouchableOpacity
                        className="py-[2px]"
                        onPress={() => handleMarkDone(item.id)}
                      >
                        <Text className="text-[13px] font-semibold text-[#6b7280] underline">Mark Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
          </View>
        ) : (
          <View className="items-center py-10">
            <Calendar size={40} color="#d1d5db" />
            <Text className="mt-3 text-sm text-[#9ca3af]">No meetings scheduled yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Reminder Toggle at Bottom */}
      <View className="fixed  top-24 bg-white pb-0">
        <View className="bg-white rounded-xl p-4 border border-[#e5e7eb] flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold text-[#1f2937] mb-1">Send me a reminder</Text>
            <Text className="text-[13px] text-[#9ca3af]">For meeting</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleReminderToggle}
            trackColor={{ false: '#d1d5db', true: '#9A8CFC' }}
            thumbColor="#ffffff"
            // NativeWind supports scale, but transform style is often safer for Switch on Android/iOS cross-compat
            style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
          />
        </View>
      </View>

      {/* Add Meeting Modal */}
      <Modal
        visible={showMeetingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMeetingModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setShowMeetingModal(false)}
          />
          <View className={`bg-white rounded-t-3xl ${Platform.OS === 'ios' ? 'pb-10' : 'pb-5'}`}>
            <View className="flex-row justify-between items-center p-5 border-b border-[#f3f4f6]">
              <Text className="text-xl font-bold text-[#1f2937]">Add Meeting</Text>
              <TouchableOpacity onPress={() => setShowMeetingModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="p-5">
              <View className="mb-5">
                <Text className="text-sm font-semibold text-[#374151] mb-2">Meeting Title</Text>
                <TextInput
                  className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-3.5 text-[15px] text-[#1f2937]"
                  value={meetingTitle}
                  onChangeText={setMeetingTitle}
                  placeholder="Enter meeting title"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-[#374151] mb-2">Date & Time</Text>
                <TouchableOpacity
                  className="flex-row items-center gap-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-3.5 mb-2.5"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#6b7280" />
                  <Text className="text-[15px] text-[#1f2937] font-medium">
                    {meetingDate.toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row items-center gap-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-3.5"
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color="#6b7280" />
                  <Text className="text-[15px] text-[#1f2937] font-medium">
                    {meetingDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={`rounded-xl p-4 items-center mt-2.5 ${
                  !meetingTitle.trim() ? 'bg-[#d1d5db]' : 'bg-[#9A8CFC]'
                }`}
                onPress={handleSaveMeeting}
                disabled={!meetingTitle.trim()}
              >
                <Text className="text-base font-semibold text-white">Add Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={meetingDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setMeetingDate(selectedDate);
            }
          }}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={meetingDate}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setMeetingDate(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}