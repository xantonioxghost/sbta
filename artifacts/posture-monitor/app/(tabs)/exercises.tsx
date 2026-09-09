import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { SectionLabel } from '@/components/SectionLabel';
import { usePosture } from '@/context/PostureContext';
import { useColors } from '@/hooks/useColors';
import { Exercise, getExercisesForSpineType, SPINE_TYPES, SpineType } from '@/lib/exercises';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { profile, updateProfile } = usePosture();

  const currentSpineType = profile.spineType || 'kyphosis';
  const spineOption = SPINE_TYPES.find((s) => s.id === currentSpineType) || SPINE_TYPES[0];
  const exercises = getExercisesForSpineType(currentSpineType);

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [showSpineModal, setShowSpineModal] = useState(false);

  const toggleComplete = (id: string) => {
    setCompletedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  const selectSpineType = (type: SpineType) => {
    updateProfile({ ...profile, spineType: type });
    setShowSpineModal(false);
  };

  const progressPercent = Math.round((completedIds.length / Math.max(1, exercises.length)) * 100);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: 112 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>POSTURE REHAB</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Daily Exercises</Text>
        </View>
        <Pressable
          onPress={() => setShowSpineModal(true)}
          style={({ pressed }) => [
            styles.spineSelectorBtn,
            { backgroundColor: colors.card, borderColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Icon name="target" size={16} color={colors.primary} />
          <Text style={[styles.spineBtnText, { color: colors.primary }]}>{spineOption.badge}</Text>
          <Icon name="chevron-down" size={14} color={colors.primary} />
        </Pressable>
      </View>

      {/* Spine Type Overview Banner */}
      <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.bannerTop}>
          <Text style={[styles.bannerLabel, { color: colors.mutedForeground }]}>YOUR SPINE CLASSIFICATION</Text>
          <Pressable onPress={() => setShowSpineModal(true)}>
            <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
          </Pressable>
        </View>
        <Text style={[styles.bannerTitle, { color: colors.foreground }]}>{spineOption.title}</Text>
        <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>{spineOption.description}</Text>
      </View>

      {/* Daily Progress Widget */}
      <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.progressTop}>
          <View>
            <Text style={[styles.progressLabel, { color: colors.foreground }]}>Today's Routine</Text>
            <Text style={[styles.progressSub, { color: colors.mutedForeground }]}>
              {completedIds.length} of {exercises.length} exercises completed
            </Text>
          </View>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>{progressPercent}%</Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      </View>

      <SectionLabel>Tailored Exercises ({exercises.length})</SectionLabel>

      {/* Exercise Cards */}
      <View style={styles.exerciseList}>
        {exercises.map((exercise) => {
          const isDone = completedIds.includes(exercise.id);
          return (
            <View
              key={exercise.id}
              style={[
                styles.exerciseCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isDone ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                    {exercise.category}
                  </Text>
                </View>
                <Text style={[styles.durationText, { color: colors.mutedForeground }]}>
                  {exercise.duration}
                </Text>
              </View>

              <Text style={[styles.exerciseTitle, { color: colors.foreground }]}>{exercise.title}</Text>
              <Text style={[styles.exerciseBenefit, { color: colors.mutedForeground }]}>
                {exercise.benefit}
              </Text>

              <View style={styles.cardMetaRow}>
                <Text style={[styles.metaText, { color: colors.primary }]}>🎯 {exercise.targetArea}</Text>
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>⏱ {exercise.reps}</Text>
              </View>

              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => setActiveExercise(exercise)}
                  style={({ pressed }) => [
                    styles.detailsBtn,
                    { backgroundColor: colors.muted, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Icon name="clock" size={15} color={colors.foreground} />
                  <Text style={[styles.detailsBtnText, { color: colors.foreground }]}>View Steps</Text>
                </Pressable>

                <Pressable
                  onPress={() => toggleComplete(exercise.id)}
                  style={({ pressed }) => [
                    styles.completeBtn,
                    {
                      backgroundColor: isDone ? colors.primary : colors.secondary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Icon
                    name="check"
                    size={16}
                    color={isDone ? colors.primaryForeground : colors.primary}
                  />
                  <Text
                    style={[
                      styles.completeBtnText,
                      { color: isDone ? colors.primaryForeground : colors.primary },
                    ]}
                  >
                    {isDone ? 'Completed' : 'Mark Done'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* EXERCISE STEPS MODAL */}
      <Modal visible={Boolean(activeExercise)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalCategory, { color: colors.primary }]}>
                  {activeExercise?.category}
                </Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                  {activeExercise?.title}
                </Text>
              </View>
              <Pressable
                onPress={() => setActiveExercise(null)}
                style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Icon name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <Text style={[styles.modalSectionLabel, { color: colors.mutedForeground }]}>
                TARGET BENEFIT
              </Text>
              <Text style={[styles.modalBenefitText, { color: colors.foreground }]}>
                {activeExercise?.benefit}
              </Text>

              <Text style={[styles.modalSectionLabel, { color: colors.mutedForeground, marginTop: 16 }]}>
                STEP-BY-STEP INSTRUCTIONS
              </Text>
              {activeExercise?.instructions.map((stepText, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={[styles.stepNumDot, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.stepNumText, { color: colors.primary }]}>{idx + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{stepText}</Text>
                </View>
              ))}
            </ScrollView>

            <Pressable
              onPress={() => {
                if (activeExercise) toggleComplete(activeExercise.id);
                setActiveExercise(null);
              }}
              style={({ pressed }) => [
                styles.modalDoneBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Icon name="check" size={18} color={colors.primaryForeground} />
              <Text style={[styles.modalDoneBtnText, { color: colors.primaryForeground }]}>
                {activeExercise && completedIds.includes(activeExercise.id)
                  ? 'Done — Mark Incomplete'
                  : 'Complete Exercise'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* SPINE TYPE SELECTOR MODAL */}
      <Modal visible={showSpineModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalCategory, { color: colors.primary }]}>SPINE CLASSIFICATION</Text>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Posture Shape</Text>
              </View>
              <Pressable
                onPress={() => setShowSpineModal(false)}
                style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}
              >
                <Icon name="x" size={20} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {SPINE_TYPES.map((type) => {
                const isSel = currentSpineType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => selectSpineType(type.id)}
                    style={[
                      styles.spinePickerOption,
                      {
                        backgroundColor: isSel ? colors.secondary : colors.muted,
                        borderColor: isSel ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={styles.spineCardTop}>
                      <Text style={[styles.spineCardTitle, { color: colors.foreground }]}>{type.title}</Text>
                      {isSel && <Icon name="check" size={16} color={colors.primary} />}
                    </View>
                    <Text style={[styles.spineCardSub, { color: colors.mutedForeground }]}>
                      {type.description}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.3, marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, letterSpacing: -0.7 },
  spineSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  spineBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  banner: {
    marginHorizontal: 22,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bannerLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1 },
  changeText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  bannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginBottom: 4 },
  bannerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  progressCard: {
    marginHorizontal: 22,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressLabel: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  progressSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
  progressPercent: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  progressBarTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  exerciseList: { marginHorizontal: 22, gap: 14 },
  exerciseCard: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  durationText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  exerciseTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  exerciseBenefit: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  cardMetaRow: { flexDirection: 'row', gap: 16, marginTop: 2 },
  metaText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  detailsBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailsBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  completeBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  completeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  modalCategory: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, marginTop: 4 },
  closeBtn: { padding: 4 },
  modalSectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  modalBenefitText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  stepRow: { flexDirection: 'row', gap: 12, marginTop: 10, alignItems: 'flex-start' },
  stepNumDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  stepText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  modalDoneBtn: {
    height: 50,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  modalDoneBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  spinePickerOption: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  spineCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spineCardTitle: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  spineCardSub: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
});
