import type { Exercise, MuscleGroupName, STRENGTH_MULTIPLIERS } from '../types';

// Calculate one rep max using Brzycki formula
export function calculateOneRepMax(weight: number, reps: number): number {
  return weight / (1.0278 - 0.0278 * reps);
}

// Calculate volume load for a single exercise
export function calculateVolumeLoad(exercise: Exercise): number {
  return exercise.sets * exercise.reps * exercise.weight;
}

// Calculate strength score for an exercise
export function calculateExerciseStrength(exercise: Exercise): number {
  const oneRepMax = calculateOneRepMax(exercise.weight, exercise.reps);
  const volumeLoad = calculateVolumeLoad(exercise);
  const muscleGroup = exercise.muscleGroup as MuscleGroupName;
  const multiplier = STRENGTH_MULTIPLIERS[muscleGroup] || 1;

  // Base strength score formula
  return (oneRepMax * 0.6 + volumeLoad * 0.4) * multiplier;
}

// Calculate XP gained from an exercise
export function calculateExerciseXP(exercise: Exercise): number {
  const volumeLoad = calculateVolumeLoad(exercise);
  // Base XP is volume load divided by 100, rounded to nearest integer
  return Math.round(volumeLoad / 100);
}