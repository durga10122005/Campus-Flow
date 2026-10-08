import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Course,
  TimetableSlot,
  Assignment,
  Holiday,
  StudentProfile,
  Weekday,
  initialCourses,
  initialTimetable,
  initialAssignments,
  initialHolidays,
  initialProfile,
} from '../data/mockData';

export type TabKey = 'today' | 'timetable' | 'bunk' | 'assignments' | 'profile';

interface ToastState {
  visible: boolean;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

interface AppContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  courses: Course[];
  timetable: TimetableSlot[];
  assignments: Assignment[];
  holidays: Holiday[];
  profile: StudentProfile;
  morningBriefDismissed: boolean;
  dismissMorningBrief: () => void;
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  hideToast: () => void;
  markAttendance: (slotId: string, status: 'present' | 'absent' | 'cancelled') => void;
  // Class / Timetable Management
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, updated: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  // Course / Attendance Record Management
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourseAttendance: (id: string, attended: number, total: number) => void;
  deleteCourse: (id: string) => void;
  // Holiday Management
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  // Assignment Management
  toggleAssignmentStatus: (id: string) => void;
  addAssignment: (newAssignment: Omit<Assignment, 'id'>) => void;
  deleteAssignment: (id: string) => void;
  // Profile & Rules
  updateTargetRule: (newRule: number) => void;
  updateProfile: (updated: Partial<StudentProfile>) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COURSES: '@campus_flow_courses',
  TIMETABLE: '@campus_flow_timetable',
  ASSIGNMENTS: '@campus_flow_assignments',
  HOLIDAYS: '@campus_flow_holidays',
  PROFILE: '@campus_flow_profile',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(initialTimetable);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [morningBriefDismissed, setMorningBriefDismissed] = useState(false);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });

  // Load persisted state from AsyncStorage on startup
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedCourses, savedTimetable, savedAssignments, savedHolidays, savedProfile] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.COURSES),
          AsyncStorage.getItem(STORAGE_KEYS.TIMETABLE),
          AsyncStorage.getItem(STORAGE_KEYS.ASSIGNMENTS),
          AsyncStorage.getItem(STORAGE_KEYS.HOLIDAYS),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        ]);

        if (savedCourses) setCourses(JSON.parse(savedCourses));
        if (savedTimetable) setTimetable(JSON.parse(savedTimetable));
        if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
        if (savedHolidays) setHolidays(JSON.parse(savedHolidays));
        if (savedProfile) setProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error('Error loading stored campus data:', err);
      }
    };
    loadSavedData();
  }, []);

  // Save changes to AsyncStorage
  const saveCourses = async (newCourses: Course[]) => {
    setCourses(newCourses);
    await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(newCourses));
  };

  const saveTimetable = async (newTimetable: TimetableSlot[]) => {
    setTimetable(newTimetable);
    await AsyncStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(newTimetable));
  };

  const saveAssignments = async (newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
    await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(newAssignments));
  };

  const saveHolidays = async (newHolidays: Holiday[]) => {
    setHolidays(newHolidays);
    await AsyncStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(newHolidays));
  };

  const saveProfile = async (newProfile: StudentProfile) => {
    setProfile(newProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
  };

  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const dismissMorningBrief = () => {
    setMorningBriefDismissed(true);
    showToast('Morning brief dismissed');
  };

  const markAttendance = (slotId: string, status: 'present' | 'absent' | 'cancelled') => {
    const updatedTimetable = timetable.map(slot => {
      if (slot.id === slotId) {
        return {
          ...slot,
          status: status === 'present' ? ('attended' as const) : status === 'absent' ? ('missed' as const) : ('cancelled' as const),
        };
      }
      return slot;
    });
    saveTimetable(updatedTimetable);

    // Update course attendance stats
    const targetSlot = timetable.find(s => s.id === slotId);
    if (targetSlot) {
      const addedAttended = status === 'present' ? 1 : 0;
      const addedTotal = status === 'cancelled' ? 0 : 1;

      const updatedCourses = courses.map(course => {
        if (course.id === targetSlot.courseId || course.code === targetSlot.courseCode) {
          return {
            ...course,
            attended: course.attended + addedAttended,
            total: course.total + addedTotal,
          };
        }
        return course;
      });
      saveCourses(updatedCourses);

      // Update aggregate profile
      if (status !== 'cancelled') {
        const updatedProfile = {
          ...profile,
          totalAttended: profile.totalAttended + (status === 'present' ? 1 : 0),
          totalHeld: profile.totalHeld + 1,
        };
        saveProfile(updatedProfile);
      }
    }

    const messages = {
      present: 'Marked Present (+1 attended)',
      absent: 'Marked Absent',
      cancelled: 'Class marked Cancelled',
    };
    showToast(messages[status], status === 'present' ? 'success' : status === 'absent' ? 'error' : 'info');
  };

  // Timetable Operations
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: 'slot-' + Date.now(),
    };
    const updated = [...timetable, newSlot];
    saveTimetable(updated);
    showToast(`Added ${slot.courseTitle} to ${slot.day}`, 'success');
  };

  const updateTimetableSlot = (id: string, updated: Partial<TimetableSlot>) => {
    const updatedTimetable = timetable.map(s => (s.id === id ? { ...s, ...updated } : s));
    saveTimetable(updatedTimetable);
    showToast('Class updated successfully', 'success');
  };

  const deleteTimetableSlot = (id: string) => {
    const target = timetable.find(s => s.id === id);
    const updated = timetable.filter(s => s.id !== id);
    saveTimetable(updated);
    showToast(`Removed ${target?.courseTitle || 'class'} from schedule`, 'info');
  };

  // Course Operations
  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: 'course-' + Date.now(),
    };
    const updated = [...courses, newCourse];
    saveCourses(updated);
    showToast(`Added ${course.title} to enrolled courses`, 'success');
  };

  const updateCourseAttendance = (id: string, attended: number, total: number) => {
    const updatedCourses = courses.map(c => (c.id === id ? { ...c, attended, total } : c));
    saveCourses(updatedCourses);

    // Recalculate aggregate
    const newAtt = updatedCourses.reduce((sum, c) => sum + c.attended, 0);
    const newHeld = updatedCourses.reduce((sum, c) => sum + c.total, 0);
    saveProfile({ ...profile, totalAttended: newAtt, totalHeld: newHeld });

    showToast('Attendance records updated directly!', 'success');
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    saveCourses(updated);
    showToast('Course removed from tracker', 'info');
  };

  // Holiday Operations
  const addHoliday = (holiday: Omit<Holiday, 'id'>) => {
    const newHol: Holiday = {
      ...holiday,
      id: 'hol-' + Date.now(),
    };
    const updated = [newHol, ...holidays];
    saveHolidays(updated);
    showToast(`Marked ${holiday.day} (${holiday.title}) as Holiday / Off-Day`, 'success');
  };

  const deleteHoliday = (id: string) => {
    const updated = holidays.filter(h => h.id !== id);
    saveHolidays(updated);
    showToast('Holiday removed', 'info');
  };

  // Assignment Operations
  const toggleAssignmentStatus = (id: string) => {
    const updated = assignments.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'submitted' ? ('pending' as const) : ('submitted' as const);
        showToast(
          nextStatus === 'submitted' ? 'Task marked as Submitted' : 'Task moved back to Pending',
          nextStatus === 'submitted' ? 'success' : 'info'
        );
        return {
          ...item,
          status: nextStatus,
          progressPercentage: nextStatus === 'submitted' ? 100 : 75,
        };
      }
      return item;
    });
    saveAssignments(updated);
  };

  const addAssignment = (newAssignment: Omit<Assignment, 'id'>) => {
    const item: Assignment = {
      ...newAssignment,
      id: 'asg-' + Date.now(),
    };
    const updated = [item, ...assignments];
    saveAssignments(updated);
    showToast('New task added successfully!', 'success');
  };

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter(a => a.id !== id);
    saveAssignments(updated);
    showToast('Assignment deleted', 'info');
  };

  // Profile
  const updateTargetRule = (newRule: number) => {
    saveProfile({ ...profile, targetRule: newRule });
    saveCourses(courses.map(c => ({ ...c, targetPercentage: newRule })));
    showToast(`Attendance target updated to ${newRule}%`, 'success');
  };

  const updateProfile = (updated: Partial<StudentProfile>) => {
    saveProfile({ ...profile, ...updated });
    showToast('Profile updated', 'success');
  };

  const resetToDefaults = async () => {
    await AsyncStorage.clear();
    setCourses(initialCourses);
    setTimetable(initialTimetable);
    setAssignments(initialAssignments);
    setHolidays(initialHolidays);
    setProfile(initialProfile);
    showToast('Reset sample data to defaults', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        courses,
        timetable,
        assignments,
        holidays,
        profile,
        morningBriefDismissed,
        dismissMorningBrief,
        toast,
        showToast,
        hideToast,
        markAttendance,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        addCourse,
        updateCourseAttendance,
        deleteCourse,
        addHoliday,
        deleteHoliday,
        toggleAssignmentStatus,
        addAssignment,
        deleteAssignment,
        updateTargetRule,
        updateProfile,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
