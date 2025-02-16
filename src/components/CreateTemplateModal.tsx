import { useState } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  ClockIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useAuthContext } from './AuthProvider';
import type { Exercise, WorkoutTemplate } from '../types';
import ExerciseSelectionScreen from './ExerciseSelectionScreen';

interface Props {
  template?: WorkoutTemplate | null;
  onClose: () => void;
}

interface ExerciseSet {
  weight: string;
  reps: string;
  isComplete: boolean;
}

interface ExerciseState {
  exercise: Exercise;
  sets: ExerciseSet[];
}

interface ExerciseOptionsProps {
  onClose: () => void;
  onReplace: () => void;
  onToggleRestTimer: () => void;
  onToggleWeightUnit: () => void;
  onViewPRs: () => void;
}

function ExerciseOptionsMenu({ onClose, onReplace, onToggleRestTimer, onToggleWeightUnit, onViewPRs }: ExerciseOptionsProps) {
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute right-4 top-16 w-56 bg-white rounded-xl shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <button
          onClick={onReplace}
          className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowPathIcon className="h-5 w-5 text-gray-400" />
          Replace Exercise
        </button>
        <button
          onClick={onToggleRestTimer}
          className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <ClockIcon className="h-5 w-5 text-gray-400" />
          Auto Rest Timer
        </button>
        <button
          onClick={onToggleWeightUnit}
          className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <ScaleIcon className="h-5 w-5 text-gray-400" />
          Weight Unit (lbs)
        </button>
        <button
          onClick={onViewPRs}
          className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-t"
        >
          View PRs
        </button>
      </div>
    </div>
  );
}

export default function CreateTemplateModal({ onClose, template }: Props) {
  const { user } = useAuthContext();
  const { createTemplate, updateTemplate } = useWorkoutTemplates(user?.id || '');
  const [name, setName] = useState(template?.name || '');
  const [exercises, setExercises] = useState<ExerciseState[]>(
    (template?.exercises as Exercise[])?.map(exercise => ({
      exercise,
      sets: [{ weight: '', reps: '', isComplete: false }]
    })) || []
  );
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [showExerciseOptions, setShowExerciseOptions] = useState(false);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || exercises.length === 0) return;

    setLoading(true);
    let result;
    
    const exerciseData = exercises.map(({ exercise }) => exercise);
    
    if (template) {
      result = await updateTemplate(template.id, {
        name,
        exercises: exerciseData
      });
    } else {
      result = await createTemplate(name, exerciseData);
    }
    
    setLoading(false);
    if (result) {
      onClose();
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    if (selectedExerciseIndex !== null) {
      setExercises(prev => {
        const updated = [...prev];
        updated[selectedExerciseIndex] = {
          exercise,
          sets: [{ weight: '', reps: '', isComplete: false }]
        };
        return updated;
      });
      setSelectedExerciseIndex(null);
    } else {
      setExercises(prev => [...prev, {
        exercise,
        sets: [{ weight: '', reps: '', isComplete: false }]
      }]);
    }
    setShowExerciseList(false);
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

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: string) => {
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

  const isSetValid = (set: ExerciseSet): boolean => {
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
      return updated;
    });
  };

  if (showExerciseList) {
    return (
      <ExerciseSelectionScreen
        onClose={() => setShowExerciseList(false)}
        onSelect={handleExerciseSelect}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={onClose} className="text-gray-600">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template Name"
          className="text-center text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !name || exercises.length === 0}
          className="text-blue-500 font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
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
                  <button
                    onClick={() => {
                      setSelectedExerciseIndex(exerciseIndex);
                      setShowExerciseOptions(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full"
                  >
                    <EllipsisHorizontalIcon className="h-6 w-6" />
                  </button>
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
        </div>
      </div>

      {/* Add Exercise Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={() => {
            setSelectedExerciseIndex(null);
            setShowExerciseList(true);
          }}
          className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          Add Exercise
        </button>
      </div>

      {/* Exercise Options Menu */}
      {showExerciseOptions && selectedExerciseIndex !== null && (
        <ExerciseOptionsMenu
          onClose={() => setShowExerciseOptions(false)}
          onReplace={() => {
            setShowExerciseOptions(false);
            setShowExerciseList(true);
          }}
          onToggleRestTimer={() => {
            // TODO: Implement rest timer
            setShowExerciseOptions(false);
          }}
          onToggleWeightUnit={() => {
            // TODO: Implement weight unit toggle
            setShowExerciseOptions(false);
          }}
          onViewPRs={() => {
            // TODO: Implement PR view
            setShowExerciseOptions(false);
          }}
        />
      )}
    </div>
  );
}