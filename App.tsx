import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import { Colors } from './src/theme/colors';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { Toast } from './src/components/Toast';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { requestNotificationPermissions } from './src/services/notificationService';

import { TodayScreen } from './src/screens/TodayScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { BunkCalcScreen } from './src/screens/BunkCalcScreen';
import { AssignmentsScreen } from './src/screens/AssignmentsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const MainNavigator: React.FC = () => {
  const { activeTab } = useApp();

  useEffect(() => {
    // Request notification permissions on app startup
    requestNotificationPermissions().catch(() => {});
  }, []);

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'today':
        return <TodayScreen />;
      case 'timetable':
        return <TimetableScreen />;
      case 'bunk':
        return <BunkCalcScreen />;
      case 'assignments':
        return <AssignmentsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <TodayScreen />;
    }
  };

  return (
    <View style={styles.appContainer}>
      <Header />
      <View style={styles.screenContainer}>
        {renderCurrentScreen()}
      </View>
      <BottomNav />
      <Toast />
    </View>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <StatusBar style="dark" />
          <AppProvider>
            <MainNavigator />
          </AppProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  appContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});
