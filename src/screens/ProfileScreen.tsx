import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { generateAttendancePDF } from '../services/pdfService';
import { syncTimetableToDeviceCalendar } from '../services/calendarService';
import {
  scheduleDailyMorningBrief,
  cancelNotificationsByTag,
} from '../services/notificationService';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    courses,
    timetable,
    holidays,
    updateTargetRule,
    updateProfile,
    resetToDefaults,
    showToast,
  } = useApp();

  const [morningBriefEnabled, setMorningBriefEnabled] = useState(true);
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState(true);
  const [directionsPromptEnabled, setDirectionsPromptEnabled] = useState(true);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);

  // Edit profile form state
  const [formName, setFormName] = useState(profile.name);
  const [formRollNo, setFormRollNo] = useState(profile.rollNo);
  const [formSemester, setFormSemester] = useState(profile.semester);
  const [formBranch, setFormBranch] = useState(profile.branch);
  const [formCollege, setFormCollege] = useState(profile.college);
  const [formCgpa, setFormCgpa] = useState(String(profile.cgpa));

  const overallPct = profile.totalHeld > 0
    ? ((profile.totalAttended / profile.totalHeld) * 100).toFixed(1)
    : '100.0';

  const handleSaveProfile = () => {
    const cgpaVal = parseFloat(formCgpa);
    updateProfile({
      name: formName.trim() || profile.name,
      rollNo: formRollNo.trim() || profile.rollNo,
      semester: formSemester.trim() || profile.semester,
      branch: formBranch.trim() || profile.branch,
      college: formCollege.trim() || profile.college,
      cgpa: !isNaN(cgpaVal) ? cgpaVal : profile.cgpa,
    });
    setEditProfileModalVisible(false);
    showToast('Profile updated successfully', 'success');
  };

  const handleToggleMorningBrief = async (val: boolean) => {
    setMorningBriefEnabled(val);
    if (val) {
      await scheduleDailyMorningBrief(8, 0);
      showToast('Daily 8:00 AM Morning Brief scheduled', 'success');
    } else {
      await cancelNotificationsByTag('morning-brief');
      showToast('Morning brief notifications disabled', 'info');
    }
  };

  const handleToggleCriticalAlerts = async (val: boolean) => {
    setCriticalAlertsEnabled(val);
    if (val) {
      showToast(`Critical shortage alerts enabled (<${profile.targetRule}%)`, 'success');
    } else {
      await cancelNotificationsByTag('shortage-alert');
      showToast('Shortage alerts disabled', 'info');
    }
  };

  const handleToggleDirections = (val: boolean) => {
    setDirectionsPromptEnabled(val);
    if (val) {
      showToast('15-min walk route alerts enabled', 'success');
    } else {
      showToast('Walk route alerts disabled', 'info');
    }
  };

  const handleExportAttendancePDF = async () => {
    try {
      setIsExportingPDF(true);

      const targetRule = profile.targetRule;
      const subjectsFormatted = courses.map(c => {
        const pct = c.total > 0 ? (c.attended / c.total) * 100 : 100;
        const targetDec = targetRule / 100;
        let safeBunks = 0;

        if (pct >= targetRule) {
          safeBunks = Math.floor((c.attended - targetDec * c.total) / targetDec);
        } else {
          safeBunks = -Math.ceil((targetDec * c.total - c.attended) / (1 - targetDec));
        }

        let status: 'Safe' | 'Warning' | 'Critical' = 'Safe';
        if (pct < targetRule) {
          status = 'Critical';
        } else if (pct < targetRule + 5) {
          status = 'Warning';
        }

        return {
          code: c.code,
          name: c.title,
          attended: c.attended,
          total: c.total,
          percentage: pct,
          safeBunks,
          status,
        };
      });

      const success = await generateAttendancePDF({
        studentName: profile.name,
        rollNumber: profile.rollNo,
        semester: profile.semester,
        branch: profile.branch,
        collegeName: profile.college,
        cgpa: String(profile.cgpa),
        targetRule: profile.targetRule,
        overallAttendancePct: parseFloat(overallPct),
        totalAttended: profile.totalAttended,
        totalHeld: profile.totalHeld,
        subjects: subjectsFormatted,
      });

      if (success) {
        showToast('Official Attendance PDF ready!', 'success');
      } else {
        showToast('Could not generate PDF', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('PDF Export Error', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSyncTimetableToCalendar = async () => {
    try {
      setIsSyncingCalendar(true);

      // Group timetable slots by weekday
      const weekdays: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT')[] = [
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        'SAT',
      ];
      const daysData = weekdays.map(day => {
        const slotsForDay = timetable.filter(t => t.day === day);
        return {
          day,
          slots: slotsForDay.map(s => ({
            name: s.courseTitle,
            code: s.courseCode,
            room: s.room,
            wing: s.location,
            professor: s.professor,
            isLab: s.isLab,
            time: `${s.startTime} - ${s.endTime}`,
          })),
        };
      });

      const res = await syncTimetableToDeviceCalendar(daysData as any);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Calendar synchronization failed', 'error');
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <View style={styles.avatarBox}>
            <MaterialIcons name="person" size={32} color={Colors.onPrimary} />
          </View>
          <View style={styles.profileTextInfo}>
            <View style={styles.nameWithBadge}>
              <Text style={styles.studentName}>{profile.name}</Text>
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={14} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.rollText}>
              Roll: <Text style={styles.monoText}>{profile.rollNo}</Text> • {profile.semester}
            </Text>
            <Text style={styles.branchText}>{profile.branch}</Text>
            <Text style={styles.collegeText}>{profile.college}</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => {
              setFormName(profile.name);
              setFormRollNo(profile.rollNo);
              setFormSemester(profile.semester);
              setFormBranch(profile.branch);
              setFormCollege(profile.college);
              setFormCgpa(String(profile.cgpa));
              setEditProfileModalVisible(true);
            }}
          >
            <MaterialIcons name="edit" size={18} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Core Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.cgpa}</Text>
            <Text style={styles.statLabel}>Current CGPA</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{overallPct}%</Text>
            <Text style={styles.statLabel}>Overall Att.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {profile.totalAttended}/{profile.totalHeld}
            </Text>
            <Text style={styles.statLabel}>Attended</Text>
          </View>
        </View>
      </View>

      {/* 2. Institutional Attendance Rule Policy */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="policy" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Institutional Compliance Rule</Text>
          </View>
          <Text style={styles.currentRuleText}>{profile.targetRule}% Threshold</Text>
        </View>
        <Text style={styles.sectionDescription}>
          The minimum required attendance percentage before university exam admittance restrictions apply.
        </Text>

        <View style={styles.thresholdButtonsRow}>
          {[70, 75, 80, 85].map(rule => {
            const isSelected = profile.targetRule === rule;
            return (
              <TouchableOpacity
                key={rule}
                style={[
                  styles.thresholdBtn,
                  isSelected && styles.thresholdBtnActive,
                ]}
                onPress={() => updateTargetRule(rule)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.thresholdBtnText,
                    isSelected && styles.thresholdBtnTextActive,
                  ]}
                >
                  {rule}%
                </Text>
                {isSelected && <Text style={styles.selectedIndicator}>Active</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Academic Calendar & Holidays Overview */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="event" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Campus Calendar & Holidays</Text>
          </View>
          <Text style={styles.holidayCountText}>{holidays.length} Scheduled</Text>
        </View>

        <View style={styles.holidaysList}>
          {holidays.map(hol => (
            <View key={hol.id} style={styles.holidayItem}>
              <View style={styles.holidayLeft}>
                <View style={styles.calendarPill}>
                  <Text style={styles.calendarDayText}>{hol.day}</Text>
                </View>
                <View>
                  <Text style={styles.holidayItemTitle}>{hol.title}</Text>
                  <Text style={styles.holidayItemDate}>{hol.date} • {hol.type}</Text>
                </View>
              </View>
              <View style={styles.offPill}>
                <Text style={styles.offPillText}>No Classes</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Notification Preferences */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="notifications-outline" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Smart Notifications</Text>
          </View>
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.prefTextCol}>
            <Text style={styles.prefTitle}>Daily Morning Brief (8:00 AM)</Text>
            <Text style={styles.prefSub}>Summary of classes, room numbers, and shortage alerts.</Text>
          </View>
          <Switch
            value={morningBriefEnabled}
            onValueChange={handleToggleMorningBrief}
            trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
            thumbColor={morningBriefEnabled ? Colors.primary : Colors.secondary}
          />
        </View>

        <View style={styles.prefDivider} />

        <View style={styles.preferenceItem}>
          <View style={styles.prefTextCol}>
            <Text style={styles.prefTitle}>Critical Shortage Alerts (&lt;{profile.targetRule}%)</Text>
            <Text style={styles.prefSub}>Proactive warnings when safe bunk capacity drops to 0.</Text>
          </View>
          <Switch
            value={criticalAlertsEnabled}
            onValueChange={handleToggleCriticalAlerts}
            trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
            thumbColor={criticalAlertsEnabled ? Colors.primary : Colors.secondary}
          />
        </View>

        <View style={styles.prefDivider} />

        <View style={styles.preferenceItem}>
          <View style={styles.prefTextCol}>
            <Text style={styles.prefTitle}>Class Walk Route Alerts</Text>
            <Text style={styles.prefSub}>15-minute advance alert with building and floor location.</Text>
          </View>
          <Switch
            value={directionsPromptEnabled}
            onValueChange={handleToggleDirections}
            trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
            thumbColor={directionsPromptEnabled ? Colors.primary : Colors.secondary}
          />
        </View>
      </View>

      {/* 5. Academic Data Actions & Reset */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="settings" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Data Management & Sync</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionRowBtn}
          onPress={handleExportAttendancePDF}
          disabled={isExportingPDF}
          activeOpacity={0.7}
        >
          <View style={styles.actionRowLeft}>
            <MaterialIcons name="picture-as-pdf" size={20} color={Colors.error} />
            <View>
              <Text style={styles.actionRowTitle}>Export Official Attendance PDF</Text>
              <Text style={styles.actionRowSub}>Signed statement for institutional verification</Text>
            </View>
          </View>
          {isExportingPDF ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialIcons name="chevron-right" size={20} color={Colors.secondary} />
          )}
        </TouchableOpacity>

        <View style={styles.prefDivider} />

        <TouchableOpacity
          style={styles.actionRowBtn}
          onPress={handleSyncTimetableToCalendar}
          disabled={isSyncingCalendar}
          activeOpacity={0.7}
        >
          <View style={styles.actionRowLeft}>
            <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.actionRowTitle}>Sync Timetable with Device Calendar</Text>
              <Text style={styles.actionRowSub}>Apple Calendar & Google Calendar integration</Text>
            </View>
          </View>
          {isSyncingCalendar ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <MaterialIcons name="chevron-right" size={20} color={Colors.secondary} />
          )}
        </TouchableOpacity>

        <View style={styles.prefDivider} />

        <TouchableOpacity
          style={styles.actionRowBtn}
          onPress={resetToDefaults}
          activeOpacity={0.7}
        >
          <View style={styles.actionRowLeft}>
            <MaterialCommunityIcons name="restore" size={20} color={Colors.error} />
            <View>
              <Text style={[styles.actionRowTitle, { color: Colors.error }]}>Reset All Data to Defaults</Text>
              <Text style={styles.actionRowSub}>Clears stored classes, attendance records, and tasks</Text>
            </View>
          </View>
          <MaterialIcons name="refresh" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Student Profile</Text>
                <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
                  <MaterialIcons name="close" size={20} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Roll Number</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formRollNo}
                    onChangeText={setFormRollNo}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Semester</Text>
                  <TextInput
                    style={styles.formInput}
                    value={formSemester}
                    onChangeText={setFormSemester}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Branch / Degree</Text>
                <TextInput
                  style={styles.formInput}
                  value={formBranch}
                  onChangeText={setFormBranch}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Institution / College</Text>
                <TextInput
                  style={styles.formInput}
                  value={formCollege}
                  onChangeText={setFormCollege}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current CGPA</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={formCgpa}
                  onChangeText={setFormCgpa}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditProfileModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
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
  profileCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 16,
  },
  profileTopRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  verifiedBadge: {
    marginTop: 1,
  },
  rollText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  branchText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  collegeText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  editProfileBtn: {
    padding: 6,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  currentRuleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  holidayCountText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  sectionDescription: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 16,
  },
  thresholdButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thresholdBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdBtnActive: {
    backgroundColor: Colors.primary,
  },
  thresholdBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  thresholdBtnTextActive: {
    color: Colors.onPrimary,
  },
  selectedIndicator: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primaryFixed,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  holidaysList: {
    gap: 8,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
  },
  holidayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  calendarPill: {
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calendarDayText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onTertiaryFixed,
  },
  holidayItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  holidayItemDate: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
  },
  offPill: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  offPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  prefTextCol: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  prefSub: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
    lineHeight: 15,
  },
  prefDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  actionRowSub: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 1,
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
