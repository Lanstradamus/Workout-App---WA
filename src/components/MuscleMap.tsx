import { useMemo } from 'react';
import type { MuscleGroup } from '../types';
import { getLevelColor } from '../utils/levelColors';

interface Props {
  muscleGroups: MuscleGroup[];
  isPremium: boolean;
}

export default function MuscleMap({ muscleGroups, isPremium }: Props) {
  const getColorForMuscle = (muscleName: string) => {
    const muscle = muscleGroups.find(m => m.name === muscleName);
    if (!muscle || (muscle.isLocked && !isPremium)) {
      return '#e5e7eb'; // gray-200
    }
    return getLevelColor(muscle.level).replace('bg-', '').replace('-500', '');
  };

  const averageStrength = useMemo(() => {
    const unlockedMuscles = muscleGroups.filter(m => !m.isLocked || isPremium);
    if (unlockedMuscles.length === 0) return 0;
    return (unlockedMuscles.reduce((sum, m) => sum + m.strength, 0) / unlockedMuscles.length).toFixed(2);
  }, [muscleGroups, isPremium]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-[400px] aspect-[3/4]">
          <svg viewBox="0 0 300 400" className="w-full h-full">
            {/* Front View */}
            <g transform="translate(50, 50)">
              {/* Body outline */}
              <path
                d="M50,0 L150,0 L170,20 L170,60 L150,80 L140,100 L140,200 L150,240 L150,300 L140,320 L60,320 L50,300 L50,240 L60,200 L60,100 L50,80 L30,60 L30,20 L50,0"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
              />

              {/* Chest */}
              <path
                d="M70,80 Q100,100 130,80 Q100,120 70,80"
                fill={getColorForMuscle('Chest')}
                stroke="#374151"
                strokeWidth="1"
              />

              {/* Shoulders */}
              <path
                d="M30,60 Q20,70 15,90 M170,60 Q180,70 185,90"
                fill={getColorForMuscle('Shoulders')}
                stroke="#374151"
                strokeWidth="1"
              />

              {/* Arms */}
              <path
                d="M15,90 Q10,130 20,170 M185,90 Q190,130 180,170"
                fill={getColorForMuscle('Arms')}
                stroke="#374151"
                strokeWidth="1"
              />

              {/* Core */}
              <path
                d="M70,120 Q100,140 130,120 Q100,180 70,120"
                fill={getColorForMuscle('Core')}
                stroke="#374151"
                strokeWidth="1"
              />

              {/* Legs */}
              <path
                d="M60,200 Q70,250 80,320 M140,200 Q130,250 120,320"
                fill={getColorForMuscle('Legs')}
                stroke="#374151"
                strokeWidth="1"
              />
            </g>

            {/* Back View */}
            <g transform="translate(50, 50)">
              {/* Back muscles */}
              <path
                d="M70,80 L130,80 L130,180 L70,180 Z"
                fill={getColorForMuscle('Back')}
                stroke="#374151"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>

        <div className="mt-8 text-center">
          <div className="text-2xl font-bold text-gray-900">Strength Standard</div>
          <div className="text-4xl font-bold text-blue-600 mt-2">{averageStrength}</div>
          
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            <div className="px-4 py-1 rounded-full bg-red-100 text-red-800 text-sm">Beginner</div>
            <div className="px-4 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">Novice</div>
            <div className="px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm">Intermediate</div>
            <div className="px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">Advanced</div>
            <div className="px-4 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">Expert</div>
            <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">World Class</div>
          </div>
        </div>
      </div>
    </div>
  );
}