import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const TodayScreen: React.FC = () => {
  const {
    courses,
    timetable,
    morningBriefDismissed,
    dismissMorningBrief,
    markAttendance,
    setActiveTab,
    showToast,
  } = useApp();

  // Find active slot or default to the second slot (Operating Systems Lab)
  const activeSlot = timetable.find(s => s.status === 'active') || timetable[1];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Pinned Morning Brief Banner */}
      {!morningBriefDismissed && (
        <View style={styles.morningBriefCard}>
          <View style={styles.warningIconBox}>
            <MaterialIcons name="priority-high" size={16} color={Colors.onTertiaryFixed} />
          </View>
          <View style={styles.briefContent}>
            <View style={styles.briefHeaderRow}>
              <Text style={styles.briefSubhead}>MORNING BRIEF • 8:00 AM</Text>
              <View style={styles.briefDot} />
              <Text style={styles.briefClasses}>4 classes</Text>
            </View>
            <Text style={styles.briefMessage}>
              <Text style={styles.briefBold}>Chem 201 at 68.0%</Text> — Shortage risk. Attend next 5 classes to restore compliance.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={dismissMorningBrief}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={16} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* 2. Primary Hero Widget: Happening Now */}
      <View style={styles.heroCard}>
        {/* Architectural Top Accent Bar */}
        <View style={styles.accentBar} />

        {/* Live indicator + Week */}
        <View style={styles.heroHeaderRow}>
          <View style={styles.liveIndicatorBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>LIVE • 10:15 - 11:45 AM</Text>
          </View>
          <View style={styles.weekBadge}>
            <Text style={styles.weekText}>Week 8</Text>
          </View>
        </View>

        {/* Course Title & Metadata */}
        <View style={styles.courseMeta}>
          <View style={styles.courseTitleRow}>
            <Text style={styles.courseTitle}>{activeSlot?.courseTitle || 'Operating Systems Lab'}</Text>
            <View style={styles.creditChip}>
              <Text style={styles.creditChipText}>Lab Credit 2×</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.roomTag}>
              <MaterialIcons name="meeting-room" size={12} color={Colors.outline} />
              <Text style={styles.roomText}>{activeSlot?.room || 'LAB 402'}</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <View style={styles.profRow}>
              <MaterialIcons name="person" size={13} color={Colors.outline} />
              <Text style={styles.metaText}>{activeSlot?.professor || 'Prof. M. Jenkins'}</Text>
            </View>
            <Text style={styles.metaDivider}>•</Text>
            <Text style={styles.metaText}>{activeSlot?.location || 'Tech Block • 4F'}</Text>
          </View>
        </View>

        {/* Segmented Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '64.4%' }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.elapsedText}>58m elapsed</Text>
            <Text style={styles.remainingText}>32m remaining</Text>
          </View>
        </View>

        {/* Instant One-Handed Attendance Action Bar */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionLabel}>MARK TODAY'S ATTENDANCE</Text>
          <View style={styles.actionButtonsGrid}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.btnPresent,
                activeSlot?.status === 'attended' && styles.actionBtnSelected,
              ]}
              onPress={() => markAttendance(activeSlot.id, 'present')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check-circle" size={18} color={Colors.onPrimary} />
              <Text style={styles.btnPresentText}>Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.btnAbsent,
                activeSlot?.status === 'missed' && styles.actionBtnSelected,
              ]}
              onPress={() => markAttendance(activeSlot.id, 'absent')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="cancel" size={18} color={Colors.onErrorContainer} />
              <Text style={styles.btnAbsentText}>Absent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.btnCancelled,
                activeSlot?.status === 'cancelled' && styles.actionBtnSelected,
              ]}
              onPress={() => markAttendance(activeSlot.id, 'cancelled')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="block" size={18} color={Colors.secondary} />
              <Text style={styles.btnCancelledText}>Cancelled</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. "Next Up" Live Route Card */}
      <View style={styles.nextUpCard}>
        <View style={styles.nextUpLeft}>
          <View style={styles.walkIconBox}>
            <MaterialIcons name="directions-walk" size={20} color={Colors.onSecondaryFixed} />
          </View>
          <View style={styles.nextUpInfo}>
            <Text style={styles.nextUpLabel}>NEXT UP • 12:00 PM</Text>
            <Text style={styles.nextUpTitle}>Database Systems</Text>
            <View style={styles.nextUpSub}>
              <Text style={styles.roomSub}>LEC HALL 2</Text>
              <Text style={styles.dotSub}>•</Text>
              <Text style={styles.profSub}>Prof. Thorne</Text>
            </View>
          </View>
        </View>

        <View style={styles.nextUpRight}>
          <View style={styles.inTimeBadge}>
            <Text style={styles.inTimeText}>in 15m</Text>
          </View>
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => showToast('Opening campus navigation map to Central Wing', 'info')}
            activeOpacity={0.7}
          >
            <Text style={styles.directionsText}>Directions</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Smart Bunk & Attendance Health Carousel */}
      <View style={styles.carouselSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Smart Bunk & Attendance Health</Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => setActiveTab('bunk')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>Simulator</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselScroll}
        >
          {courses.map(course => {
            const percentage = ((course.attended / course.total) * 100).toFixed(1);
            const isSafe = Number(percentage) >= 75;
            const isCritical = Number(percentage) < 70;
            const safeBunks = Math.max(0, Math.floor((course.attended - 0.75 * course.total) / 0.75));
            const neededClasses = Math.max(0, Math.ceil((0.75 * course.total - course.attended) / (1 - 0.75)));

            return (
              <View key={course.id} style={styles.carouselCard}>
                <View>
                  <View style={styles.cardStatusRow}>
                    <View
                      style={[
                        styles.statusPill,
                        isCritical
                          ? styles.statusPillCritical
                          : isSafe
                          ? styles.statusPillSafe
                          : styles.statusPillWarning,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: isCritical
                              ? Colors.error
                              : isSafe
                              ? Colors.primary
                              : Colors.tertiary,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          {
                            color: isCritical
                              ? Colors.onErrorContainer
                              : isSafe
                              ? Colors.onPrimaryFixedVariant
                              : Colors.onTertiaryFixedVariant,
                          },
                        ]}
                      >
                        {isCritical ? 'Shortage Warning' : isSafe ? 'Safe Zone' : 'Caution Margin'}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.percentageText,
                        {
                          color: isCritical
                            ? Colors.error
                            : isSafe
                            ? Colors.primary
                            : Colors.tertiary,
                        },
                      ]}
                    >
                      {percentage}%
                    </Text>
                  </View>

                  <Text style={styles.cardCourseTitle} numberOfLines={1}>
                    {course.title}
                  </Text>
                  <Text style={styles.cardCourseSub}>
                    {course.code} • {course.attended} / {course.total} attended
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.miniBarTrack}>
                    <View
                      style={[
                        styles.miniBarFill,
                        {
                          width: `${Math.min(100, Number(percentage))}%`,
                          backgroundColor: isCritical
                            ? Colors.error
                            : isSafe
                            ? Colors.primary
                            : Colors.tertiary,
                        },
                      ]}
                    />
                    {/* 75% target threshold tick */}
                    <View style={styles.targetTick} />
                  </View>

                  <View
                    style={[
                      styles.cardAdvicePill,
                      isCritical
                        ? { backgroundColor: Colors.errorContainer }
                        : { backgroundColor: Colors.surfaceContainerLow },
                    ]}
                  >
                    <MaterialIcons
                      name={isCritical ? 'priority-high' : 'verified'}
                      size={14}
                      color={isCritical ? Colors.error : Colors.primary}
                    />
                    <Text
                      style={[
                        styles.adviceText,
                        { color: isCritical ? Colors.error : Colors.primary },
                      ]}
                    >
                      {isCritical
                        ? `Attend next ${neededClasses} classes for 75%`
                        : `Safely bunk next ${safeBunks} classes`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Quick Timetable Peek */}
      <View style={styles.peekSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => setActiveTab('timetable')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>Full Schedule</Text>
            <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.timelineList}>
          {timetable.map(slot => (
            <View key={slot.id} style={styles.slotCard}>
              <View style={styles.slotTimeCol}>
                <Text style={styles.slotStartTime}>{slot.startTime.split(' ')[0]}</Text>
                <Text style={styles.slotEndTime}>{slot.endTime}</Text>
              </View>

              <View style={styles.slotContentCol}>
                <View style={styles.slotTopRow}>
                  <Text style={styles.slotTitle} numberOfLines={1}>{slot.courseTitle}</Text>
                  <View
                    style={[
                      styles.slotStatusBadge,
                      slot.status === 'attended'
                        ? styles.slotAttendedBadge
                        : slot.status === 'active'
                        ? styles.slotActiveBadge
                        : styles.slotUpcomingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotStatusText,
                        slot.status === 'attended'
                          ? { color: Colors.primary }
                          : slot.status === 'active'
                          ? { color: Colors.primaryContainer }
                          : { color: Colors.secondary },
                      ]}
                    >
                      {slot.status === 'attended'
                        ? 'Attended'
                        : slot.status === 'active'
                        ? 'Now'
                        : 'Upcoming'}
                    </Text>
                  </View>
                </View>

                <View style={styles.slotMetaRow}>
                  <Text style={styles.slotRoom}>{slot.room}</Text>
                  <Text style={styles.slotDot}>•</Text>
                  <Text style={styles.slotProf}>{slot.professor}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
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

  // 1. Morning brief
  morningBriefCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  warningIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.tertiaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  briefContent: {
    flex: 1,
  },
  briefHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  briefSubhead: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.5,
  },
  briefDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.outlineVariant,
  },
  briefClasses: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.secondary,
  },
  briefMessage: {
    fontSize: 12,
    color: Colors.onSurface,
    lineHeight: 16,
  },
  briefBold: {
    fontWeight: '700',
    color: Colors.tertiary,
  },
  dismissBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. Primary Hero Widget
  heroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    position: 'relative',
    overflow: 'hidden',
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primary,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  weekBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  weekText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  courseMeta: {
    gap: 4,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
    flex: 1,
  },
  creditChip: {
    backgroundColor: 'rgba(133, 248, 196, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  creditChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onPrimaryFixedVariant,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roomText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaDivider: {
    fontSize: 12,
    color: Colors.outlineVariant,
  },
  profRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },

  // Progress Section
  progressSection: {
    gap: 6,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 4,
    overflow: 'hidden',
    padding: 1,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  elapsedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Action Buttons
  actionsSection: {
    gap: 8,
    paddingTop: 4,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnSelected: {
    borderWidth: 2,
    borderColor: Colors.onSurface,
  },
  btnPresent: {
    backgroundColor: Colors.primary,
  },
  btnPresentText: {
    color: Colors.onPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  btnAbsent: {
    backgroundColor: Colors.errorContainer,
  },
  btnAbsentText: {
    color: Colors.onErrorContainer,
    fontWeight: '600',
    fontSize: 13,
  },
  btnCancelled: {
    backgroundColor: Colors.surfaceContainer,
  },
  btnCancelledText: {
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 13,
  },

  // 3. Next Up Card
  nextUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  nextUpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  walkIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextUpInfo: {
    flex: 1,
  },
  nextUpLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  nextUpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 1,
  },
  nextUpSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  roomSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dotSub: {
    fontSize: 10,
    color: Colors.outlineVariant,
  },
  profSub: {
    fontSize: 11,
    color: Colors.secondary,
  },
  nextUpRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  inTimeBadge: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  inTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  directionsText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },

  // 4. Carousel Section
  carouselSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  carouselScroll: {
    gap: 12,
    paddingRight: 16,
  },
  carouselCard: {
    width: 250,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    justifyContent: 'space-between',
    gap: 12,
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPillSafe: {
    backgroundColor: 'rgba(133, 248, 196, 0.4)',
  },
  statusPillCritical: {
    backgroundColor: Colors.errorContainer,
  },
  statusPillWarning: {
    backgroundColor: Colors.tertiaryFixed,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardCourseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cardCourseSub: {
    fontSize: 11,
    color: Colors.secondary,
    marginTop: 2,
  },
  cardBottom: {
    gap: 8,
  },
  miniBarTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '75%',
    width: 2,
    backgroundColor: Colors.onSurface,
    opacity: 0.4,
  },
  cardAdvicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adviceText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // 5. Peek Section
  peekSection: {
    gap: 10,
  },
  timelineList: {
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 12,
  },
  slotTimeCol: {
    width: 70,
    justifyContent: 'center',
  },
  slotStartTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  slotEndTime: {
    fontSize: 10,
    color: Colors.secondary,
  },
  slotContentCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  slotTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
    marginRight: 6,
  },
  slotStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  slotAttendedBadge: {
    backgroundColor: 'rgba(133, 248, 196, 0.3)',
  },
  slotActiveBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  slotUpcomingBadge: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  slotStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  slotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotRoom: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  slotDot: {
    fontSize: 10,
    color: Colors.outlineVariant,
  },
  slotProf: {
    fontSize: 11,
    color: Colors.secondary,
  },
});
