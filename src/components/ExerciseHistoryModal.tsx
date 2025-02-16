import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Exercise, WorkoutHistory } from '../types';

interface Props {
  exercise: Exercise;
  history: WorkoutHistory[];
  onClose: () => void;
}

export default function ExerciseHistoryModal({ exercise, history, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'history' | 'charts' | 'records'>('history');

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateOneRepMax = (weight: number, reps: number) => {
    return Math.round(weight * (1 + (reps / 30)));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <button onClick={onClose} className="text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
          <h2 className="text-lg font-semibold">{exercise.name}</h2>
          <button className="text-blue-500">Edit</button>
        </div>

        <div className="border-b">
          <div className="flex divide-x">
            {(['history', 'charts', 'records'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y max-h-[60vh] overflow-y-auto">
          {history.map((workout) => (
            <div key={workout.id} className="p-4">
              <div className="text-sm text-gray-500 mb-2">
                {formatDate(workout.created_at)}
              </div>
              <h3 className="font-medium mb-2">{workout.template_name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="font-medium">Sets Performed</div>
                  <div>1RM</div>
                </div>
                {workout.sets.map((set, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      {index + 1} {set.weight} lb × {set.reps}
                    </div>
                    <div>{calculateOneRepMax(set.weight, set.reps)}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-1 text-xs rounded-full bg-teal-100 text-teal-800">
                  1RM
                </button>
                <button className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  VOL.
                </button>
                <button className="px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  WEIGHT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}