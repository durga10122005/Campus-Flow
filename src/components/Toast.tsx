import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast.visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return Colors.primary;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.tertiary;
      default:
        return Colors.inverseSurface;
    }
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
        <MaterialIcons name={getIcon()} size={18} color="#ffffff" />
        <Text style={styles.text}>{toast.message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
          <MaterialIcons name="close" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    maxWidth: '100%',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
});
