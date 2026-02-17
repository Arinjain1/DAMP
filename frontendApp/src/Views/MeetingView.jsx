import { Calendar, CheckCircle, CirclePlus } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateDeal } from '../store/slices/dealsSlice';
import { addFollowUp } from '../store/slices/followUpsSlice';
import AddModal from '../Modal and Sheets/AddModal';

export default function MeetingView({ selectedDeal, reminderEnabled, setReminderEnabled, setShowReminderSetAlert }) {
  const dispatch = useDispatch();
  const { customers } = useSelector(state => state.customers);
  const { properties } = useSelector(state => state.properties);
  
  const [showAddModal, setShowAddModal] = useState(false);

  const meetings = selectedDeal.meetings || [];

  const handleAddMeeting = () => {
    setShowAddModal(true);
  };

  const handleSaveTask = (taskData) => {
    
    // Save to followUps slice
    const newTask = {
      ...taskData,
      id: Math.random().toString(36).substring(2, 11),
      status: 'Pending'
    };
    dispatch(addFollowUp(newTask));

    // Also update deal's meetings
    const customer = customers.find(c => c.id === taskData.customerId);
    const selectedProperties = properties.filter(p => taskData.propertyIds?.includes(p.id));

    const newMeeting = {
      id: newTask.id,
      title: `${taskData.type}`, 
      date: taskData.date,
      status: 'upcoming',
      type: taskData.type,
      customer: customer?.name,
      properties: selectedProperties.map(p => p.title).join(', '),
      note: taskData.note
    };

    const updatedDeal = {
      ...selectedDeal,
      meetings: [...meetings, newMeeting]
    };

    dispatch(updateDeal(updatedDeal));
    setShowAddModal(false);
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
            className="flex-row items-center gap-[6px] bg-[#9A8CFC] px-3 py-2 rounded-[20px] border border-[#9A8CFC]" 
            onPress={handleAddMeeting}
          >
            <CirclePlus size={20} color="#ffffff" strokeWidth={2} />
            <Text className="text-[13px] font-normal text-white">Add Task</Text>
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
                  className={`bg-white rounded-2xl p-4 border border-[#e5e7eb] ${
                    item.status === 'completed' ? 'bg-[#f9fafb]' : ''
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text 
                        className={`text-lg font-bold text-[#1f2937] mb-1 ${
                          item.status === 'completed' ? 'text-[#6b7280]' : ''
                        }`}
                      >
                        {item.title}
                      </Text>
                      
                      
                      {item.note && (
                        <Text className="text-[12px] text-[#9ca3af] mb-1">
                          {item.note}
                        </Text>
                      )}
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
                </View>
              ))}
          </View>
        ) : (
          <View className="items-center py-10">
            <Calendar size={40} color="#d1d5db" />
            <Text className="mt-3 text-sm text-[#9ca3af]">No tasks scheduled yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Reminder Toggle at Bottom */}
      <View className="fixed top-24 bg-white pb-0">
        <View className="bg-white rounded-xl p-4 border border-[#e5e7eb] flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold text-[#1f2937] mb-1">Send me a reminder</Text>
            <Text className="text-[13px] text-[#9ca3af]">For tasks</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleReminderToggle}
            trackColor={{ false: '#d1d5db', true: '#9A8CFC' }}
            thumbColor="#ffffff"
            style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
          />
        </View>
      </View>

      {/* Add Task Modal - Using existing AddModal component */}
      <AddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        type="FollowUp"
        onSave={handleSaveTask}
        onUpdate={() => {}} // Empty function for now, not needed in add mode
        initialCustomer={selectedDeal ? customers.find(c => c.id === selectedDeal.customerId) : null}
        initialPropertyIds={selectedDeal?.propertyId ? [selectedDeal.propertyId] : []}
        initialTaskType="Meeting"
        customers={customers}
        properties={properties}
      />
    </View>
  );
}
