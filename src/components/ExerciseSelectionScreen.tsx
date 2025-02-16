import { useState } from 'react';
import { XMarkIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Exercise } from '../types';

interface Props {
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-gray-100 rounded-lg flex items-center justify-between"
      >
        <span className="text-gray-600">{value || label}</span>
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-20">
            {options.map(option => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm ${
                  option === value 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const MUSCLE_GROUPS = [
  'Any Body Part',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core'
];

const EQUIPMENT_TYPES = [
  'Any Category',
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Smith Machine',
  'Kettlebell',
  'Other'
];

const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    equipmentType: 'Barbell',
    isCustom: false
  },
  {
    id: '2',
    name: 'Squat',
    muscleGroup: 'Legs',
    equipmentType: 'Barbell',
    isCustom: false
  },
  // Add more sample exercises as needed
];

export default function ExerciseSelectionScreen({ onClose, onSelect }: Props) {
  const [muscleGroup, setMuscleGroup] = useState('Any Body Part');
  const [equipmentType, setEquipmentType] = useState('Any Category');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: '',
    equipmentType: ''
  });

  const filteredExercises = SAMPLE_EXERCISES.filter(exercise => {
    const matchesMuscle = muscleGroup === 'Any Body Part' || exercise.muscleGroup === muscleGroup;
    const matchesEquipment = equipmentType === 'Any Category' || exercise.equipmentType === equipmentType;
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesEquipment && matchesSearch;
  });

  const handleCreateExercise = () => {
    if (!newExercise.name || !newExercise.muscleGroup || !newExercise.equipmentType) return;

    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: newExercise.name,
      muscleGroup: newExercise.muscleGroup,
      equipmentType: newExercise.equipmentType,
      isCustom: true
    };

    onSelect(exercise);
  };

  if (showCreateModal) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setShowCreateModal(false)} className="text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">Create Exercise</h2>
          <button
            onClick={handleCreateExercise}
            disabled={!newExercise.name || !newExercise.muscleGroup || !newExercise.equipmentType}
            className="text-blue-500 font-medium disabled:opacity-50"
          >
            Save
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exercise Name
            </label>
            <input
              type="text"
              value={newExercise.name}
              onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 bg-gray-100 rounded-lg"
              placeholder="e.g., Bench Press"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Body Part
            </label>
            <FilterDropdown
              label="Select Body Part"
              options={MUSCLE_GROUPS.filter(m => m !== 'Any Body Part')}
              value={newExercise.muscleGroup}
              onChange={(value) => setNewExercise(prev => ({ ...prev, muscleGroup: value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <FilterDropdown
              label="Select Category"
              options={EQUIPMENT_TYPES.filter(e => e !== 'Any Category')}
              value={newExercise.equipmentType}
              onChange={(value) => setNewExercise(prev => ({ ...prev, equipmentType: value }))}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">Select Exercise</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-500 font-medium flex items-center gap-1"
          >
            <PlusIcon className="h-5 w-5" />
            Create
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full px-4 py-2 bg-gray-100 rounded-lg"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <FilterDropdown
              label="Any Body Part"
              options={MUSCLE_GROUPS}
              value={muscleGroup}
              onChange={setMuscleGroup}
            />
            <FilterDropdown
              label="Any Category"
              options={EQUIPMENT_TYPES}
              value={equipmentType}
              onChange={setEquipmentType}
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y">
            {filteredExercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-start justify-between"
              >
                <div>
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-gray-600">{exercise.muscleGroup}</p>
                </div>
                <span className="text-sm text-gray-500">{exercise.equipmentType}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}