import { useState } from 'react';
import { 
  EllipsisHorizontalIcon, 
  PencilIcon, 
  ChartBarIcon, 
  ArrowsUpDownIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  onEdit: () => void;
  onViewHistory: () => void;
  onReorder: () => void;
  onDelete: () => void;
}

export default function ExerciseOptionsMenu({ exercise, onEdit, onViewHistory, onReorder, onDelete }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20 py-1">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Exercise
            </button>
            <button
              onClick={() => {
                onViewHistory();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <ChartBarIcon className="h-4 w-4" />
              View History
            </button>
            <button
              onClick={() => {
                onReorder();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
              Reorder
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}