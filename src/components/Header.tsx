import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setActiveTab, showToast } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Bar info */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.dateText}>FRI, OCT 2</Text>
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>CampusFlow</Text>
            <View style={styles.greenDot} />
          </View>
        </View>

        <View style={styles.rightActions}>
          {/* Semester Pill */}
          <View style={styles.semesterPill}>
            <View style={styles.innerPip} />
            <Text style={styles.semesterText}>Sem 5 • CS</Text>
          </View>

          {/* Notifications Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => showToast('No new institutional alerts', 'info')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => setActiveTab('profile')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="person" size={18} color={Colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  semesterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  innerPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  semesterText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
