import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Edit3, Trash2, MapPin } from 'lucide-react-native';

const TaskCard = memo(({ task, properties, onEdit, onDelete }) => {
  const taskPropertyIds = task.propertyIds || (task.propertyId ? [task.propertyId] : []);
  const taskProperties = properties.filter(p => taskPropertyIds.includes(p.id));
  const date = new Date(task.date);
  const isSiteVisit = task.type === 'Site Visit' || task.type === 'Visit';
  const statusColor = task.status === 'Done' ? '#059669' : '#d97706';

  const handleNavigate = () => {
    if (taskProperties.length === 1) {
      const prop = taskProperties[0];
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prop.location)}`);
    }
  };

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={[styles.taskTypeBadge, {
          backgroundColor: isSiteVisit ? '#fffbeb' : '#eff6ff'
        }]}>
          <Text style={[styles.taskTypeText, {
            color: isSiteVisit ? '#b45309' : '#1d4ed8'
          }]}>
            {isSiteVisit ? 'Site Visit' : task.type}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => onEdit(task)} style={{ padding: 4 }}>
            <Edit3 size={14} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(task.id)} style={{ padding: 4 }}>
            <Trash2 size={14} color="#ef4444" />
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{task.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.taskNote} numberOfLines={2}>{task.note}</Text>

      <View style={styles.taskFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskDate}>
            {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {taskProperties.length > 0 && (
            <Text style={styles.taskProperty} numberOfLines={1}>
              {taskProperties.map(p => p.title).join(', ')}
            </Text>
          )}
        </View>

        {isSiteVisit && taskProperties.length > 0 && (
          <TouchableOpacity style={styles.taskSiteVisitButton} onPress={handleNavigate}>
            <MapPin size={16} color="white" />
            <Text style={styles.taskSiteVisitButtonText}>
              {taskProperties.length === 1 ? 'Navigate' : `Visit ${taskProperties.length} Sites`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

TaskCard.displayName = 'TaskCard';

const styles = StyleSheet.create({
  taskCard: {
    padding: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  taskNote: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
    gap: 10,
  },
  taskDate: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  taskProperty: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 3,
  },
  taskSiteVisitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#9f95f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexShrink: 0,
  },
  taskSiteVisitButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
});

export default TaskCard;
