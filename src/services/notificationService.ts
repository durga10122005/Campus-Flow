import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up notification behavior for active app state
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('campusflow-alerts', {
      name: 'CampusFlow Academic Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#006948',
    });
  }

  return true;
};

export const scheduleDailyMorningBrief = async (
  hour = 8,
  minute = 0,
  summary = 'You have 4 classes today. Starting with Operating Systems Lab at 09:00 AM.'
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // Cancel existing daily morning briefs
    await cancelNotificationsByTag('morning-brief');

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '☀️ Good Morning Durga! Today’s Brief',
        body: summary,
        data: { tag: 'morning-brief', type: 'brief' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule daily morning brief:', error);
    return null;
  }
};

export const scheduleClassWalkAlert = async (
  courseName: string,
  room: string,
  classTime: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🚶 Class Alert: ${courseName} in 15 mins`,
        body: `Location: Room ${room}. Head over to avoid being marked late.`,
        data: { tag: 'walk-alert', course: courseName, room, time: classTime },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 15 * 60, // 15 mins
        repeats: false,
      },
    });

    return id;
  } catch (error) {
    console.error('Failed to schedule walk alert:', error);
    return null;
  }
};

export const scheduleShortageAlert = async (
  courseName: string,
  currentPct: number,
  thresholdPct: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Critical Shortage Warning: ${courseName}`,
        body: `Attendance is ${currentPct.toFixed(1)}%, below the mandatory ${thresholdPct}% target! You cannot bunk next class.`,
        data: { tag: 'shortage-alert', course: courseName },
        sound: true,
      },
      trigger: null, // trigger immediately
    });

    return id;
  } catch (error) {
    console.error('Failed to send shortage alert:', error);
    return null;
  }
};

export const cancelNotificationsByTag = async (tag: string): Promise<void> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.tag === tag) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};
