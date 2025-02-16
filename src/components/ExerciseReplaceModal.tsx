import { useState } from 'react';
import type { Exercise } from '../types';

interface BottomSheetProps {
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function BottomSheet({ title, options = [], selectedValue, onSelect, onClose }: BottomSheetProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white rounded-xl overflow-hidden w-full max-w-sm mx-4"
        style={{ maxHeight: '60vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b">
          <h3 className="text-base font-medium text-center py-3">{title}</h3>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(60vh - 48px)' }}>
          {options.map(option => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className={`w-full px-4 py-3 text-left text-sm ${
                option === selectedValue 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core'
];

const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Smith Machine',
  'Kettlebell',
  'Other'
];

export default function ExerciseReplaceModal({ onClose, onSelect }: Props) {
  const [step, setStep] = useState<'muscle' | 'equipment' | 'name'>('muscle');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [exerciseName, setExerciseName] = useState<string>('');

  const handleMuscleSelect = (muscle: string) => {
    setSelectedMuscle(muscle);
    setStep('equipment');
  };

  const handleEquipmentSelect = (equipment: string) => {
    setSelectedEquipment(equipment);
    setStep('name');
  };

  const handleCreateExercise = () => {
    if (!exerciseName || !selectedMuscle || !selectedEquipment) return;

    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: exerciseName,
      muscleGroup: selectedMuscle,
      equipmentType: selectedEquipment,
      isCustom: true
    };

    onSelect(exercise);
  };

  if (step === 'muscle') {
    return (
      <BottomSheet
        title="Select Muscle Group"
        options={MUSCLE_GROUPS}
        selectedValue={selectedMuscle}
        onSelect={handleMuscleSelect}
        onClose={onClose}
      />
    );
  }

  if (step === 'equipment') {
    return (
      <BottomSheet
        title="Select Equipment"
        options={EQUIPMENT_TYPES}
        selectedValue={selectedEquipment}
        onSelect={handleEquipmentSelect}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-medium">Name Exercise</h3>
          <button onClick={onClose} className="text-gray-500">
            Cancel
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise Name
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="e.g., Bench Press"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Muscle Group
              </label>
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                {selectedMuscle}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment
              </label>
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                {selectedEquipment}
              </div>
            </div>
          </div>
          <button
            onClick={handleCreateExercise}
            disabled={!exerciseName}
            className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Create Exercise
          </button>
        </div>
      </div>
    </div>
  );
}