import { useWorkoutStats } from '../hooks/useWorkoutStats';
import { ChartBarIcon, FireIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  userId: string;
}

export default function CoachInsights({ userId }: Props) {
  const { stats, loading } = useWorkoutStats(userId);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Volume Insights */}
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex items-start gap-3">
          <ChartBarIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Weekly Volume</h3>
            <div className="mt-2 space-y-2">
              {Object.entries(stats.weeklyVolume).map(([muscle, volume]) => (
                <div key={muscle} className="flex justify-between text-sm">
                  <span className="text-gray-600">{muscle}</span>
                  <span className="font-medium">{Math.round(volume).toLocaleString()} lbs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Highlights */}
      {stats.recentPRs.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-start gap-3">
            <FireIcon className="h-6 w-6 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Recent PRs</h3>
              <div className="mt-2 space-y-2">
                {stats.recentPRs.map(pr => (
                  <div key={pr.exerciseId} className="text-sm">
                    <div className="font-medium text-gray-900">{pr.name}</div>
                    <div className="text-green-600">
                      +{pr.percentageIncrease.toFixed(1)}% from {pr.previousWeight}lbs to {pr.weight}lbs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Areas for Improvement */}
      {stats.weakestMuscles.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Focus Areas</h3>
              <div className="mt-2 space-y-2">
                {stats.weakestMuscles.map(muscle => (
                  <div key={muscle} className="text-sm">
                    <div className="font-medium text-gray-900">{muscle}</div>
                    <div className="text-gray-600">
                      Consider adding more {muscle.toLowerCase()} exercises to balance your training
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}