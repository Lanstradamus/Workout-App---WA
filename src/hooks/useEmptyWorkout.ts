import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
type ExerciseLog = Database['public']['Tables']['exercise_logs']['Row'];

export function useEmptyWorkout(userId: string) {
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [loading, setLoading] = useState(false);

  const startEmptyWorkout = async () => {
    try {
      setLoading(true);
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({ user_id: userId })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('Error starting empty workout:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logExercise = async (sessionId: string, exerciseName: string, weight: number, reps: number) => {
    try {
      const { data: log, error } = await supabase
        .from('exercise_logs')
        .insert({
          session_id: sessionId,
          exercise_name: exerciseName,
          weight,
          reps
        })
        .select()
        .single();

      if (error) throw error;
      setExerciseLogs(prev => [...prev, log]);
      return log;
    } catch (error) {
      console.error('Error logging exercise:', error);
      return null;
    }
  };

  const completeWorkout = async (sessionId: string) => {
    try {
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(null);
      setExerciseLogs([]);
      return session;
    } catch (error) {
      console.error('Error completing workout:', error);
      return null;
    }
  };

  return {
    currentSession,
    exerciseLogs,
    loading,
    startEmptyWorkout,
    logExercise,
    completeWorkout
  };
}