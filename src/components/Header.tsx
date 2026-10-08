import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useRealtimeClock } from '../utils/timeUtils';

export const Header: React.FC = () => {
  const { profile, setActiveTab, showToast } = useApp();
  const { now } = useRealtimeClock(10000);

  // Dynamically formatted date e.g. "THU, OCT 8"
  const formattedHeaderDate = now
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();

  return (
    <View style={styles.container}>
      {/* Top Bar info */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.dateText}>{formattedHeaderDate}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>CampusFlow</Text>
            <View style={styles.greenDot} />
          </View>
        </View>

        <View style={styles.rightActions}>
          {/* Semester Pill */}
          <View style={styles.semesterPill}>
            <View style={styles.innerPip} />
            <Text style={styles.semesterText}>
              {profile.semester} • {profile.branch.split(' ')[0] || 'CS'}
            </Text>
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
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  innerPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  semesterText: {
    fontSize: 11,
    fontWeight: '700',
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
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tertiary,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
