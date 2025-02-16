import { useState, useCallback } from 'react';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useAuthContext } from '../components/AuthProvider';
import type { Exercise, WorkoutTemplate } from '../types';
import { 
  PlusIcon, 
  ClockIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import WorkoutSummary from './WorkoutSummary';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import ActiveWorkout from './ActiveWorkout';
import EmptyWorkout from './EmptyWorkout';
import CreateTemplateModal from './CreateTemplateModal';
import TemplateOptionsMenu from './TemplateOptionsMenu';

interface Props {
  isPremium: boolean;
}

export default function WorkoutLogger({ isPremium }: Props) {
  const { user } = useAuthContext();
  const { templates, loading: templatesLoading, error: templatesError, duplicateTemplate, deleteTemplate } = useWorkoutTemplates(user?.id || '');
  const { history } = useWorkoutHistory(user?.id || '');
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [emptyWorkoutStarted, setEmptyWorkoutStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);

  const getLastPerformed = (templateId: string) => {
    const lastWorkout = history.find(h => h.template_id === templateId);
    if (!lastWorkout) return null;
    const days = Math.floor((Date.now() - new Date(lastWorkout.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
  };

  const handleTemplateSelect = useCallback((template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  }, []);

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setShowTemplateDetails(false);
  };

  const handleStartEmptyWorkout = () => {
    setEmptyWorkoutStarted(true);
    setShowTemplates(false);
  };

  const handleFinishWorkout = () => {
    setShowSummary(true);
  };

  const handleFinishEmptyWorkout = (sessionId: string, duration: number) => {
    setCurrentSessionId(sessionId);
    setDuration(duration);
    setShowSummary(true);
    setEmptyWorkoutStarted(false);
  };

  const handleEditTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setShowCreateTemplate(true);
    setShowTemplateDetails(false);
  };

  const handleShareTemplate = async (template: WorkoutTemplate) => {
    const shareUrl = `${window.location.origin}/share-template/${template.id}`;
    await navigator.clipboard.writeText(shareUrl);
    alert('Template share link copied to clipboard!');
  };

  if (templatesLoading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (templatesError) {
    return (
      <div className="p-4 pb-20">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Templates</h3>
          <p className="text-red-600">{templatesError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (emptyWorkoutStarted) {
    return (
      <EmptyWorkout
        onClose={() => {
          setEmptyWorkoutStarted(false);
          setShowTemplates(true);
        }}
        onFinish={handleFinishEmptyWorkout}
      />
    );
  }

  if (workoutStarted && selectedTemplate) {
    return (
      <ActiveWorkout
        template={selectedTemplate}
        onClose={() => setWorkoutStarted(false)}
        onFinish={handleFinishWorkout}
      />
    );
  }

  if (showSummary) {
    return (
      <WorkoutSummary
        sessionId={currentSessionId}
        exercises={exercises}
        duration={duration}
        onClose={() => {
          setShowSummary(false);
          setWorkoutStarted(false);
          setSelectedTemplate(null);
          setShowTemplates(true);
          setDuration(0);
          setExercises([]);
          setCurrentSessionId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Start Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Quick Start</h2>
        </div>
        <button
          onClick={handleStartEmptyWorkout}
          className="w-full p-4 text-blue-500 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Start Empty Workout
        </button>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">My Templates</h2>
          <button
            onClick={() => setShowCreateTemplate(true)}
            className="flex items-center gap-1 text-blue-500 font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            Template
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4">
          {templates.map(template => {
            const exercises = template.exercises as Exercise[];
            const previewExercises = exercises.slice(0, 3);
            const lastPerformed = getLastPerformed(template.id);

            return (
              <div
                key={template.id}
                className="bg-gray-50 rounded-lg p-4 relative"
              >
                <div className="absolute top-3 right-3">
                  <TemplateOptionsMenu
                    template={template}
                    onEdit={() => handleEditTemplate(template)}
                    onDelete={async () => {
                      if (await deleteTemplate(template.id)) {
                        // Template deleted successfully
                      }
                    }}
                    onShare={() => handleShareTemplate(template)}
                  />
                </div>
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left pr-10"
                >
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <div className="space-y-1 mb-3">
                    {previewExercises.map((exercise, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <p className="text-sm text-gray-600 truncate">
                          {exercise.name}
                        </p>
                      </div>
                    ))}
                    {exercises.length > 3 && (
                      <p className="text-sm text-gray-500 pl-4">
                        +{exercises.length - 3} more
                      </p>
                    )}
                  </div>
                  {lastPerformed && (
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {lastPerformed}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template Details Modal */}
      {showTemplateDetails && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-lg max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <button
                onClick={() => setShowTemplateDetails(false)}
                className="text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
              <button
                onClick={() => handleEditTemplate(selectedTemplate)}
                className="text-blue-500 font-medium"
              >
                Edit
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {getLastPerformed(selectedTemplate.id) && (
                <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Last performed: {getLastPerformed(selectedTemplate.id)}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                    <ChartBarIcon className="h-4 w-4" />
                    Volume
                  </div>
                  <div className="font-semibold">12,350 lbs</div>
                </div>
                <div className="flex-1 bg-orange-50 rounded-lg p-3">
                  <div className="text-sm text-orange-600 mb-1 flex items-center gap-1">
                    <FireIcon className="h-4 w-4" />
                    PRs
                  </div>
                  <div className="font-semibold">2 last time</div>
                </div>
              </div>

              <div className="space-y-4">
                {(selectedTemplate.exercises as Exercise[]).map((exercise, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <p className="text-sm text-gray-600">{exercise.muscleGroup}</p>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm text-gray-500">Last workout:</div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="text-sm">3 × 12 @ 135 lbs</div>
                          <div className="text-xs text-gray-500">Volume: 4,860 lbs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={handleStartWorkout}
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium"
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateTemplate && (
        <CreateTemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowCreateTemplate(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
}