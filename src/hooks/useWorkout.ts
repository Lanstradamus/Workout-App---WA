import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { Exercise, ExerciseHistory } from '../types';

type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];

export function useWorkout(userId: string) {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(false);

  const ensureUserProfile = useCallback(async (userId: string) => {
    if (!userId) return false;
    
    try {
      // First try to get the user profile
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingUser) {
        // Create user profile if it doesn't exist
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: `user_${userId.slice(0, 8)}`,
          });

        if (createError) throw createError;

        // Create default muscle groups for the user
        const defaultMuscleGroups = [
          'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'
        ].map(name => ({
          user_id: userId,
          name,
          level: 1,
          xp: 0,
          strength: 0,
          is_locked: name !== 'Chest' // Only Chest is unlocked by default
        }));

        const { error: muscleGroupError } = await supabase
          .from('muscle_groups')
          .insert(defaultMuscleGroups);

        if (muscleGroupError) throw muscleGroupError;
      }

      return true;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return false;
    }
  }, []);

  const startWorkout = useCallback(async () => {
    if (!userId) return null;

    try {
      setLoading(true);

      // Ensure user profile exists before creating workout
      const profileExists = await ensureUserProfile(userId);
      if (!profileExists) {
        throw new Error('Could not create or verify user profile');
      }

      const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentWorkout(workout);
      return workout;
    } catch (error) {
      console.error('Error starting workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId, ensureUserProfile]);

  const addExercise = useCallback(async (workoutId: string, exercise: Exercise) => {
    try {
      setLoading(true);
      const { data: workoutExercise, error } = await supabase
        .from('workout_exercises')
        .insert({
          workout_id: workoutId,
          exercise_id: exercise.id,
          sets: [],
        })
        .select()
        .single();

      if (error) throw error;
      setExercises(prev => [...prev, workoutExercise]);
      return workoutExercise;
    } catch (error) {
      console.error('Error adding exercise:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSets = useCallback(async (exerciseId: string, sets: ExerciseHistory['sets']) => {
    try {
      setLoading(true);
      const { data: workoutExercise, error } = await supabase
        .from('workout_exercises')
        .update({ sets })
        .eq('id', exerciseId)
        .select()
        .single();

      if (error) throw error;
      setExercises(prev => 
        prev.map(e => e.id === exerciseId ? workoutExercise : e)
      );
      return workoutExercise;
    } catch (error) {
      console.error('Error updating sets:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeWorkout = useCallback(async (workoutId: string) => {
    try {
      setLoading(true);
      const { data: workout, error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq('id', workoutId)
        .select()
        .single();

      if (error) throw error;
      setCurrentWorkout(null);
      setExercises([]);
      return workout;
    } catch (error) {
      console.error('Error completing workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentWorkout,
    exercises,
    loading,
    startWorkout,
    addExercise,
    updateSets,
    completeWorkout,
  };
}