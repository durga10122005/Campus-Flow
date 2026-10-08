import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export interface TimetableDaySlot {
  name: string;
  code: string;
  room: string;
  wing: string;
  professor: string;
  isLab: boolean;
  time: string;
}

export interface TimetableDay {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  slots: TimetableDaySlot[];
}

export const requestCalendarPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
};

export const syncTimetableToDeviceCalendar = async (
  days: TimetableDay[]
): Promise<{ success: boolean; eventsCreated: number; message: string }> => {
  try {
    if (Platform.OS === 'web') {
      return {
        success: true,
        eventsCreated: 0,
        message: 'Calendar sync simulated on web environment.',
      };
    }

    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      return {
        success: false,
        eventsCreated: 0,
        message: 'Calendar permissions are required to sync your schedule.',
      };
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    let targetCalendar = calendars.find(
      cal => cal.name === 'CampusFlow Academic' || cal.title === 'CampusFlow Academic'
    );

    // If calendar does not exist, create a new one
    if (!targetCalendar) {
      let defaultCalendarSource: Calendar.Source | undefined;
      if (Platform.OS === 'ios') {
        const defaultCalendar = await Calendar.getDefaultCalendarAsync();
        defaultCalendarSource = defaultCalendar.source;
      } else {
        defaultCalendarSource = {
          isLocalAccount: true,
          name: 'CampusFlow',
          type: Calendar.SourceType.LOCAL,
        };
      }

      const newCalendarId = await Calendar.createCalendarAsync({
        title: 'CampusFlow Academic',
        color: '#006948',
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource ? (defaultCalendarSource as any).id : undefined,
        source: defaultCalendarSource,
        name: 'CampusFlow Academic',
        ownerAccount: 'CampusFlow',
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });

      targetCalendar = { id: newCalendarId } as any;
    }

    if (!targetCalendar) {
      return { success: false, eventsCreated: 0, message: 'Could not acquire or create target calendar.' };
    }

    let createdCount = 0;
    const now = new Date();

    // Map weekday abbreviations to 0-indexed day numbers (Sun=0, Mon=1, etc.)
    const dayMap: Record<string, number> = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
    };

    for (const day of days) {
      const targetDayOfWeek = dayMap[day.day];
      if (targetDayOfWeek === undefined) continue;

      for (const slot of day.slots) {
        // Parse time string e.g. "09:00 AM - 10:45 AM"
        const timeParts = slot.time.split('-');
        if (timeParts.length < 2) continue;

        const parseTime = (tStr: string) => {
          const trimmed = tStr.trim();
          const [time, modifier] = trimmed.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return { hours, minutes };
        };

        const startTime = parseTime(timeParts[0]);
        const endTime = parseTime(timeParts[1]);

        // Compute next occurrence of this weekday
        const eventStart = new Date(now);
        const currentDayOfWeek = now.getDay();
        let distance = targetDayOfWeek - currentDayOfWeek;
        if (distance < 0) distance += 7;
        eventStart.setDate(now.getDate() + distance);
        eventStart.setHours(startTime.hours, startTime.minutes, 0, 0);

        const eventEnd = new Date(eventStart);
        eventEnd.setHours(endTime.hours, endTime.minutes, 0, 0);

        await Calendar.createEventAsync(targetCalendar.id, {
          title: `[CampusFlow] ${slot.name}`,
          startDate: eventStart,
          endDate: eventEnd,
          location: `Room ${slot.room}, ${slot.wing}`,
          notes: `Course: ${slot.code}\nFaculty: ${slot.professor}\nType: ${slot.isLab ? 'Lab Session (2x)' : 'Lecture'}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          alarms: [{ relativeOffset: -15, method: Calendar.AlarmMethod.ALERT }],
        });

        createdCount++;
      }
    }

    return {
      success: true,
      eventsCreated: createdCount,
      message: `Successfully added ${createdCount} class sessions to your device calendar!`,
    };
  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      success: false,
      eventsCreated: 0,
      message: 'Failed to sync with native calendar.',
    };
  }
};
