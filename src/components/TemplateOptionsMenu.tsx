import { useState } from 'react';
import { 
  EllipsisVerticalIcon, 
  PencilIcon, 
  DocumentDuplicateIcon, 
  ShareIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useAuthContext } from './AuthProvider';
import type { WorkoutTemplate } from '../types';

interface Props {
  template: WorkoutTemplate;
  onEdit: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export default function TemplateOptionsMenu({ template, onEdit, onDelete, onShare }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newName, setNewName] = useState(template.name);
  const { user } = useAuthContext();
  const { duplicateTemplate, renameTemplate } = useWorkoutTemplates(user?.id || '');

  const handleDuplicate = async () => {
    await duplicateTemplate(template.id);
    setIsOpen(false);
  };

  const handleRename = async () => {
    if (newName && newName !== template.name) {
      await renameTemplate(template.id, newName);
      setShowRenameInput(false);
    }
    setIsOpen(false);
  };

  const handleShare = () => {
    onShare?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setIsOpen(false);
  };

  const confirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
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
              Edit Template
            </button>
            <button
              onClick={() => {
                setShowRenameInput(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Rename
            </button>
            <button
              onClick={handleDuplicate}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              Duplicate
            </button>
            <button
              onClick={handleShare}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}

      {/* Rename Modal */}
      {showRenameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Rename Template</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
              placeholder="Enter new name"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRenameInput(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={!newName || newName === template.name}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Template?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}