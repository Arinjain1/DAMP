import { Calendar, CheckCircle, MapPin, Phone, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setFollowUps, setLoading, updateFollowUpStatus } from '../store/slices/followUpsSlice';
import { tasksAPI } from '../config/api';

export default function FollowUpListView() {
  const dispatch = useDispatch();
  const { followUps, loading } = useSelector(state => state.followUps);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All, Meeting, Site Visit, Call

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    try {
      dispatch(setLoading(true));
      const response = await tasksAPI.getAll({ status: 'All' });
      
      if (response.data.success) {
        dispatch(setFollowUps(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching followups:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFollowUps();
    setRefreshing(false);
  };

  const handleToggleStatus = async (taskId) => {
    try {
      const response = await tasksAPI.toggleStatus(taskId);
      
      if (response.data.success) {
        dispatch(updateFollowUpStatus({ 
          id: taskId, 
          status: response.data.data.status 
        }));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTaskIcon = (taskType) => {
    switch (taskType) {
      case 'Site Visit':
        return <MapPin size={18} color="#6366f1" />;
      case 'Call':
        return <Phone size={18} color="#10b981" />;
      case 'Meeting':
      default:
        return <User size={18} color="#f59e0b" />;
    }
  };

  const filteredTasks = filter === 'All' 
    ? followUps 
    : followUps.filter(task => task.task_type === filter);

  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <View className="flex-1 bg-[#f9fafb]">
      {/* Filter Tabs */}
      <View className="bg-white px-4 py-3 border-b border-[#e5e7eb]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {['All', 'Meeting', 'Site Visit', 'Call'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setFilter(type)}
                className={`px-4 py-2 rounded-full ${
                  filter === type ? 'bg-[#9A8CFC]' : 'bg-[#f3f4f6]'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  filter === type ? 'text-white' : 'text-[#6b7280]'
                }`}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <View className="px-4 py-4">
            <Text className="text-lg font-bold text-[#1f2937] mb-3">
              Upcoming ({pendingTasks.length})
            </Text>
            <View className="gap-3">
              {pendingTasks
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                .map((task) => (
                  <View
                    key={task.id}
                    className="bg-white rounded-2xl p-4 border border-[#e5e7eb]"
                  >
                    <View className="flex-row items-start gap-3">
                      <View className="mt-1">{getTaskIcon(task.task_type)}</View>
                      
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-[#1f2937] mb-1">
                          {task.title}
                        </Text>
                        
                        {task.client_name && (
                          <Text className="text-sm text-[#6b7280] mb-1">
                            Client: {task.client_name}
                          </Text>
                        )}
                        
                        {task.property_title && (
                          <Text className="text-sm text-[#6366f1] mb-1">
                            Property: {task.property_title}
                          </Text>
                        )}

                        {task.site_visit_property_count > 0 && (
                          <Text className="text-sm text-[#6366f1] mb-1">
                            {task.site_visit_property_count} properties to visit
                          </Text>
                        )}
                        
                        {task.description && (
                          <Text className="text-xs text-[#9ca3af] mb-2">
                            {task.description}
                          </Text>
                        )}
                        
                        <View className="flex-row items-center gap-2">
                          <Calendar size={14} color="#9ca3af" />
                          <Text className="text-xs text-[#9ca3af]">
                            {formatDate(task.due_date)} • {formatTime(task.due_date)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleToggleStatus(task.id)}
                        className="mt-1"
                      >
                        <View className="w-6 h-6 rounded-full border-2 border-[#d1d5db]" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View className="px-4 py-4">
            <Text className="text-lg font-bold text-[#6b7280] mb-3">
              Completed ({completedTasks.length})
            </Text>
            <View className="gap-3">
              {completedTasks
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .map((task) => (
                  <View
                    key={task.id}
                    className="bg-[#f9fafb] rounded-2xl p-4 border border-[#e5e7eb]"
                  >
                    <View className="flex-row items-start gap-3">
                      <View className="mt-1 opacity-50">{getTaskIcon(task.task_type)}</View>
                      
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-[#6b7280] mb-1 line-through">
                          {task.title}
                        </Text>
                        
                        {task.client_name && (
                          <Text className="text-sm text-[#9ca3af] mb-1">
                            Client: {task.client_name}
                          </Text>
                        )}
                        
                        <View className="flex-row items-center gap-2">
                          <Calendar size={14} color="#9ca3af" />
                          <Text className="text-xs text-[#9ca3af]">
                            {formatDate(task.due_date)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleToggleStatus(task.id)}
                        className="mt-1"
                      >
                        <CheckCircle size={24} color="#10b981" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {filteredTasks.length === 0 && !loading && (
          <View className="items-center justify-center py-20">
            <Calendar size={48} color="#d1d5db" />
            <Text className="mt-4 text-base text-[#9ca3af]">No tasks found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
