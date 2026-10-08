import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Course } from '../data/mockData';

export const BunkCalcScreen: React.FC = () => {
  const {
    courses,
    profile,
    updateTargetRule,
    updateCourseAttendance,
    addCourse,
    deleteCourse,
    showToast,
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'chem');
  const [simExtraClasses, setSimExtraClasses] = useState<number>(5);

  // Modals state
  const [editAttendanceModalVisible, setEditAttendanceModalVisible] = useState(false);
  const [addCourseModalVisible, setAddCourseModalVisible] = useState(false);

  // Edit attendance state
  const [editCourseId, setEditCourseId] = useState<string>('');
  const [editAttendedStr, setEditAttendedStr] = useState<string>('');
  const [editTotalStr, setEditTotalStr] = useState<string>('');

  // Add course state
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseProf, setNewCourseProf] = useState('');
  const [newAttended, setNewAttended] = useState('0');
  const [newTotal, setNewTotal] = useState('0');

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Overall calculations
  const totalAttended = profile.totalAttended;
  const totalHeld = profile.totalHeld;
  const overallPercentage = totalHeld > 0 ? ((totalAttended / totalHeld) * 100).toFixed(1) : '100.0';
  const targetThreshold = profile.targetRule;

  // Aggregate safe bunks
  const overallSafeBunks = Math.max(
    0,
    Math.floor((totalAttended - (targetThreshold / 100) * totalHeld) / (targetThreshold / 100))
  );

  // SVG Circular progress math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1, Number(overallPercentage) / 100);
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Selected Course Simulation Math
  const curAttended = selectedCourse ? selectedCourse.attended : 0;
  const curTotal = selectedCourse ? selectedCourse.total : 0;
  const curPct = curTotal > 0 ? (curAttended / curTotal) * 100 : 100;

  // If student attends extra classes:
  const simNewAttended = curAttended + simExtraClasses;
  const simNewTotal = curTotal + simExtraClasses;
  const simNewPct = simNewTotal > 0 ? ((simNewAttended / simNewTotal) * 100).toFixed(1) : '100.0';
  const isSimCompliant = Number(simNewPct) >= targetThreshold;

  // Classes needed from scratch to reach target
  const classesNeededToTarget = Math.max(
    0,
    Math.ceil(((targetThreshold / 100) * curTotal - curAttended) / (1 - targetThreshold / 100))
  );

  // Safe bunks right now for selected course
  const courseSafeBunks = Math.max(
    0,
    Math.floor((curAttended - (targetThreshold / 100) * curTotal) / (targetThreshold / 100))
  );

  const handleRuleCycle = () => {
    const nextRule = targetThreshold === 75 ? 80 : targetThreshold === 80 ? 70 : 75;
    updateTargetRule(nextRule);
  };

  const openEditModal = (c: Course) => {
    setEditCourseId(c.id);
    setEditAttendedStr(String(c.attended));
    setEditTotalStr(String(c.total));
    setEditAttendanceModalVisible(true);
  };

  const handleSaveEditedAttendance = () => {
    const att = parseInt(editAttendedStr, 10);
    const tot = parseInt(editTotalStr, 10);

    if (isNaN(att) || isNaN(tot) || att < 0 || tot < 0 || att > tot) {
      showToast('Please enter valid numbers (Attended ≤ Total)', 'warning');
      return;
    }

    updateCourseAttendance(editCourseId, att, tot);
    setEditAttendanceModalVisible(false);
  };

  const handleCreateCourse = () => {
    if (!newCourseTitle.trim()) {
      showToast('Please enter subject title', 'warning');
      return;
    }

    const att = parseInt(newAttended, 10) || 0;
    const tot = parseInt(newTotal, 10) || 0;

    addCourse({
      code: newCourseCode.trim() || 'CS-NEW',
      title: newCourseTitle.trim(),
      professor: newCourseProf.trim() || 'Instructor',
      room: 'ROOM 101',
      location: 'Academic Block',
      attended: att,
      total: tot,
      type: 'Theory',
      credits: 3,
      targetPercentage: targetThreshold,
    });

    setNewCourseTitle('');
    setNewCourseCode('');
    setNewCourseProf('');
    setNewAttended('0');
    setNewTotal('0');
    setAddCourseModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Title & Policy Context */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.screenTitle}>Bunk Calculator</Text>
          <Text style={styles.screenSub}>Attendance Margin Simulator & {targetThreshold}% Rule</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addCourseBtn}
            onPress={() => setAddCourseModalVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={16} color={Colors.onPrimary} />
            <Text style={styles.addCourseBtnText}>Add Subject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ruleButton}
            onPress={handleRuleCycle}
            activeOpacity={0.8}
          >
            <MaterialIcons name="tune" size={14} color={Colors.primary} />
            <Text style={styles.ruleButtonText}>{targetThreshold}% Rule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Overall Compliance Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>OVERALL ACADEMIC STANDING</Text>
          <View style={styles.goodStandingPill}>
            <View style={styles.greenPip} />
            <Text style={styles.goodStandingText}>Good Standing</Text>
          </View>
        </View>

        <View style={styles.heroMetricsRow}>
          {/* Circular SVG Gauge */}
          <View style={styles.svgContainer}>
            <Svg width={96} height={96} viewBox="0 0 96 96">
              <Circle
                cx="48"
                cy="48"
                r={radius}
                stroke={Colors.surfaceContainer}
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx="48"
                cy="48"
                r={radius}
                stroke={Colors.primary}
                strokeWidth={8}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 48 48)"
              />
            </Svg>
            <View style={styles.svgTextCenter}>
              <Text style={styles.overallPctText}>{overallPercentage}%</Text>
              <Text style={styles.aggregateLabel}>AGGREGATE</Text>
            </View>
          </View>

          {/* Key Buffer Metrics */}
          <View style={styles.bufferMetricsCol}>
            <View style={styles.safeBunksNumberRow}>
              <Text style={styles.safeBunksNumber}>+{overallSafeBunks}</Text>
              <Text style={styles.safeBunksUnit}>Safe Bunks</Text>
            </View>
            <Text style={styles.safeBunksSub}>
              Total classes you can miss safely across all courses while staying above {targetThreshold}%.
            </Text>
          </View>
        </View>

        {/* Tonal Gauge Track Breakdown */}
        <View style={styles.trackBreakdownBox}>
          <View style={styles.trackLeft}>
            <MaterialIcons name="verified" size={16} color={Colors.primary} />
            <Text style={styles.trackText}>
              {totalAttended} attended of {totalHeld} total sessions
            </Text>
          </View>
          <View style={styles.cushionBadge}>
            <Text style={styles.cushionText}>
              +{(Number(overallPercentage) - targetThreshold).toFixed(1)}% Cushion
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Interactive What-If Simulator Card */}
      {selectedCourse && (
        <View style={styles.simCard}>
          <View style={styles.simHeaderRow}>
            <View style={styles.simTitleGroup}>
              <Ionicons name="flask-outline" size={18} color={Colors.primary} />
              <Text style={styles.simTitle}>What-If Simulator</Text>
            </View>
            <Text style={styles.simFormulaText}>Formula: (A+x)/(T+x) ≥ 0.75</Text>
          </View>

          {/* Course Selector Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
          >
            {courses.map(c => {
              const isSelected = selectedCourseId === c.id;
              const pct = c.total > 0 ? ((c.attended / c.total) * 100).toFixed(1) : '100.0';
              const isCritical = Number(pct) < targetThreshold;

              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.simPill,
                    isSelected
                      ? isCritical
                        ? styles.simPillCriticalActive
                        : styles.simPillActive
                      : styles.simPillInactive,
                  ]}
                  onPress={() => setSelectedCourseId(c.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.pillDot,
                      { backgroundColor: isCritical ? Colors.error : Colors.primary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.simPillText,
                      isSelected && (isCritical ? styles.simPillTextCritical : styles.simPillTextActive),
                    ]}
                  >
                    {c.title.split(' ')[0]} ({pct}%)
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Dynamic Simulator Panel */}
          <View style={styles.simPanel}>
            {/* Status Banner */}
            <View style={styles.simStatusRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.simCourseTitle}>
                  {selectedCourse.title} ({selectedCourse.code})
                </Text>
                <Text style={styles.simCourseStats}>
                  Currently: {curAttended} attended / {curTotal} held = {curPct.toFixed(1)}%
                </Text>
              </View>

              <View
                style={[
                  styles.deficitBadge,
                  curPct < targetThreshold ? styles.deficitBadgeShortage : styles.deficitBadgeSurplus,
                ]}
              >
                <MaterialIcons
                  name={curPct < targetThreshold ? 'warning' : 'check'}
                  size={13}
                  color={curPct < targetThreshold ? Colors.error : Colors.primary}
                />
                <Text
                  style={[
                    styles.deficitBadgeText,
                    { color: curPct < targetThreshold ? Colors.error : Colors.primary },
                  ]}
                >
                  {curPct < targetThreshold
                    ? `Deficit (-${classesNeededToTarget})`
                    : `Surplus (+${courseSafeBunks})`}
                </Text>
              </View>
            </View>

            {/* Action: Attend Consecutive Next Classes */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperHeader}>
                <Text style={styles.stepperPrompt}>If I attend consecutive next classes:</Text>
                <Text style={styles.stepperCountText}>+{simExtraClasses} classes</Text>
              </View>

              {/* Stepper Buttons */}
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setSimExtraClasses(prev => Math.max(0, prev - 1))}
                >
                  <MaterialIcons name="remove" size={18} color={Colors.onSurface} />
                </TouchableOpacity>

                <View style={styles.stepperBar}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.stepSegment,
                        i < simExtraClasses ? styles.stepSegmentFilled : styles.stepSegmentEmpty,
                      ]}
                      onPress={() => setSimExtraClasses(i + 1)}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setSimExtraClasses(prev => Math.min(15, prev + 1))}
                >
                  <MaterialIcons name="add" size={18} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>

              {/* Outcome Prediction Box */}
              <View
                style={[
                  styles.outcomeBox,
                  isSimCompliant ? styles.outcomeBoxSuccess : styles.outcomeBoxWarning,
                ]}
              >
                <View style={styles.outcomeLeft}>
                  <MaterialIcons
                    name={isSimCompliant ? 'check-circle' : 'error'}
                    size={18}
                    color={isSimCompliant ? Colors.primary : Colors.error}
                  />
                  <Text
                    style={[
                      styles.outcomeText,
                      { color: isSimCompliant ? Colors.primary : Colors.onErrorContainer },
                    ]}
                  >
                    {isSimCompliant
                      ? `Restored: Above ${targetThreshold}% threshold!`
                      : `Still in Deficit: Need ${Math.max(0, classesNeededToTarget - simExtraClasses)} more`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.outcomePct,
                    { color: isSimCompliant ? Colors.primary : Colors.error },
                  ]}
                >
                  {simNewPct}%
                </Text>
              </View>
            </View>

            {/* Safe Miss Capacity right now */}
            <View style={styles.safeMissCapacityRow}>
              <View style={styles.safeMissLeft}>
                <MaterialIcons
                  name="event-busy"
                  size={16}
                  color={courseSafeBunks > 0 ? Colors.primary : Colors.error}
                />
                <Text style={styles.safeMissLabel}>Safe Bunks Permitted Right Now:</Text>
              </View>
              <Text
                style={[
                  styles.safeMissValue,
                  { color: courseSafeBunks > 0 ? Colors.primary : Colors.error },
                ]}
              >
                {courseSafeBunks > 0
                  ? `${courseSafeBunks} classes`
                  : '0 classes (Immediate Shortage)'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 4. Subject Health Matrix with Direct Attendance Edit */}
      <View style={styles.matrixSection}>
        <View style={styles.matrixHeaderRow}>
          <View>
            <Text style={styles.matrixTitle}>Subject Health Matrix</Text>
            <Text style={styles.matrixSub}>Individual attendance buffer & direct updater</Text>
          </View>
          <Text style={styles.matrixCount}>{courses.length} Enrolled</Text>
        </View>

        <View style={styles.cardsList}>
          {courses.map(course => {
            const pct = course.total > 0 ? ((course.attended / course.total) * 100).toFixed(1) : '100.0';
            const isSafe = Number(pct) >= targetThreshold;
            const isCritical = Number(pct) < 70;
            const safeBunks = Math.max(0, Math.floor((course.attended - (targetThreshold / 100) * course.total) / (targetThreshold / 100)));
            const needed = Math.max(0, Math.ceil(((targetThreshold / 100) * course.total - course.attended) / (1 - targetThreshold / 100)));

            return (
              <View key={course.id} style={styles.matrixCard}>
                <View style={styles.matrixCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matrixCode}>{course.code} • {course.professor}</Text>
                    <Text style={styles.matrixCourseName}>{course.title}</Text>
                  </View>
                  <View style={styles.topCardBadges}>
                    <View
                      style={[
                        styles.matrixBadge,
                        isCritical
                          ? styles.matrixBadgeCritical
                          : isSafe
                          ? styles.matrixBadgeSafe
                          : styles.matrixBadgeWarning,
                      ]}
                    >
                      <View
                        style={[
                          styles.matrixBadgeDot,
                          { backgroundColor: isCritical ? Colors.error : isSafe ? Colors.primary : Colors.tertiary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.matrixBadgeText,
                          { color: isCritical ? Colors.onErrorContainer : isSafe ? Colors.onPrimaryFixedVariant : Colors.onTertiaryFixedVariant },
                        ]}
                      >
                        {isCritical ? 'Critical' : isSafe ? 'Safe Zone' : 'Caution'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => deleteCourse(course.id)}
                      style={styles.deleteCourseBtn}
                    >
                      <MaterialIcons name="delete-outline" size={16} color={Colors.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.matrixStatsRow}>
                  <Text style={styles.matrixSessionsText}>
                    {course.attended} attended of {course.total} sessions
                  </Text>
                  <Text
                    style={[
                      styles.matrixPctText,
                      { color: isCritical ? Colors.error : isSafe ? Colors.primary : Colors.tertiary },
                    ]}
                  >
                    {pct}%
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.matrixBarTrack}>
                  <View
                    style={[
                      styles.matrixBarFill,
                      {
                        width: `${Math.min(100, Number(pct))}%`,
                        backgroundColor: isCritical ? Colors.error : isSafe ? Colors.primary : Colors.tertiary,
                      },
                    ]}
                  />
                  <View style={[styles.matrixThresholdTick, { left: `${targetThreshold}%` }]} />
                </View>

                {/* Bottom actions: Edit Attendance Numbers & Test in Simulator */}
                <View style={styles.matrixAdviceRow}>
                  <Text style={styles.matrixAdviceText}>
                    {isSafe
                      ? `Can skip next ${safeBunks} classes safely`
                      : `Must attend next ${needed} classes to reach ${targetThreshold}%`}
                  </Text>
                  <View style={styles.matrixActionButtons}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEditModal(course)}
                    >
                      <MaterialIcons name="edit" size={12} color={Colors.onSurface} />
                      <Text style={styles.editBtnText}>Edit Numbers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.testSimBtn}
                      onPress={() => {
                        setSelectedCourseId(course.id);
                        showToast(`Switched simulator to ${course.title}`, 'info');
                      }}
                    >
                      <Text style={styles.testSimBtnText}>Simulate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* MODAL 1: Edit Attendance Numbers Directly */}
      <Modal visible={editAttendanceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Official Attendance</Text>
              <TouchableOpacity onPress={() => setEditAttendanceModalVisible(false)}>
                <MaterialIcons name="close" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Directly match numbers with your university portal/ERP without having to mark classes individually.
            </Text>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Classes Attended (A)</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={editAttendedStr}
                  onChangeText={setEditAttendedStr}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Total Classes Held (T)</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={editTotalStr}
                  onChangeText={setEditTotalStr}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditAttendanceModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveEditedAttendance}
              >
                <Text style={styles.saveBtnText}>Save Numbers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Add New Enrolled Course */}
      <Modal visible={addCourseModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Subject / Course</Text>
              <TouchableOpacity onPress={() => setAddCourseModalVisible(false)}>
                <MaterialIcons name="close" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Subject Title</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Cloud Computing & DevOps"
                value={newCourseTitle}
                onChangeText={setNewCourseTitle}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Course Code</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="CS-504"
                  value={newCourseCode}
                  onChangeText={setNewCourseCode}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1.2 }]}>
                <Text style={styles.formLabel}>Professor Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Dr. K. Patel"
                  value={newCourseProf}
                  onChangeText={setNewCourseProf}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Initial Attended</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  placeholder="0"
                  value={newAttended}
                  onChangeText={setNewAttended}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Initial Total Held</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  placeholder="0"
                  value={newTotal}
                  onChangeText={setNewTotal}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddCourseModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateCourse}
              >
                <Text style={styles.saveBtnText}>Add Course</Text>
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
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  screenSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addCourseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addCourseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  ruleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ruleButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
  },

  // Hero card
  heroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  goodStandingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(133, 248, 196, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  greenPip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  goodStandingText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onPrimaryFixedVariant,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  svgContainer: {
    width: 96,
    height: 96,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgTextCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallPctText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  aggregateLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 1,
  },
  bufferMetricsCol: {
    flex: 1,
    gap: 4,
  },
  safeBunksNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  safeBunksNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  safeBunksUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  safeBunksSub: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 16,
  },
  trackBreakdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 10,
    borderRadius: 10,
  },
  trackLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  cushionBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cushionText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Simulator
  simCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 12,
  },
  simHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  simFormulaText: {
    fontSize: 10,
    color: Colors.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  pillsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  simPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  simPillActive: {
    backgroundColor: Colors.primary,
  },
  simPillCriticalActive: {
    backgroundColor: Colors.errorContainer,
  },
  simPillInactive: {
    backgroundColor: Colors.surfaceContainer,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  simPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  simPillTextActive: {
    color: Colors.onPrimary,
  },
  simPillTextCritical: {
    color: Colors.onErrorContainer,
  },
  simPanel: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  simStatusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  simCourseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  simCourseStats: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  deficitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deficitBadgeShortage: {
    backgroundColor: 'rgba(186, 26, 26, 0.12)',
  },
  deficitBadgeSurplus: {
    backgroundColor: 'rgba(0, 105, 72, 0.12)',
  },
  deficitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepperContainer: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  stepperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  stepperCountText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    height: 20,
    alignItems: 'center',
  },
  stepSegment: {
    flex: 1,
    height: 10,
    borderRadius: 3,
  },
  stepSegmentFilled: {
    backgroundColor: Colors.primary,
  },
  stepSegmentEmpty: {
    backgroundColor: Colors.surfaceContainer,
  },
  outcomeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
  },
  outcomeBoxSuccess: {
    backgroundColor: 'rgba(133, 248, 196, 0.3)',
  },
  outcomeBoxWarning: {
    backgroundColor: Colors.errorContainer,
  },
  outcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  outcomeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  outcomePct: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  safeMissCapacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  safeMissLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeMissLabel: {
    fontSize: 12,
    color: Colors.secondary,
  },
  safeMissValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Matrix
  matrixSection: {
    gap: 10,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matrixTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  matrixSub: {
    fontSize: 11,
    color: Colors.secondary,
  },
  matrixCount: {
    fontSize: 11,
    color: Colors.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardsList: {
    gap: 10,
  },
  matrixCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 8,
  },
  matrixCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  matrixCode: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    textTransform: 'uppercase',
  },
  matrixCourseName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 1,
  },
  topCardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matrixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matrixBadgeSafe: {
    backgroundColor: 'rgba(133, 248, 196, 0.4)',
  },
  matrixBadgeCritical: {
    backgroundColor: Colors.errorContainer,
  },
  matrixBadgeWarning: {
    backgroundColor: Colors.tertiaryFixed,
  },
  matrixBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  matrixBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteCourseBtn: {
    padding: 2,
  },
  matrixStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matrixSessionsText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  matrixPctText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  matrixBarTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  matrixBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  matrixThresholdTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.onSurface,
    opacity: 0.4,
  },
  matrixAdviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  matrixAdviceText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  matrixActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  testSimBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testSimBtnText: {
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
  modalSub: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 16,
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
