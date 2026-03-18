import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';

const PropertyListItem = memo(({ prop, onRemove }) => {
  if (!prop) return null;
  return (
    <View style={styles.selectedPropertyItem}>
      <Image source={{ uri: prop.image }} style={styles.compactImg} />
      <View style={{ flex: 1 }}>
        <Text style={styles.compactTitle} numberOfLines={1}>{prop.title}</Text>
        <Text style={styles.matchPrice}>{prop.price}</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(prop.id)} style={styles.removeButton}>
        <X size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
});

PropertyListItem.displayName = 'PropertyListItem';

const styles = StyleSheet.create({
  selectedPropertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  compactImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  matchPrice: {
    fontSize: 13,
    color: '#6b7280',
  },
  removeButton: {
    padding: 6,
    borderRadius: 99,
    backgroundColor: '#f9fafb',
  },
});

export default PropertyListItem;
