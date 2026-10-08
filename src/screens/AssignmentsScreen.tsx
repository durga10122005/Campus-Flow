import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Assignment } from '../data/mockData';

export const AssignmentsScreen: React.FC = () => {
  const {
    assignments,
    courses,
    toggleAssignmentStatus,
    addAssignment,
    deleteAssignment,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'week' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newCategory, setNewCategory] = useState<'urgent' | 'week' | 'upcoming'>('urgent');

  const filteredAssignments = assignments.filter(item => {
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'urgent') return item.category === 'urgent' && item.status === 'pending';
    if (activeFilter === 'week') return item.category === 'week' && item.status === 'pending';
    if (activeFilter === 'completed') return item.status === 'submitted';
    return true;
  });

  const handleCreateTask = () => {
    if (!newTitle.trim()) {
      showToast('Please enter an assignment title', 'warning');
      return;
    }

    addAssignment({
      courseCode: newCode.trim() || (courses[0]?.code || 'CS-501'),
      courseName: 'Academic Deliverable',
      title: newTitle.trim(),
      room: 'Main Campus',
      weightage: newWeight.trim() || '20% Weight',
      dueDate: newDueDate.trim() || 'In 3 days',
      timeLeft: newCategory === 'urgent' ? '24h left' : 'In 4 days',
      description: 'Coursework task and lab deliverables.',
      progressPercentage: 0,
      milestones: '0 of 3 milestones verified',
      status: 'pending',
      category: newCategory,
    });

    setNewTitle('');
    setNewCode('');
    setNewDueDate('');
    setNewWeight('');
    setModalVisible(false);
  };

  const urgentCount = assignments.filter(a => a.category === 'urgent' && a.status === 'pending').length;
  const weekCount = assignments.filter(a => a.category === 'week' && a.status === 'pending').length;
  const completedCount = assignments.filter(a => a.status === 'submitted').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Title & Top Action Bar */}
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>Assignments & Projects</Text>
            <Text style={styles.screenSub}>
              Semester 5 • {assignments.filter(a => a.status === 'pending').length} pending deliverables
            </Text>
          </View>

          <View style={styles.titleButtons}>
            <TouchableOpacity
              style={styles.newTaskBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={18} color={Colors.onPrimary} />
              <Text style={styles.newTaskBtnText}>New Task</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks, codes, or rubrics..."
            placeholderTextColor={Colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.cmdKBadge}>
            <Text style={styles.cmdKText}>⌘K</Text>
          </View>
        </View>

        {/* 3. Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>All</Text>
            <View style={[styles.chipCountBadge, activeFilter === 'all' && styles.chipCountBadgeActive]}>
              <Text style={[styles.chipCountText, activeFilter === 'all' && styles.chipCountTextActive]}>{assignments.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'urgent' && styles.filterChipActive]}
            onPress={() => setActiveFilter('urgent')}
          >
            <View style={styles.pulseRedDot} />
            <Text style={[styles.filterChipText, activeFilter === 'urgent' && styles.filterChipTextActive]}>Urgent</Text>
            <View style={[styles.chipCountBadge, { backgroundColor: Colors.errorContainer }]}>
              <Text style={[styles.chipCountText, { color: Colors.onErrorContainer }]}>{urgentCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'week' && styles.filterChipActive]}
            onPress={() => setActiveFilter('week')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'week' && styles.filterChipTextActive]}>This Week</Text>
            <View style={styles.chipCountBadge}>
              <Text style={styles.chipCountText}>{weekCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'completed' && styles.filterChipActive]}
            onPress={() => setActiveFilter('completed')}
          >
            <MaterialIcons
              name="check-circle"
              size={13}
              color={activeFilter === 'completed' ? Colors.onPrimary : Colors.primary}
            />
            <Text style={[styles.filterChipText, activeFilter === 'completed' && styles.filterChipTextActive]}>Completed</Text>
            <View style={styles.chipCountBadge}>
              <Text style={styles.chipCountText}>{completedCount}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 4. Assignments List */}
      <View style={styles.listSection}>
        {filteredAssignments.map(task => {
          const isUrgent = task.category === 'urgent';
          const isSubmitted = task.status === 'submitted';

          return (
            <View key={task.id} style={styles.assignmentCard}>
              {/* Left Color Stripe */}
              <View
                style={[
                  styles.cardStripe,
                  {
                    backgroundColor: isSubmitted
                      ? Colors.primary
                      : isUrgent
                      ? Colors.error
                      : Colors.tertiary,
                  },
                ]}
              />

              <View style={styles.cardHeaderRow}>
                <View style={styles.courseTagRow}>
                  <Text style={styles.codeText}>{task.courseCode}</Text>
                  <Text style={styles.roomSubText}>{task.room}</Text>
                  <View style={styles.weightBadge}>
                    <Text style={styles.weightText}>{task.weightage}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => deleteAssignment(task.id)}
                  style={styles.deleteTaskBtn}
                >
                  <MaterialIcons name="delete-outline" size={18} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDesc}>{task.description}</Text>

              {/* Deadline Pill */}
              <View
                style={[
                  styles.deadlinePill,
                  isUrgent && !isSubmitted
                    ? styles.deadlinePillUrgent
                    : styles.deadlinePillNormal,
                ]}
              >
                <View style={styles.deadlineLeft}>
                  <MaterialIcons
                    name="alarm"
                    size={16}
                    color={isUrgent && !isSubmitted ? Colors.onErrorContainer : Colors.onSurface}
                  />
                  <Text
                    style={[
                      styles.dueDateText,
                      { color: isUrgent && !isSubmitted ? Colors.onErrorContainer : Colors.onSurface },
                    ]}
                  >
                    {task.dueDate}
                  </Text>
                </View>
                <View style={styles.timeLeftBadge}>
                  <Text
                    style={[
                      styles.timeLeftText,
                      { color: isUrgent && !isSubmitted ? Colors.error : Colors.primary },
                    ]}
                  >
                    {task.timeLeft}
                  </Text>
                </View>
              </View>

              {/* Progress Bar & Milestones */}
              <View style={styles.progressCol}>
                <View style={styles.milestoneRow}>
                  <Text style={styles.milestoneText}>{task.milestones}</Text>
                  <Text style={styles.progressPctText}>{task.progressPercentage}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${task.progressPercentage}%`,
                        backgroundColor: isSubmitted ? Colors.primary : Colors.primaryContainer,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Action Buttons: Submitted vs Not Submitted */}
              <View style={styles.cardActionsRow}>
                <View style={styles.toggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.toggleStatusBtn,
                      isSubmitted && styles.toggleStatusBtnActive,
                    ]}
                    onPress={() => toggleAssignmentStatus(task.id)}
                  >
                    <MaterialIcons
                      name="check"
                      size={14}
                      color={isSubmitted ? Colors.onPrimary : Colors.secondary}
                    />
                    <Text
                      style={[
                        styles.toggleStatusText,
                        isSubmitted && styles.toggleStatusTextActive,
                      ]}
                    >
                      Submitted
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleStatusBtn,
                      !isSubmitted && styles.toggleStatusBtnError,
                    ]}
                    onPress={() => toggleAssignmentStatus(task.id)}
                  >
                    <MaterialIcons
                      name="close"
                      size={14}
                      color={!isSubmitted ? Colors.onErrorContainer : Colors.secondary}
                    />
                    <Text
                      style={[
                        styles.toggleStatusText,
                        !isSubmitted && styles.toggleStatusTextError,
                      ]}
                    >
                      Pending
                    </Text>
                  </TouchableOpacity>
                </View>

                {task.partners && (
                  <View style={styles.partnersRow}>
                    {task.partners.map((p, idx) => (
                      <View key={idx} style={styles.partnerAvatar}>
                        <Text style={styles.partnerInitials}>{p}</Text>
                      </View>
                    ))}
                    <Text style={styles.partnerNote}>Study group synced</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* New Task Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Assignment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title / Deliverable</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Distributed Consensus Report"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Course Code</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="CS-501"
                  value={newCode}
                  onChangeText={setNewCode}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Weightage</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="20% Weight"
                  value={newWeight}
                  onChangeText={setNewWeight}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Due Date & Time</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Tomorrow, 11:59 PM"
                value={newDueDate}
                onChangeText={setNewDueDate}
              />
            </View>

            {/* Urgency category chips */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority Window</Text>
              <View style={styles.categoryPickerRow}>
                {(['urgent', 'week', 'upcoming'] as const).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPickerChip,
                      newCategory === cat && styles.categoryPickerChipActive,
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryPickerText,
                        newCategory === cat && styles.categoryPickerTextActive,
                      ]}
                    >
                      {cat === 'urgent' ? '🔴 Due <48h' : cat === 'week' ? '🟡 This Week' : '🟢 Later'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateTask}
              >
                <Text style={styles.submitBtnText}>Add Assignment</Text>
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
  headerSection: {
    gap: 12,
  },
  titleRow: {
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
  titleButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  newTaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurface,
  },
  cmdKBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cmdKText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  filterChipsRow: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
  },
  pulseRedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  chipCountBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  chipCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  chipCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  chipCountTextActive: {
    color: '#ffffff',
  },
  listSection: {
    gap: 14,
  },
  assignmentCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    paddingLeft: 18,
    borderWidth: 1,
    borderColor: Colors.divider,
    position: 'relative',
    overflow: 'hidden',
    gap: 10,
  },
  cardStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roomSubText: {
    fontSize: 11,
    color: Colors.secondary,
  },
  weightBadge: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSecondaryContainer,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  deleteTaskBtn: {
    padding: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 20,
  },
  taskDesc: {
    fontSize: 12,
    color: Colors.secondary,
    lineHeight: 16,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  deadlinePillUrgent: {
    backgroundColor: 'rgba(255, 218, 214, 0.7)',
  },
  deadlinePillNormal: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  deadlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeLeftBadge: {
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeLeftText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  progressCol: {
    gap: 6,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '500',
  },
  progressPctText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 3,
    borderRadius: 10,
    gap: 4,
  },
  toggleStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleStatusBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleStatusBtnError: {
    backgroundColor: Colors.errorContainer,
  },
  toggleStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  toggleStatusTextActive: {
    color: Colors.onPrimary,
  },
  toggleStatusTextError: {
    color: Colors.onErrorContainer,
  },
  partnersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  partnerAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitials: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  partnerNote: {
    fontSize: 10,
    color: Colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
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
  categoryPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPickerChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  categoryPickerChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryPickerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  categoryPickerTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
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
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
