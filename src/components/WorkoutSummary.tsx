import { useMemo, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { XMarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { getLevelColor, getLevelName } from '../utils/levelColors';
import type { WorkoutExercise } from '../types';

interface Props {
  sessionId?: string;
  exercises?: WorkoutExercise[];
  duration?: number;
  onClose: () => void;
}

interface WorkoutStats {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  exerciseCount: number;
  startTime: Date | null;
  exercises: Array<{
    name: string;
    sets: Array<{
      weight: number;
      reps: number;
    }>;
  }>;
  muscleGroups: Array<{
    name: string;
    level: number;
    xp: number;
    xpGained: number;
  }>;
  totalXpGained: number;
  currentLevel: number;
  currentXp: number;
  xpForNextLevel: number;
}

export default function WorkoutSummary({ sessionId, exercises: templateExercises, duration: templateDuration, onClose }: Props) {
  const [stats, setStats] = useState<WorkoutStats>({
    totalVolume: 0,
    totalSets: 0,
    totalReps: 0,
    exerciseCount: 0,
    startTime: null,
    exercises: [],
    muscleGroups: [],
    totalXpGained: 0,
    currentLevel: 1,
    currentXp: 0,
    xpForNextLevel: 1000
  });

  useEffect(() => {
    if (sessionId) {
      fetchWorkoutStats();
    } else if (templateExercises) {
      calculateTemplateStats();
    }
  }, [sessionId, templateExercises]);

  const fetchWorkoutStats = async () => {
    if (!sessionId) return;

    try {
      const { data: session } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      const { data: logs } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('session_id', sessionId);

      if (!logs) return;

      const exerciseGroups = logs.reduce((groups: any, log) => {
        if (!groups[log.exercise_name]) {
          groups[log.exercise_name] = [];
        }
        groups[log.exercise_name].push({
          weight: log.weight,
          reps: log.reps
        });
        return groups;
      }, {});

      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;

      const exercises = Object.entries(exerciseGroups).map(([name, sets]) => {
        sets.forEach((set: any) => {
          totalVolume += set.weight * set.reps;
          totalReps += set.reps;
          totalSets++;
        });
        return { name, sets };
      });

      // Calculate XP gained (simplified formula)
      const xpPerVolume = 0.01; // 1 XP per 100 lbs of volume
      const totalXpGained = Math.round(totalVolume * xpPerVolume);

      // Mock muscle group data (in real app, fetch from database)
      const muscleGroups = [
        {
          name: 'Chest',
          level: 3,
          xp: 750,
          xpGained: Math.round(totalXpGained * 0.4)
        },
        {
          name: 'Back',
          level: 2,
          xp: 500,
          xpGained: Math.round(totalXpGained * 0.3)
        },
        {
          name: 'Arms',
          level: 4,
          xp: 250,
          xpGained: Math.round(totalXpGained * 0.3)
        }
      ];

      setStats({
        totalVolume,
        totalSets,
        totalReps,
        exerciseCount: exercises.length,
        startTime: session ? new Date(session.created_at) : null,
        exercises,
        muscleGroups,
        totalXpGained,
        currentLevel: 5,
        currentXp: 450,
        xpForNextLevel: 1000
      });
    } catch (error) {
      console.error('Error fetching workout stats:', error);
    }
  };

  const calculateTemplateStats = () => {
    if (!templateExercises) return;

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    const exercises = templateExercises.map(ex => {
      ex.sets.forEach(set => {
        totalVolume += set.weight * set.reps;
        totalReps += set.reps;
      });
      totalSets += ex.sets.length;
      return {
        name: ex.name,
        sets: ex.sets
      };
    });

    // Calculate XP gained (simplified formula)
    const xpPerVolume = 0.01; // 1 XP per 100 lbs of volume
    const totalXpGained = Math.round(totalVolume * xpPerVolume);

    setStats({
      totalVolume,
      totalSets,
      totalReps,
      exerciseCount: templateExercises.length,
      startTime: new Date(),
      exercises,
      muscleGroups: [],
      totalXpGained,
      currentLevel: 5,
      currentXp: 450,
      xpForNextLevel: 1000
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 bg-white border-b">
          <button onClick={onClose} className="p-2">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-2">
            <ShareIcon className="h-6 w-6 text-blue-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Level Progress */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">⚔️</span>
              <span className="text-2xl font-bold">Level {stats.currentLevel}</span>
            </div>
            <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000"
                style={{ width: `${(stats.currentXp / stats.xpForNextLevel) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              +{stats.totalXpGained} XP gained • {stats.currentXp}/{stats.xpForNextLevel} XP
            </p>
          </div>

          {/* Workout Details */}
          <div className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Pull Bicep (PF)</h2>
            <p className="text-gray-600">{stats.startTime ? formatTime(stats.startTime) : ''}</p>

            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">⏱</span>
                <span>{templateDuration ? formatDuration(Math.floor(templateDuration / 60)) : '0m'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">💪</span>
                <span>{stats.totalVolume.toLocaleString()} lb</span>
              </div>
            </div>

            {/* Muscle Groups Progress */}
            <div className="space-y-4 pt-4">
              <h3 className="font-medium text-gray-900">Muscle Progress</h3>
              {stats.muscleGroups.map((muscle, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{muscle.name}</span>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${getLevelColor(muscle.level)} text-white`}>
                      {getLevelName(muscle.level)}
                    </span>
                  </div>
                  <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${getLevelColor(muscle.level)}`}
                      style={{ width: `${(muscle.xp / 1000) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">+{muscle.xpGained} XP</p>
                </div>
              ))}
            </div>

            {/* Exercise List */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-gray-900">Exercises</h3>
              <div className="space-y-2">
                {stats.exercises.map((exercise, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>{exercise.name}</div>
                    <div>
                      {Math.max(...exercise.sets.map(s => s.weight))} lb × {
                        Math.max(...exercise.sets.map(s => s.reps))
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}