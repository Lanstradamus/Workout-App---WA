import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useEmptyWorkout } from '../hooks/useEmptyWorkout';
import { useAuthContext } from './AuthProvider';
import ExerciseSelectionScreen from './ExerciseSelectionScreen';
import type { Exercise } from '../types';

interface Props {
  onClose: () => void;
  onFinish: (sessionId: string, duration: number) => void;
}

interface Set {
  weight: string;
  reps: string;
  isComplete: boolean;
}

interface ExerciseState {
  exercise: Exercise;
  sets: Set[];
}

export default function EmptyWorkout({ onClose, onFinish }: Props) {
  const { user } = useAuthContext();
  const { currentSession, startEmptyWorkout, logExercise, completeWorkout } = useEmptyWorkout(user?.id || '');
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exercises, setExercises] = useState<ExerciseState[]>([]);
  const [showExerciseSelect, setShowExerciseSelect] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  useEffect(() => {
    if (user?.id && !currentSession) {
      startEmptyWorkout();
    }
  }, [user?.id, currentSession, startEmptyWorkout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExercise = (exercise: Exercise) => {
    setExercises(prev => [...prev, {
      exercise,
      sets: [{ weight: '', reps: '', isComplete: false }]
    }]);
    setShowExerciseSelect(false);
  };

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
      updated[exerciseIndex].sets.push({
        weight: lastSet.weight || '',
        reps: lastSet.reps || '',
        isComplete: false
      });
      return updated;
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: string) => {
    if (value.startsWith('-')) return;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setExercises(prev => {
      const updated = [...prev];
      updated[exerciseIndex].sets[setIndex][field] = value;
      
      const set = updated[exerciseIndex].sets[setIndex];
      if (set.isComplete && !isSetValid(set)) {
        set.isComplete = false;
      }
      
      return updated;
    });
  };

  const isSetValid = (set: Set): boolean => {
    const weight = parseFloat(set.weight);
    const reps = parseInt(set.reps, 10);
    return !isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0;
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => {
      const updated = [...prev];
      const set = updated[exerciseIndex].sets[setIndex];
      
      if (!set.isComplete && !isSetValid(set)) {
        return prev;
      }
      
      set.isComplete = !set.isComplete;

      if (set.isComplete && currentSession) {
        logExercise(
          currentSession.id,
          updated[exerciseIndex].exercise.name,
          parseFloat(set.weight),
          parseInt(set.reps, 10)
        );
      }

      return updated;
    });
  };

  const handleFinish = async () => {
    if (currentSession) {
      await completeWorkout(currentSession.id);
      onFinish(currentSession.id, elapsedTime);
    }
  };

  if (showExerciseSelect) {
    return (
      <ExerciseSelectionScreen
        onClose={() => setShowExerciseSelect(false)}
        onSelect={handleAddExercise}
      />
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <button 
          onClick={() => setShowCancelConfirm(true)} 
          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
          <ClockIcon className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
        </div>
        <button 
          onClick={handleFinish}
          className="h-10 px-6 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
        >
          Finish
        </button>
      </div>

      {/* Exercise List */}
      <div className="flex-1 p-4 space-y-4">
        {exercises.map((exerciseState, exerciseIndex) => (
          <div key={exerciseIndex} className="bg-white rounded-2xl shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-500">
                    {exerciseState.exercise.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {exerciseState.exercise.muscleGroup}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-[3rem,1fr,4rem,4rem,3rem] gap-2 mb-3 text-xs font-medium text-gray-500">
                <div className="text-center">Set</div>
                <div>Previous</div>
                <div className="text-center">lbs</div>
                <div className="text-center">Reps</div>
                <div></div>
              </div>

              {exerciseState.sets.map((set, setIndex) => {
                const isValid = isSetValid(set);
                return (
                  <div key={setIndex} className="grid grid-cols-[3rem,1fr,4rem,4rem,3rem] gap-2 mb-2 items-center">
                    <div className="flex justify-center">
                      <span className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                        {setIndex + 1}
                      </span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      {setIndex === 0 ? '77 lb × 12' : ''}
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={set.weight}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
                      className="w-full h-9 bg-gray-100 rounded-lg text-center text-sm"
                      placeholder="0"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={set.reps}
                      onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                      className="w-full h-9 bg-gray-100 rounded-lg text-center text-sm"
                      placeholder="0"
                    />
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
                        disabled={!isValid && !set.isComplete}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          transition-all duration-200 ease-in-out
                          ${isValid || set.isComplete
                            ? 'hover:opacity-90 active:scale-95'
                            : 'cursor-not-allowed opacity-50'
                          }
                          ${set.isComplete
                            ? 'bg-green-500 shadow-sm'
                            : 'bg-gray-200'
                          }
                        `}
                      >
                        <CheckCircleIcon 
                          className={`
                            h-8 w-8 transition-all duration-200 ease-in-out
                            ${set.isComplete
                              ? 'text-white scale-105'
                              : 'text-gray-400 scale-95'
                            }
                          `}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => addSet(exerciseIndex)}
                className="w-full mt-3 py-2.5 text-center text-blue-500 hover:bg-blue-50 rounded-xl text-sm font-medium transition-colors"
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}
        
        <button
          onClick={() => setShowExerciseSelect(true)}
          className="w-full py-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 text-blue-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add Exercise
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Cancel Workout?</h3>
            <p className="text-gray-600 mb-6">
              All progress will be lost. Are you sure you want to cancel this workout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Keep Workout
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              >
                Cancel Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}