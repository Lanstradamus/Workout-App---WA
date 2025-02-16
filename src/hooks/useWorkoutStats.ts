import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MuscleGroup = Database['public']['Tables']['muscle_groups']['Row'];
type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];

interface WorkoutStats {
  weeklyVolume: { [muscle: string]: number };
  monthlyProgress: { [muscle: string]: number };
  weakestMuscles: string[];
  strongestMuscles: string[];
  recentPRs: {
    exerciseId: string;
    name: string;
    weight: number;
    previousWeight: number;
    percentageIncrease: number;
  }[];
}

export function useWorkoutStats(userId: string) {
  const [stats, setStats] = useState<WorkoutStats>({
    weeklyVolume: {},
    monthlyProgress: {},
    weakestMuscles: [],
    strongestMuscles: [],
    recentPRs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchStats() {
      try {
        // Get last month's workouts
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select(`
            id,
            workout_exercises (
              exercise_id,
              sets,
              exercises (
                name,
                muscle_group
              )
            )
          `)
          .eq('user_id', userId)
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (workoutsError) throw workoutsError;

        // Calculate volume per muscle group
        const weeklyVolume: { [muscle: string]: number } = {};
        const monthlyProgress: { [muscle: string]: number } = {};

        workouts?.forEach(workout => {
          workout.workout_exercises.forEach((exercise: any) => {
            const muscleGroup = exercise.exercises.muscle_group;
            const volume = (exercise.sets as any[]).reduce((total, set) => {
              return total + (set.weight * set.reps);
            }, 0);

            weeklyVolume[muscleGroup] = (weeklyVolume[muscleGroup] || 0) + volume;
          });
        });

        // Get muscle groups strength data
        const { data: muscleGroups, error: muscleError } = await supabase
          .from('muscle_groups')
          .select('*')
          .eq('user_id', userId);

        if (muscleError) throw muscleError;

        // Sort muscles by strength
        const sortedMuscles = [...(muscleGroups || [])].sort((a, b) => b.strength - a.strength);
        const strongestMuscles = sortedMuscles.slice(0, 3).map(m => m.name);
        const weakestMuscles = sortedMuscles.slice(-3).map(m => m.name);

        setStats({
          weeklyVolume,
          monthlyProgress,
          weakestMuscles,
          strongestMuscles,
          recentPRs: []
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  return { stats, loading };
}