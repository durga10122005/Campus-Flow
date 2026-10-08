import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp, TabKey } from '../context/AppContext';

interface TabItem {
  key: TabKey;
  label: string;
  iconName: string;
  iconType: 'material' | 'ionicons' | 'community';
}

const TABS: TabItem[] = [
  { key: 'today', label: 'Today', iconName: 'today', iconType: 'material' },
  { key: 'timetable', label: 'Timetable', iconName: 'calendar-outline', iconType: 'ionicons' },
  { key: 'bunk', label: 'Bunk Calc', iconName: 'calculator-variant-outline', iconType: 'community' },
  { key: 'assignments', label: 'Tasks', iconName: 'assignment', iconType: 'material' },
  { key: 'profile', label: 'Profile', iconName: 'person-outline', iconType: 'material' },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, assignments } = useApp();

  const pendingCount = assignments.filter(a => a.status === 'pending').length;

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;

          const renderIcon = () => {
            const color = isActive ? Colors.primary : Colors.secondary;
            const size = 22;

            if (tab.iconType === 'material') {
              const name = isActive && tab.key === 'profile' ? 'person' : (tab.iconName as any);
              return <MaterialIcons name={name} size={size} color={color} />;
            }
            if (tab.iconType === 'ionicons') {
              const name = isActive ? 'calendar' : (tab.iconName as any);
              return <Ionicons name={name} size={size} color={color} />;
            }
            return <MaterialCommunityIcons name={tab.iconName as any} size={size} color={color} />;
          };

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {renderIcon()}
                {tab.key === 'assignments' && pendingCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    position: 'relative',
    minWidth: 58,
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 105, 72, 0.08)',
  },
  iconContainer: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.secondary,
    marginTop: 4,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeBar: {
    position: 'absolute',
    bottom: -4,
    width: 14,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
