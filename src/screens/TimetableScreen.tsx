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
  DimensionValue,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Weekday, TimetableSlot } from '../data/mockData';
import {
  useRealtimeClock,
  getSlotRealtimeStatus,
  formatMinutesToDisplay,
  parseTimeToMinutes,
} from '../utils/timeUtils';

interface DayItem {
  day: Weekday;
  date: string;
}

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

  // 1. Real-time Clock
  const { currentMinutes, currentWeekday, formattedTime, formattedDate } = useRealtimeClock(5000);

  const [selectedDay, setSelectedDay] = useState<Weekday>(
    currentWeekday === ('SUN' as any) ? 'MON' : currentWeekday
  );
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Compute dynamic dates for current week
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const DAYS: DayItem[] = (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as Weekday[]).map((day, idx) => {
    const targetDayIndex = idx + 1; // 1 to 6
    const diff = targetDayIndex - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek);
    const d = new Date(now);
    d.setDate(now.getDate() + diff);
    return {
      day,
      date: String(d.getDate()).padStart(2, '0'),
    };
  });

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
    showToast('Class updated successfully', 'success');
  };

  // Filter slots for the selected day, sorted by start time
  const daySlots = timetable
    .filter(s => s.day === selectedDay)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
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
    showToast('Class added to timetable', 'success');
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
    showToast('Holiday added', 'success');
  };

  const isToday = selectedDay === currentWeekday;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Header & Actions Row */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleWithBadge}>
            <Text style={styles.screenTitle}>Class Timetable</Text>
            {isToday && (
              <View style={styles.todayIndicatorBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.todayIndicatorText}>TODAY • {formattedTime}</Text>
              </View>
            )}
          </View>
          <Text style={styles.semesterSub}>
            {formattedDate} • {daySlots.length} Classes
          </Text>
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
          const isItemToday = currentWeekday === item.day;
          const count = timetable.filter(s => s.day === item.day).length;
          const isHol = holidays.some(h => h.day === item.day);

          return (
            <TouchableOpacity
              key={item.day}
              style={[
                styles.dayCard,
                isSelected ? styles.dayCardActive : styles.dayCardInactive,
                isItemToday && !isSelected && styles.dayCardTodayOutline,
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
                {isItemToday && <View style={styles.todayMarkerDot} />}
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
              {isToday ? ' (Active Day)' : ''}
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

      {/* 4. Timeline Schedule Cards with Real-time Live Status */}
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
            const statusInfo = isToday
              ? getSlotRealtimeStatus(slot, selectedDay, currentMinutes)
              : null;
            const isActive = isToday && statusInfo?.state === 'active';
            const isEnded = isToday && statusInfo?.state === 'ended';
            const isUpcoming = isToday && statusInfo?.state === 'upcoming';
            const isAttended = slot.status === 'attended';

            return (
              <View
                key={slot.id}
                style={[
                  styles.classCard,
                  isActive && styles.classCardActiveNow,
                  isEnded && styles.classCardEnded,
                ]}
              >
                {isActive && <View style={styles.activeSideStripe} />}

                <View style={styles.classHeader}>
                  <View style={styles.timeTag}>
                    <Text style={[styles.timeText, isActive && { color: Colors.primary, fontWeight: '800' }]}>
                      {slot.startTime} – {slot.endTime}
                    </Text>

                    {/* Real-time Status Badge */}
                    {isToday ? (
                      isActive ? (
                        <View style={styles.liveNowTag}>
                          <View style={styles.livePulse} />
                          <Text style={styles.liveNowText}>
                            LIVE • {statusInfo?.progressPercent.toFixed(0)}%
                          </Text>
                        </View>
                      ) : isEnded ? (
                        <View style={styles.endedTag}>
                          <MaterialIcons name="check" size={11} color={Colors.secondary} />
                          <Text style={styles.endedTagText}>Ended</Text>
                        </View>
                      ) : (
                        <View style={styles.upcomingTag}>
                          <Text style={styles.upcomingTagText}>
                            in {formatMinutesToDisplay(statusInfo?.startsInMinutes || 0)}
                          </Text>
                        </View>
                      )
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
                      onPress={() => openEditClassModal(slot)}
                      style={styles.actionIconBtn}
                    >
                      <MaterialIcons name="edit" size={15} color={Colors.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTimetableSlot(slot.id)}
                      style={styles.actionIconBtn}
                    >
                      <MaterialIcons name="delete-outline" size={15} color={Colors.secondary} />
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

                {/* Real-time Dynamic Progress Bar for active class */}
                {isActive && statusInfo && (
                  <View style={styles.activeProgressRow}>
                    <View style={styles.activeBarTrack}>
                      <View
                        style={[
                          styles.activeBarFill,
                          { width: `${statusInfo.progressPercent.toFixed(1)}%` as DimensionValue },
                        ]}
                      />
                    </View>
                    <View style={styles.activeProgressLabels}>
                      <Text style={styles.progressSubtext}>{statusInfo.elapsedMinutes}m elapsed</Text>
                      <Text style={styles.progressRemaining}>{statusInfo.remainingMinutes}m remaining</Text>
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
                    placeholder="e.g. CS 504"
                    value={formCourseCode}
                    onChangeText={setFormCourseCode}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.5 }]}>
                  <Text style={styles.formLabel}>Professor Name</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Dr. A. Vance"
                    value={formProfessor}
                    onChangeText={setFormProfessor}
                  />
                </View>
              </View>

              {/* Room & Wing Location */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Room / Lab Code</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. LAB 402"
                    value={formRoom}
                    onChangeText={setFormRoom}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.5 }]}>
                  <Text style={styles.formLabel}>Wing & Floor</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Tech Block • 4F"
                    value={formLocation}
                    onChangeText={setFormLocation}
                  />
                </View>
              </View>

              {/* Start & End Times */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Start Time</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="09:00 AM"
                    value={formStartTime}
                    onChangeText={setFormStartTime}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>End Time</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="10:30 AM"
                    value={formEndTime}
                    onChangeText={setFormEndTime}
                  />
                </View>
              </View>

              {/* Lab 2x Toggle */}
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Practical / Lab Session (2× Weight)</Text>
                  <Text style={styles.switchSub}>Counts as 2 lecture units for attendance</Text>
                </View>
                <Switch
                  value={formIsLab}
                  onValueChange={setFormIsLab}
                  trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
                  thumbColor={formIsLab ? Colors.primary : Colors.secondary}
                />
              </View>

              {/* Modal Buttons */}
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

      {/* MODAL 2: Edit Class */}
      <Modal visible={editClassModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Class Slot</Text>
                <TouchableOpacity onPress={() => setEditClassModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Course Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editCourseTitle}
                  onChangeText={setEditCourseTitle}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Code</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editCourseCode}
                    onChangeText={setEditCourseCode}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.5 }]}>
                  <Text style={styles.formLabel}>Professor</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editProfessor}
                    onChangeText={setEditProfessor}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Room</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editRoom}
                    onChangeText={setEditRoom}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1.5 }]}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editLocation}
                    onChangeText={setEditLocation}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Start</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editStartTime}
                    onChangeText={setEditStartTime}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>End</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editEndTime}
                    onChangeText={setEditEndTime}
                  />
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Lab Multiplier (2×)</Text>
                </View>
                <Switch
                  value={editIsLab}
                  onValueChange={setEditIsLab}
                  trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
                  thumbColor={editIsLab ? Colors.primary : Colors.secondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditClassModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleUpdateClass}
                >
                  <Text style={styles.saveBtnText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL 3: Add Holiday */}
      <Modal visible={addHolidayModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Mark {selectedDay} as Holiday</Text>
                <TouchableOpacity onPress={() => setAddHolidayModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Holiday / Event Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. National Science Day"
                  value={holidayTitle}
                  onChangeText={setHolidayTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Holiday Category</Text>
                <View style={styles.dayPickerRow}>
                  {(['Public', 'Institutional', 'Fest', 'Exam Preparation'] as const).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.dayPickerBtn,
                        holidayType === cat && styles.dayPickerBtnActive,
                      ]}
                      onPress={() => setHolidayType(cat)}
                    >
                      <Text
                        style={[
                          styles.dayPickerText,
                          holidayType === cat && styles.dayPickerTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Campus library open until 4 PM"
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
                  <Text style={styles.saveBtnText}>Save Holiday</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  todayIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  todayIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onPrimaryContainer,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  termBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  termBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  semesterSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addClassHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addClassHeaderText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  daysScroll: {
    gap: 8,
    paddingRight: 16,
  },
  dayCard: {
    width: 72,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
  },
  dayCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayCardInactive: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.divider,
  },
  dayCardTodayOutline: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayLabelActive: {
    color: Colors.onPrimary,
  },
  dayLabelInactive: {
    color: Colors.secondary,
  },
  todayMarkerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dateNumberActive: {
    color: Colors.onPrimary,
  },
  dateNumberInactive: {
    color: Colors.onSurface,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeInactive: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  countBadgeHoliday: {
    backgroundColor: Colors.tertiaryFixed,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: Colors.onPrimary,
  },
  countBadgeTextInactive: {
    color: Colors.secondary,
  },
  countBadgeTextHoliday: {
    color: Colors.onTertiaryFixedVariant,
  },
  holidayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiaryFixed,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  holidayIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayContent: {
    flex: 1,
    gap: 2,
  },
  holidayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holidayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onTertiaryFixed,
  },
  holidayTypePill: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  holidayTypeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.onTertiaryFixedVariant,
  },
  holidayNotes: {
    fontSize: 11,
    color: Colors.onTertiaryFixedVariant,
  },
  deleteHolidayBtn: {
    padding: 4,
  },
  holidayPromptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  freeWindowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeWindowMiniText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  markHolidayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.surfaceContainerLow,
  },
  markHolidayText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  scheduleList: {
    gap: 10,
  },
  emptyDayBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 8,
  },
  emptyDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptyDaySub: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  addFirstClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  addFirstClassBtnText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  classCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  classCardActiveNow: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  classCardEnded: {
    opacity: 0.75,
  },
  activeSideStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  liveNowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  livePulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  liveNowText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.onPrimaryContainer,
  },
  endedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  endedTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.secondary,
  },
  upcomingTag: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upcomingTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  durationText: {
    fontSize: 10,
    color: Colors.secondary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attendedText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.onPrimaryFixedVariant,
  },
  actionIconBtn: {
    padding: 3,
  },
  classBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  classMainInfo: {
    flex: 1,
    gap: 2,
  },
  className: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  classSub: {
    fontSize: 11,
    color: Colors.secondary,
  },
  codeMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  roomCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  roomBox: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    color: Colors.secondary,
  },
  activeProgressRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 8,
    gap: 4,
  },
  activeBarTrack: {
    height: 4,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 2,
    overflow: 'hidden',
  },
  activeBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  activeProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSubtext: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressRemaining: {
    fontSize: 10,
    color: Colors.secondary,
  },
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
    flexWrap: 'wrap',
  },
  dayPickerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceContainerLow,
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
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  switchSub: {
    fontSize: 10,
    color: Colors.secondary,
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
