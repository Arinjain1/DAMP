import { Calendar, CheckCircle, CirclePlus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateDeal } from '../store/slices/dealsSlice';
import { setFollowUps, setLoading, setError } from '../store/slices/followUpsSlice';
import AddModal from '../Modal and Sheets/AddModal';
import WhatsAppIcon from '../Components/WhatsAppIcon';
import { tasksAPI } from '../config/api';

export default function MeetingView({ selectedDeal, reminderEnabled, setReminderEnabled, setShowReminderSetAlert }) {
  const dispatch = useDispatch();
  const { customers } = useSelector(state => state.customers);
  const { properties } = useSelector(state => state.properties);
  const { followUps, loading } = useSelector(state => state.followUps);

  const [showAddModal, setShowAddModal] = useState(false);
  const [localMeetings, setLocalMeetings] = useState([]);

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, [selectedDeal]);

  const fetchTasks = async () => {
    try {
      dispatch(setLoading(true));
      const response = await tasksAPI.getAll({ 
        status: 'All',
        task_type: 'Meeting' 
      });
      
      if (response.data.success) {
        const tasks = response.data.data;
        dispatch(setFollowUps(tasks));
        
        // Filter tasks for this deal's client AND only Meeting/FollowUp tasks (exclude Site Visit)
        if (selectedDeal?.customerId) {
          const dealTasks = tasks.filter(t => 
            t.client_id === selectedDeal.customerId && 
            t.task_type !== 'Site Visit' && 
            t.task_type !== 'Visit'
          );
          const formattedMeetings = dealTasks.map(task => {
            // Get property name(s)
            let propertyTitle = task.property_title;
            
            // For Site Visit tasks with multiple properties
            if (task.site_visit_properties && Array.isArray(task.site_visit_properties)) {
              const propertyNames = task.site_visit_properties.map(p => p.title).filter(Boolean);
              if (propertyNames.length > 0) {
                propertyTitle = propertyNames.join(', ');
              }
            }
            
            // Fallback: Get from properties array if not in task
            if (!propertyTitle && task.property_id) {
              const property = properties.find(p => p.id === task.property_id);
              propertyTitle = property?.title;
            }
            
            // Get customer name
            let clientName = task.client_name;
            if (!clientName) {
              const customer = customers.find(c => c.id === task.client_id);
              clientName = customer?.name || 'Unknown Client';
            }
            
            // Generate title if not present or if it's generic
            let taskTitle = task.title;
            if (!taskTitle || taskTitle === 'Meeting' || taskTitle === 'Site Visit') {
              const taskType = task.task_type || 'Meeting';
              taskTitle = `${taskType}: ${clientName}`;
            }
            
            return {
              id: task.id,
              title: taskTitle,
              date: task.due_date,
              status: task.status === 'completed' ? 'completed' : 'upcoming',
              type: task.task_type,
              note: task.description,
              client_name: clientName,
              property_title: propertyTitle
            };
          });
          setLocalMeetings(formattedMeetings);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddMeeting = () => {
    setShowAddModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      dispatch(setLoading(true));
      
      // Validate that customerId is a valid UUID (not a mock ID like "c1", "c2", etc.)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!taskData.customerId || !uuidRegex.test(taskData.customerId)) {
        Alert.alert('Error', 'Invalid customer selected. Please refresh the app and try again.');
        dispatch(setLoading(false));
        return;
      }
      
      // Prepare data for backend
      const backendData = {
        client_id: taskData.customerId,
        property_id: taskData.propertyIds?.[0] || null,
        task_type: taskData.type || 'Meeting',
        schedule_date: taskData.date.split('T')[0],
        schedule_time: taskData.date.split('T')[1]?.substring(0, 5) || '10:00',
        notes: taskData.note || ''
      };

      const response = await tasksAPI.create(backendData);
      
      if (response.data.success) {
        Alert.alert('Success', 'Task scheduled successfully!');
        fetchTasks(); // Refresh tasks
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMarkDone = async (meetingId) => {
    try {
      const response = await tasksAPI.toggleStatus(meetingId);
      
      if (response.data.success) {
        // Update local state
        setLocalMeetings(prev => 
          prev.map(m => 
            m.id === meetingId ? { ...m, status: 'completed' } : m
          )
        );
        Alert.alert('Success', 'Task marked as done!');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
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

  const handleWhatsApp = (meeting) => {
    const customer = customers.find(c => c.id === selectedDeal?.customerId);
    const phone = customer?.phone;
    
    if (!phone) {
      Alert.alert('Error', 'Customer phone number not found');
      return;
    }

    // Format date and time
    const meetingDate = new Date(meeting.date);
    const formattedDate = meetingDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = meetingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Create default message
    const message = `Hi ${customer.name},\n\nThis is a reminder for our ${meeting.type || 'meeting'} scheduled on ${formattedDate} at ${formattedTime}.\n\n${meeting.property_title ? `Property: ${meeting.property_title}\n` : ''}${meeting.note ? `Note: ${meeting.note}\n` : ''}\nLooking forward to meeting you!\n\nRegards`;

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on this device');
        }
      })
      .catch((err) => {
        console.error('Error opening WhatsApp:', err);
        Alert.alert('Error', 'Failed to open WhatsApp');
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
        {localMeetings.length > 0 ? (
          <View className="gap-3 mb-6">
            {[...localMeetings]
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
                  className={`bg-white rounded-2xl p-4 border border-[#e5e7eb] ${item.status === 'completed' ? 'bg-[#f9fafb]' : ''
                    }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text
                        className={`text-lg font-bold text-[#1f2937] mb-1 ${item.status === 'completed' ? 'text-[#6b7280]' : ''
                          }`}
                      >
                        {item.title}
                      </Text>

                      {item.property_title && (
                        <Text className="text-[12px] text-[#6366f1] mb-1">
                          Property: {item.property_title}
                        </Text>
                      )}

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
                        <View className="flex-row items-center gap-2">
                          {/* WhatsApp Icon - Left of Upcoming badge */}
                          <TouchableOpacity
                            onPress={() => handleWhatsApp(item)}
                          >
                            <WhatsAppIcon size={20} color="#25D366" />
                          </TouchableOpacity>
                          
                          <View className="bg-[#fef3c7] px-3 py-1 rounded-lg">
                            <Text className="text-[11px] font-semibold text-[#d97706]">Upcoming</Text>
                          </View>
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
            <Text className="mt-3 text-sm text-[#9ca3af]">
              {loading ? 'Loading tasks...' : 'No tasks scheduled yet'}
            </Text>
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
        onUpdate={() => { }} // Empty function for now, not needed in add mode
        initialCustomer={selectedDeal ? customers.find(c => c.id === selectedDeal.customerId) : null}
        initialPropertyIds={selectedDeal?.propertyId ? [selectedDeal.propertyId] : []}
        initialTaskType="Meeting"
        customers={customers}
        properties={properties}
      />
    </View>
  );
}
