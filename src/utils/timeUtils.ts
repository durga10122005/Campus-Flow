import { useState, useEffect } from 'react';
import { Weekday, TimetableSlot } from '../data/mockData';

export interface SlotRealtimeStatus {
  state: 'active' | 'ended' | 'upcoming' | 'other_day';
  elapsedMinutes: number;
  remainingMinutes: number;
  totalDurationMinutes: number;
  progressPercent: number; // 0 - 100
  startsInMinutes: number;
}

export const getWeekdayFromDate = (date: Date): Weekday => {
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const map: Record<number, Weekday> = {
    0: 'SUN' as Weekday,
    1: 'MON',
    2: 'TUE',
    3: 'WED',
    4: 'THU',
    5: 'FRI',
    6: 'SAT',
  };
  return map[dayIndex] || 'MON';
};

export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim().toUpperCase();
  const [timePart, period] = trimmed.split(' ');
  if (!timePart) return 0;

  const [hStr, mStr] = timePart.split(':');
  let hours = parseInt(hStr, 10) || 0;
  const minutes = parseInt(mStr, 10) || 0;

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

export const formatMinutesToDisplay = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
};

export const getSlotRealtimeStatus = (
  slot: TimetableSlot,
  currentWeekday: Weekday,
  currentMinutes: number
): SlotRealtimeStatus => {
  if (slot.day !== currentWeekday) {
    return {
      state: 'other_day',
      elapsedMinutes: 0,
      remainingMinutes: 0,
      totalDurationMinutes: slot.durationMinutes || 60,
      progressPercent: 0,
      startsInMinutes: 0,
    };
  }

  const startMins = parseTimeToMinutes(slot.startTime);
  const endMins = parseTimeToMinutes(slot.endTime);
  const duration = Math.max(1, endMins - startMins);

  if (currentMinutes >= endMins) {
    return {
      state: 'ended',
      elapsedMinutes: duration,
      remainingMinutes: 0,
      totalDurationMinutes: duration,
      progressPercent: 100,
      startsInMinutes: 0,
    };
  }

  if (currentMinutes >= startMins && currentMinutes < endMins) {
    const elapsed = currentMinutes - startMins;
    const remaining = endMins - currentMinutes;
    const progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));

    return {
      state: 'active',
      elapsedMinutes: elapsed,
      remainingMinutes: remaining,
      totalDurationMinutes: duration,
      progressPercent: progress,
      startsInMinutes: 0,
    };
  }

  // Otherwise upcoming
  const startsIn = startMins - currentMinutes;
  return {
    state: 'upcoming',
    elapsedMinutes: 0,
    remainingMinutes: duration,
    totalDurationMinutes: duration,
    progressPercent: 0,
    startsInMinutes: Math.max(0, startsIn),
  };
};

/**
 * Custom hook to continuously track current real-time clock and weekday.
 * Ticks every intervalMs (defaults to 10 seconds).
 */
export const useRealtimeClock = (intervalMs = 10000) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentWeekday = getWeekdayFromDate(now);

  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedDate = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return {
    now,
    currentMinutes,
    currentWeekday,
    formattedTime,
    formattedDate,
  };
};
