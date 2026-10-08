import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Weekday, TimetableSlot } from '../data/mockData';

interface DayItem {
  day: Weekday;
  date: string;
}

const DAYS: DayItem[] = [
  { day: 'MON', date: '28' },
  { day: 'TUE', date: '29' },
  { day: 'WED', date: '30' },
  { day: 'THU', date: '01' },
  { day: 'FRI', date: '02' },
  { day: 'SAT', date: '03' },
];

export const TimetableScreen: React.FC = () => {
  const {
    timetable,
    courses,
    holidays,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    addHoliday,
    deleteHoliday,
    showToast,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<Weekday>('FRI');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Modals state
  const [addClassModalVisible, setAddClassModalVisible] = useState(false);
  const [addHolidayModalVisible, setAddHolidayModalVisible] = useState(false);

  // New Class Form State
  const [formCourseTitle, setFormCourseTitle] = useState('');
  const [formCourseCode, setFormCourseCode] = useState('');
  const [formProfessor, setFormProfessor] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00 AM');
  const [formEndTime, setFormEndTime] = useState('10:30 AM');
  const [formIsLab, setFormIsLab] = useState(false);
  const [formDay, setFormDay] = useState<Weekday>('FRI');

  // New Holiday Form State
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayType, setHolidayType] = useState<'Public' | 'Institutional' | 'Fest' | 'Exam Preparation'>('Public');
  const [holidayNotes, setHolidayNotes] = useState('');

  // Edit Class Form State
  const [editClassModalVisible, setEditClassModalVisible] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState('');
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editProfessor, setEditProfessor] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editIsLab, setEditIsLab] = useState(false);

  const openEditClassModal = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setEditCourseTitle(slot.courseTitle);
    setEditCourseCode(slot.courseCode);
    setEditProfessor(slot.professor);
    setEditRoom(slot.room);
    setEditLocation(slot.location);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
    setEditIsLab(slot.isLab);
    setEditClassModalVisible(true);
  };

  const handleUpdateClass = () => {
    if (!editCourseTitle.trim()) {
      showToast('Please enter a course title', 'warning');
      return;
    }
    updateTimetableSlot(editingSlotId, {
      courseTitle: editCourseTitle.trim(),
      courseCode: editCourseCode.trim(),
      professor: editProfessor.trim(),
      room: editRoom.trim(),
      location: editLocation.trim(),
      startTime: editStartTime,
      endTime: editEndTime,
      isLab: editIsLab,
      labMultiplier: editIsLab ? 2 : undefined,
    });
    setEditClassModalVisible(false);
  };

  // Filter slots for the selected day
  const daySlots = timetable.filter(s => s.day === selectedDay);
  const dayHoliday = holidays.find(h => h.day === selectedDay);

  const handleSaveClass = () => {
    if (!formCourseTitle.trim()) {
      showToast('Please enter a course title', 'warning');
      return;
    }

    addTimetableSlot({
      day: formDay,
      courseId: 'course-' + Date.now(),
      courseTitle: formCourseTitle.trim(),
      courseCode: formCourseCode.trim() || 'CS-GEN',
      professor: formProfessor.trim() || 'Faculty Member',
      room: formRoom.trim() || 'ROOM 101',
      location: formLocation.trim() || 'Main Wing • 1F',
      startTime: formStartTime,
      endTime: formEndTime,
      durationMinutes: 90,
      isLab: formIsLab,
      labMultiplier: formIsLab ? 2 : undefined,
      status: 'upcoming',
    });

    setFormCourseTitle('');
    setFormCourseCode('');
    setFormProfessor('');
    setFormRoom('');
    setFormLocation('');
    setAddClassModalVisible(false);
  };

  const handleSaveHoliday = () => {
    if (!holidayTitle.trim()) {
      showToast('Please enter a holiday title', 'warning');
      return;
    }

    addHoliday({
      date: `Oct ${DAYS.find(d => d.day === selectedDay)?.date || '02'}, 2026`,
      day: selectedDay,
      title: holidayTitle.trim(),
      type: holidayType,
      notes: holidayNotes.trim() || 'No classes scheduled',
    });

    setHolidayTitle('');
    setHolidayNotes('');
    setAddHolidayModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Header & Actions Row */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={styles.screenTitle}>Class Timetable</Text>
            <View style={styles.termBadge}>
              <Text style={styles.termBadgeText}>Fall 2024</Text>
            </View>
          </View>
          <Text style={styles.semesterSub}>Odd Semester • Week 07</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addClassHeaderBtn}
            onPress={() => {
              setFormDay(selectedDay);
              setAddClassModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={16} color={Colors.onPrimary} />
            <Text style={styles.addClassHeaderText}>Add Class</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Interactive Weekday Selector with Dynamic Class Counts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysScroll}
      >
        {DAYS.map(item => {
          const isSelected = selectedDay === item.day;
          const count = timetable.filter(s => s.day === item.day).length;
          const isHol = holidays.some(h => h.day === item.day);

          return (
            <TouchableOpacity
              key={item.day}
              style={[
                styles.dayCard,
                isSelected ? styles.dayCardActive : styles.dayCardInactive,
              ]}
              onPress={() => setSelectedDay(item.day)}
              activeOpacity={0.8}
            >
              <View style={styles.dayTopRow}>
                <Text
                  style={[
                    styles.dayLabel,
                    isSelected ? styles.dayLabelActive : styles.dayLabelInactive,
                  ]}
                >
                  {item.day}
                </Text>
                {isSelected && <View style={styles.activeDayDot} />}
              </View>
              <Text
                style={[
                  styles.dateNumber,
                  isSelected ? styles.dateNumberActive : styles.dateNumberInactive,
                ]}
              >
                {item.date}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isHol
                    ? styles.countBadgeHoliday
                    : isSelected
                    ? styles.countBadgeActive
                    : styles.countBadgeInactive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    isHol
                      ? styles.countBadgeTextHoliday
                      : isSelected
                      ? styles.countBadgeTextActive
                      : styles.countBadgeTextInactive,
                  ]}
                >
                  {isHol ? 'OFF' : count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Holiday / Off-Day Banner if active */}
      {dayHoliday ? (
        <View style={styles.holidayBanner}>
          <View style={styles.holidayIconBox}>
            <MaterialIcons name="celebration" size={20} color={Colors.tertiary} />
          </View>
          <View style={styles.holidayContent}>
            <View style={styles.holidayTop}>
              <Text style={styles.holidayTitle}>{dayHoliday.title}</Text>
              <View style={styles.holidayTypePill}>
                <Text style={styles.holidayTypeText}>{dayHoliday.type} Holiday</Text>
              </View>
            </View>
            <Text style={styles.holidayNotes}>{dayHoliday.notes || 'Classes suspended for this day.'}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteHolidayBtn}
            onPress={() => deleteHoliday(dayHoliday.id)}
          >
            <MaterialIcons name="close" size={16} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.holidayPromptRow}>
          <View style={styles.freeWindowMini}>
            <MaterialCommunityIcons name="coffee-outline" size={16} color={Colors.primary} />
            <Text style={styles.freeWindowMiniText}>
              {daySlots.length} classes scheduled for {selectedDay}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.markHolidayBtn}
            onPress={() => setAddHolidayModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="event-busy" size={14} color={Colors.secondary} />
            <Text style={styles.markHolidayText}>Mark as Holiday</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 4. Timeline Schedule Cards for Selected Day */}
      <View style={styles.scheduleList}>
        {daySlots.length === 0 ? (
          <View style={styles.emptyDayBox}>
            <MaterialIcons name="event-available" size={36} color={Colors.outlineVariant} />
            <Text style={styles.emptyDayTitle}>No classes scheduled for {selectedDay}</Text>
            <Text style={styles.emptyDaySub}>
              Enjoy your free day or tap below to add classes to your schedule.
            </Text>
            <TouchableOpacity
              style={styles.addFirstClassBtn}
              onPress={() => {
                setFormDay(selectedDay);
                setAddClassModalVisible(true);
              }}
            >
              <MaterialIcons name="add" size={16} color={Colors.onPrimary} />
              <Text style={styles.addFirstClassBtnText}>Add Class to {selectedDay}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          daySlots.map(slot => {
            const isActive = slot.status === 'active';
            const isAttended = slot.status === 'attended';

            return (
              <View
                key={slot.id}
                style={[styles.classCard, isActive && styles.classCardActiveNow]}
              >
                {isActive && <View style={styles.activeSideStripe} />}

                <View style={styles.classHeader}>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeText}>{slot.startTime} – {slot.endTime}</Text>
                    {isActive ? (
                      <View style={styles.liveNowTag}>
                        <View style={styles.livePulse} />
                        <Text style={styles.liveNowText}>Active Now</Text>
                      </View>
                    ) : (
                      <Text style={styles.durationText}>{slot.durationMinutes} min</Text>
                    )}
                  </View>

                  <View style={styles.headerRightActions}>
                    {isAttended && (
                      <View style={styles.attendedBadge}>
                        <MaterialIcons name="check-circle" size={12} color={Colors.primary} />
                        <Text style={styles.attendedText}>Attended</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => deleteTimetableSlot(slot.id)}
                      style={styles.deleteSlotBtn}
                    >
                      <MaterialIcons name="delete-outline" size={16} color={Colors.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.classBody}>
                  <View style={styles.classMainInfo}>
                    <Text style={styles.className}>{slot.courseTitle}</Text>
                    <Text style={styles.classSub}>
                      {slot.professor} • <Text style={styles.codeMono}>{slot.courseCode}</Text>
                    </Text>
                  </View>
                  <View style={styles.roomCol}>
                    <View style={[styles.roomBox, isActive && styles.roomBoxActive]}>
                      <Text
                        style={[
                          styles.roomBoxText,
                          isActive && { color: Colors.onPrimary },
                        ]}
                      >
                        {slot.room}
                      </Text>
                    </View>
                    <Text style={styles.wingText}>{slot.location}</Text>
                  </View>
                </View>

                {isActive && (
                  <View style={styles.activeProgressRow}>
                    <View style={styles.activeBarTrack}>
                      <View style={[styles.activeBarFill, { width: '64%' }]} />
                    </View>
                    <View style={styles.activeProgressLabels}>
                      <Text style={styles.progressSubtext}>Started {slot.startTime}</Text>
                      <Text style={styles.progressRemaining}>32m remaining</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* MODAL 1: Add New Class */}
      <Modal visible={addClassModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Class to Weekly Timetable</Text>
                <TouchableOpacity onPress={() => setAddClassModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              {/* Day Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Day of Week</Text>
                <View style={styles.dayPickerRow}>
                  {DAYS.map(d => (
                    <TouchableOpacity
                      key={d.day}
                      style={[
                        styles.dayPickerBtn,
                        formDay === d.day && styles.dayPickerBtnActive,
                      ]}
                      onPress={() => setFormDay(d.day)}
                    >
                      <Text
                        style={[
                          styles.dayPickerText,
                          formDay === d.day && styles.dayPickerTextActive,
                        ]}
                      >
                        {d.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Course Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course / Subject Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Distributed Systems Lab"
                  value={formCourseTitle}
                  onChangeText={setFormCourseTitle}
                />
              </View>

              {/* Course Code & Professor */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Course Code</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="CS-501"
                    value={formCourseCode}
                    onChangeText={setFormCourseCode}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.2 }]}>
                  <Text style={styles.formLabel}>Professor / Instructor</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Prof. Jenkins"
                    value={formProfessor}
                    onChangeText={setFormProfessor}
                  />
                </View>
              </View>

              {/* Room & Building Wing */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Room / Hall</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="LAB 402"
                    value={formRoom}
                    onChangeText={setFormRoom}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.2 }]}>
                  <Text style={styles.formLabel}>Location / Floor</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Tech Block • 4F"
                    value={formLocation}
                    onChangeText={setFormLocation}
                  />
                </View>
              </View>

              {/* Time Slots */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Start Time</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="10:15 AM"
                    value={formStartTime}
                    onChangeText={setFormStartTime}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>End Time</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="11:45 AM"
                    value={formEndTime}
                    onChangeText={setFormEndTime}
                  />
                </View>
              </View>

              {/* Lab Credit Multiplier */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Practical / Lab Session (2× Credit)</Text>
                  <Text style={styles.switchSub}>Applies practical weightage to attendance calculations.</Text>
                </View>
                <Switch
                  value={formIsLab}
                  onValueChange={setFormIsLab}
                  trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
                  thumbColor={formIsLab ? Colors.primary : Colors.secondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddClassModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveClass}
                >
                  <Text style={styles.saveBtnText}>Save Class</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 2: Add Holiday / Off-Day */}
      <Modal visible={addHolidayModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark {selectedDay} as Holiday / Off-Day</Text>
              <TouchableOpacity onPress={() => setAddHolidayModalVisible(false)}>
                <MaterialIcons name="close" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Holiday / Occasion Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Founder's Day / College Fest"
                value={holidayTitle}
                onChangeText={setHolidayTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.holidayTypeRow}>
                {(['Public', 'Institutional', 'Fest', 'Exam Preparation'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      holidayType === type && styles.typeChipActive,
                    ]}
                    onPress={() => setHolidayType(type)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        holidayType === type && styles.typeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Lectures suspended, library open"
                value={holidayNotes}
                onChangeText={setHolidayNotes}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddHolidayModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveHoliday}
              >
                <Text style={styles.saveBtnText}>Confirm Holiday</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  termBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  termBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  semesterSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addClassHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  addClassHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimary,
  },

  // Days scroll
  daysScroll: {
    gap: 8,
    paddingRight: 16,
  },
  dayCard: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  dayCardActive: {
    backgroundColor: Colors.inverseSurface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dayCardInactive: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayLabelActive: {
    color: Colors.inversePrimary,
  },
  dayLabelInactive: {
    color: Colors.secondary,
  },
  activeDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.inversePrimary,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2,
  },
  dateNumberActive: {
    color: Colors.surfaceContainerLowest,
  },
  dateNumberInactive: {
    color: Colors.onSurface,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(211, 228, 254, 0.25)',
  },
  countBadgeInactive: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  countBadgeHoliday: {
    backgroundColor: Colors.tertiaryFixed,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: Colors.inversePrimary,
  },
  countBadgeTextInactive: {
    color: Colors.onSurfaceVariant,
  },
  countBadgeTextHoliday: {
    color: Colors.onTertiaryFixedVariant,
  },

  // Holiday Banner
  holidayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  holidayIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayContent: {
    flex: 1,
  },
  holidayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  holidayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  holidayTypePill: {
    backgroundColor: 'rgba(163, 103, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  holidayTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  holidayNotes: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  deleteHolidayBtn: {
    padding: 4,
  },

  holidayPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  freeWindowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeWindowMiniText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  markHolidayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  markHolidayText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
  },

  // Schedule List
  scheduleList: {
    gap: 12,
  },
  emptyDayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
  },
  emptyDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 4,
  },
  emptyDaySub: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    maxWidth: 240,
  },
  addFirstClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  addFirstClassBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  classCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 10,
  },
  classCardActiveNow: {
    borderColor: Colors.primary,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  activeSideStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: Colors.primary,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: Colors.secondary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(133, 248, 196, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  attendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  deleteSlotBtn: {
    padding: 2,
  },
  liveNowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveNowText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  classBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  classMainInfo: {
    flex: 1,
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  classSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  codeMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.onSurfaceVariant,
  },
  roomCol: {
    alignItems: 'flex-end',
  },
  roomBox: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomBoxActive: {
    backgroundColor: Colors.primary,
  },
  roomBoxText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  wingText: {
    fontSize: 9,
    color: Colors.secondary,
    marginTop: 2,
  },
  activeProgressRow: {
    gap: 4,
    paddingTop: 4,
  },
  activeBarTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  activeBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  activeProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: 10,
    color: Colors.secondary,
  },
  progressRemaining: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalScroll: {
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  formGroup: {
    gap: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  formInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  dayPickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayPickerBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  dayPickerBtnActive: {
    backgroundColor: Colors.primary,
  },
  dayPickerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  dayPickerTextActive: {
    color: Colors.onPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  switchSub: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 1,
  },
  holidayTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLow,
  },
  typeChipActive: {
    backgroundColor: Colors.tertiary,
  },
  typeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainer,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
