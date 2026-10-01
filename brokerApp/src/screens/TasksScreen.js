import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTaskComplete, addTask, deleteTask } from '../redux/slices/tasksSlice';

const TasksScreen = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.tasks);

  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProperty, setTaskProperty] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskTag, setTaskTag] = useState('Site Visit');

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleAddNewTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      property: taskProperty.trim() || 'General Brokerage',
      time: taskTime.trim() || 'Today, 04:00 PM',
      completed: false,
      tag: taskTag,
    };

    dispatch(addTask(newTask));
    setTaskTitle('');
    setTaskProperty('');
    setTaskTime('');
    setModalVisible(false);
    Alert.alert('Task Created', 'New action item added to Redux checklist.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tasks & Deals</Text>
            <Text style={styles.subtitle}>Daily checklists & follow-ups</Text>
          </View>
          <TouchableOpacity
            style={styles.quickAddBtn}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#000000" />
            <Text style={styles.quickAddText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Progress summary card */}
        <View style={styles.progressCard}>
          <View style={styles.progressIconBox}>
            <Ionicons name="clipboard-outline" size={24} color="#05DF8E" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.progressTitle}>
              {completedCount} of {tasks.length} Tasks Completed
            </Text>
            <Text style={styles.progressSubtitle}>
              {tasks.length - completedCount === 0
                ? 'All tasks completed for today! 🎉'
                : `${tasks.length - completedCount} high priority tasks left today.`}
            </Text>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Task list from Redux */}
        <Text style={styles.sectionHeading}>Today's Schedule</Text>

        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
            activeOpacity={0.7}
            onPress={() => dispatch(toggleTaskComplete(task.id))}
          >
            <TouchableOpacity
              style={[styles.checkBtn, task.completed && styles.checkBtnCompleted]}
              onPress={() => dispatch(toggleTaskComplete(task.id))}
            >
              {task.completed && <Ionicons name="checkmark" size={16} color="#000000" />}
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={[
                  styles.taskTitle,
                  task.completed && { textDecorationLine: 'line-through', color: '#94A3B8' },
                ]}
              >
                {task.title}
              </Text>
              <Text style={styles.taskProperty}>{task.property}</Text>
              <View style={styles.taskMetaRow}>
                <Ionicons name="time-outline" size={13} color="#94A3B8" />
                <Text style={styles.taskTime}>{task.time}</Text>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{task.tag}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => dispatch(deleteTask(task.id))}
              style={{ padding: 4 }}
            >
              <Ionicons name="trash-outline" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Action Item</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Task Description</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Schedule registry verification"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <Text style={styles.inputLabel}>Property / Client</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. M3M Golf Estate"
              value={taskProperty}
              onChangeText={setTaskProperty}
            />

            <Text style={styles.inputLabel}>Time / Schedule</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Today, 5:00 PM"
              value={taskTime}
              onChangeText={setTaskTime}
            />

            <TouchableOpacity style={styles.submitTaskBtn} onPress={handleAddNewTask}>
              <Text style={styles.submitTaskBtnText}>Add to Redux Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#05DF8E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
  },
  quickAddText: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  progressIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#05DF8E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  progressSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#05DF8E',
    borderRadius: 3,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardCompleted: {
    backgroundColor: '#FAFAFA',
    opacity: 0.8,
  },
  checkBtn: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnCompleted: {
    backgroundColor: '#05DF8E',
    borderColor: '#05DF8E',
  },
  taskTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
  },
  taskProperty: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 3,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  taskTime: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    marginRight: 10,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#0F172A',
  },
  submitTaskBtn: {
    backgroundColor: '#05DF8E',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  submitTaskBtnText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default TasksScreen;
