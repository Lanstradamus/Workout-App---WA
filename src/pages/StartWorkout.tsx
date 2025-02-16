import { useState } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import WorkoutLogger from '../components/WorkoutLogger';

export default function StartWorkout() {
  const { user } = useAuthContext();
  const [isPremium] = useState(false);

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Start Workout</h1>
      <WorkoutLogger isPremium={isPremium} />
    </div>
  );
}