import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  DimensionValue,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import {
  useRealtimeClock,
  getSlotRealtimeStatus,
  formatMinutesToDisplay,
  parseTimeToMinutes,
} from '../utils/timeUtils';

export const TodayScreen: React.FC = () => {
  const {
    courses,
    timetable,
    profile,
    morningBriefDismissed,
    dismissMorningBrief,
    markAttendance,
    setActiveTab,
    showToast,
  } = useApp();

  const { now, currentMinutes, currentWeekday } = useRealtimeClock(5000);

  // 1. Get today's real classes sorted by start time
  const todaySlots = timetable
    .filter(s => s.day === currentWeekday)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  // Fallback to primary timetable slots if today is an unconfigured off-day / Sunday
  const displaySlots = todaySlots.length > 0 ? todaySlots : timetable.slice(0, 4);

  // 2. Identify active ongoing class or next upcoming class for today
  const activeSlot =
    todaySlots.find(
      s => getSlotRealtimeStatus(s, currentWeekday, currentMinutes).state === 'active'
    ) ||
    todaySlots.find(
      s => getSlotRealtimeStatus(s, currentWeekday, currentMinutes).state === 'upcoming'
    ) ||
    (todaySlots.length > 0 ? todaySlots[0] : timetable[1]);

  const nextSlot =
    todaySlots.find(
      s =>
        s.id !== activeSlot?.id &&
        getSlotRealtimeStatus(s, currentWeekday, currentMinutes).state === 'upcoming'
    ) ||
    (todaySlots.length > 1 ? todaySlots[1] : timetable[2]);

  // 3. Real-time active slot calculations
  const activeStatus = activeSlot
    ? getSlotRealtimeStatus(activeSlot, currentWeekday, currentMinutes)
    : null;

  const isLiveNow = activeStatus?.state === 'active';
  const isEnded = activeStatus?.state === 'ended';

  let progressPct = 0;
  let elapsedText = '0m elapsed';
  let remainingText = `${activeSlot?.durationMinutes || 90}m remaining`;

  if (isLiveNow && activeStatus) {
    progressPct = activeStatus.progressPercent;
    elapsedText = `${activeStatus.elapsedMinutes}m elapsed`;
    remainingText = `${activeStatus.remainingMinutes}m remaining`;
  } else if (isEnded && activeStatus) {
    progressPct = 100;
    elapsedText = `Completed (${activeStatus.totalDurationMinutes}m)`;
    remainingText = `Ended at ${activeSlot?.endTime}`;
  } else if (activeStatus?.state === 'upcoming' && activeSlot) {
    progressPct = 0;
    elapsedText = `Starts at ${activeSlot.startTime}`;
    remainingText = `in ${formatMinutesToDisplay(activeStatus.startsInMinutes)}`;
  } else {
    progressPct = 64.4;
    elapsedText = '58m elapsed';
    remainingText = '32m remaining';
  }

  // 4. Next Up countdown calculation
  const nextStatus = nextSlot
    ? getSlotRealtimeStatus(nextSlot, currentWeekday, currentMinutes)
    : null;

  const nextInText =
    nextStatus && nextStatus.state === 'upcoming'
      ? `in ${formatMinutesToDisplay(nextStatus.startsInMinutes)}`
      : 'in 15m';

  // 5. Semester week calculation based on current date
  const semesterStart = new Date(now.getFullYear(), 7, 1); // August
  const academicWeek = Math.max(1, Math.min(16, Math.floor((now.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1));

  // 6. Find course with lowest compliance for dynamic morning brief alert
  const targetRule = profile.targetRule;
  const lowestCourse = courses.reduce((prev, curr) => {
    const prevPct = prev.total > 0 ? (prev.attended / prev.total) * 100 : 100;
    const currPct = curr.total > 0 ? (curr.attended / curr.total) * 100 : 100;
    return currPct < prevPct ? curr : prev;
  }, courses[0]);

  const lowestPct = lowestCourse && lowestCourse.total > 0
    ? ((lowestCourse.attended / lowestCourse.total) * 100).toFixed(1)
    : '68.0';

  const neededClasses = lowestCourse
    ? Math.max(0, Math.ceil(((targetRule / 100) * lowestCourse.total - lowestCourse.attended) / (1 - targetRule / 100)))
    : 5;

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
              <Text style={styles.briefClasses}>{displaySlots.length} classes</Text>
            </View>
            <Text style={styles.briefMessage}>
              <Text style={styles.briefBold}>
                {lowestCourse ? `${lowestCourse.title.split(' ')[0]} ${lowestCourse.code.replace(/\D/g, '') || '201'} at ${lowestPct}%` : 'Chem 201 at 68.0%'}
              </Text>
              {Number(lowestPct) < targetRule
                ? ` — Shortage risk. Attend next ${neededClasses || 5} classes to restore compliance.`
                : ' — Attendance in safe zone. Keep up the momentum!'}
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
            <Text style={styles.liveText}>
              {isLiveNow ? 'LIVE' : isEnded ? 'ENDED' : 'NEXT'} • {activeSlot ? `${activeSlot.startTime} - ${activeSlot.endTime}` : '10:15 - 11:45 AM'}
            </Text>
          </View>
          <View style={styles.weekBadge}>
            <Text style={styles.weekText}>Week {academicWeek}</Text>
          </View>
        </View>

        {/* Course Title & Metadata */}
        <View style={styles.courseMeta}>
          <View style={styles.courseTitleRow}>
            <Text style={styles.courseTitle}>{activeSlot?.courseTitle || 'Operating Systems Lab'}</Text>
            {activeSlot?.isLab && (
              <View style={styles.creditChip}>
                <Text style={styles.creditChipText}>Lab Credit 2×</Text>
              </View>
            )}
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
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPct.toFixed(1)}%` as DimensionValue },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.elapsedText}>{elapsedText}</Text>
            <Text style={styles.remainingText}>{remainingText}</Text>
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
              onPress={() => activeSlot && markAttendance(activeSlot.id, 'present')}
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
              onPress={() => activeSlot && markAttendance(activeSlot.id, 'absent')}
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
              onPress={() => activeSlot && markAttendance(activeSlot.id, 'cancelled')}
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
            <Text style={styles.nextUpLabel}>
              NEXT UP • {nextSlot ? nextSlot.startTime : '12:00 PM'}
            </Text>
            <Text style={styles.nextUpTitle}>
              {nextSlot ? nextSlot.courseTitle : 'Database Systems'}
            </Text>
            <View style={styles.nextUpSub}>
              <Text style={styles.roomSub}>{nextSlot ? nextSlot.room : 'LEC HALL 2'}</Text>
              <Text style={styles.dotSub}>•</Text>
              <Text style={styles.profSub}>{nextSlot ? nextSlot.professor : 'Prof. Thorne'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.nextUpRight}>
          <View style={styles.inTimeBadge}>
            <Text style={styles.inTimeText}>{nextInText}</Text>
          </View>
          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => showToast(`Walking directions to ${nextSlot ? nextSlot.room : 'LEC HALL 2'}`, 'info')}
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
            const isSafe = Number(percentage) >= targetRule;
            const isCritical = Number(percentage) < targetRule - 5;
            const targetDec = targetRule / 100;
            const safeBunks = Math.max(0, Math.floor((course.attended - targetDec * course.total) / targetDec));
            const neededClasses = Math.max(0, Math.ceil((targetDec * course.total - course.attended) / (1 - targetDec)));

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
                    {/* Dynamic compliance target tick */}
                    <View style={[styles.targetTick, { left: `${targetRule}%` as DimensionValue }]} />
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
                        ? `Attend next ${neededClasses} classes for ${targetRule}%`
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
          {displaySlots.map(slot => {
            const slotStatus = getSlotRealtimeStatus(slot, currentWeekday, currentMinutes);
            const isSlotActive = slotStatus.state === 'active';
            const isSlotEnded = slotStatus.state === 'ended';

            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.slotTimeCol}>
                  <Text style={styles.slotStartTime}>{slot.startTime.split(' ')[0]}</Text>
                  <Text style={styles.slotEndTime}>{slot.endTime}</Text>
                </View>

                <View style={styles.slotContentCol}>
                  <View style={styles.slotTopRow}>
                    <Text style={styles.slotTitle} numberOfLines={1}>{slot.courseTitle}</Text>
                    {slot.status === 'attended' ? (
                      <View style={styles.attendedTag}>
                        <MaterialIcons name="check" size={12} color={Colors.primary} />
                        <Text style={styles.attendedTagText}>Attended</Text>
                      </View>
                    ) : isSlotActive ? (
                      <View style={styles.activeTag}>
                        <Text style={styles.activeTagText}>Active</Text>
                      </View>
                    ) : isSlotEnded ? (
                      <View style={styles.endedTag}>
                        <Text style={styles.endedTagText}>Ended</Text>
                      </View>
                    ) : (
                      <View style={styles.upcomingTag}>
                        <Text style={styles.upcomingTagText}>Upcoming</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.slotBottomRow}>
                    <Text style={styles.slotSubText}>
                      {slot.courseCode} • Room {slot.room} • {slot.professor}
                    </Text>
                    <Text style={styles.slotLocationText}>{slot.location}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  morningBriefCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.tertiaryFixed,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  warningIconBox: {
    marginTop: 2,
  },
  briefContent: {
    flex: 1,
    gap: 4,
  },
  briefHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  briefSubhead: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onTertiaryFixedVariant,
    letterSpacing: 0.5,
  },
  briefDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.onTertiaryFixedVariant,
  },
  briefClasses: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onTertiaryFixedVariant,
  },
  briefMessage: {
    fontSize: 12,
    color: Colors.onTertiaryFixed,
    lineHeight: 16,
  },
  briefBold: {
    fontWeight: '700',
  },
  dismissBtn: {
    padding: 2,
  },
  heroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
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
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onPrimaryContainer,
    letterSpacing: 0.5,
  },
  weekBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weekText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
  },
  courseMeta: {
    gap: 6,
  },
  courseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    flex: 1,
  },
  creditChip: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
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
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaDivider: {
    fontSize: 11,
    color: Colors.outline,
  },
  profRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  progressSection: {
    gap: 6,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
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
    color: Colors.primary,
  },
  remainingText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  actionsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 12,
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionBtnSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  btnPresent: {
    backgroundColor: Colors.primary,
  },
  btnPresentText: {
    color: Colors.onPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  btnAbsent: {
    backgroundColor: Colors.errorContainer,
  },
  btnAbsentText: {
    color: Colors.onErrorContainer,
    fontWeight: '700',
    fontSize: 12,
  },
  btnCancelled: {
    backgroundColor: Colors.surfaceContainerLow,
  },
  btnCancelledText: {
    color: Colors.onSurface,
    fontWeight: '700',
    fontSize: 12,
  },
  nextUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextUpInfo: {
    flex: 1,
    gap: 2,
  },
  nextUpLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  nextUpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  nextUpSub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dotSub: {
    fontSize: 10,
    color: Colors.secondary,
  },
  profSub: {
    fontSize: 10,
    color: Colors.secondary,
  },
  nextUpRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  inTimeBadge: {
    backgroundColor: Colors.tertiaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inTimeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.onTertiaryFixedVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  directionsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  carouselSection: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
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
    width: 220,
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
    marginBottom: 8,
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
    backgroundColor: Colors.primaryFixed,
  },
  statusPillWarning: {
    backgroundColor: Colors.tertiaryFixed,
  },
  statusPillCritical: {
    backgroundColor: Colors.errorContainer,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardCourseTitle: {
    fontSize: 13,
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
    height: 4,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 2,
    position: 'relative',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  targetTick: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: Colors.onSurface,
    borderRadius: 1,
  },
  cardAdvicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adviceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  peekSection: {
    gap: 12,
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
    alignItems: 'center',
  },
  slotTimeCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  slotStartTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  slotEndTime: {
    fontSize: 10,
    color: Colors.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  slotContentCol: {
    flex: 1,
    gap: 3,
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
  },
  activeTag: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  endedTag: {
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
  attendedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attendedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.onPrimaryFixedVariant,
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
    color: Colors.secondary,
  },
  slotBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotSubText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  slotLocationText: {
    fontSize: 10,
    color: Colors.secondary,
  },
});
