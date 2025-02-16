import { useState, useEffect } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import type { MuscleGroup } from '../types';
import { getLevelColor, getLevelName } from '../utils/levelColors';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import CoachInsights from '../components/CoachInsights';

export default function Stats() {
  const { user } = useAuthContext();
  const [isPremium, setIsPremium] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchMuscleGroups() {
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        setIsPremium(userProfile?.is_premium || false);

        const { data: muscles, error } = await supabase
          .from('muscle_groups')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        setMuscleGroups(muscles || []);
      } catch (error) {
        console.error('Error fetching muscle groups:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMuscleGroups();
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Your Stats</h1>

      {user && <CoachInsights userId={user.id} />}

      <h2 className="text-xl font-semibold my-6">Muscle Groups</h2>
      <div className="space-y-4">
        {muscleGroups.map((muscle) => (
          <div 
            key={muscle.name} 
            className={`relative rounded-lg p-4 shadow transition-all ${
              muscle.isLocked && !isPremium 
                ? 'bg-white' 
                : `${getLevelColor(muscle.level)} bg-opacity-10 border-l-4 ${getLevelColor(muscle.level)}`
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{muscle.name}</h3>
                {(!muscle.isLocked || isPremium) && (
                  <p className="text-sm text-gray-600">Level {muscle.level}</p>
                )}
              </div>
              {(!muscle.isLocked || isPremium) && (
                <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(muscle.level)} text-white`}>
                  {getLevelName(muscle.level)}
                </span>
              )}
            </div>
            {(!muscle.isLocked || isPremium) ? (
              <div className="mt-2">
                <div className="text-xs text-gray-500">Strength Score</div>
                <div className="font-bold text-lg">{muscle.strength}</div>
                <div className="mt-1 bg-gray-200 h-2 rounded-full">
                  <div 
                    className={`h-full rounded-full ${getLevelColor(muscle.level)}`}
                    style={{ width: `${(muscle.xp / 1000) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {muscle.xp}/1000 XP
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LockClosedIcon className="h-6 w-6 mx-auto text-gray-500 mb-2" />
                  <span className="text-sm text-gray-600">Premium Feature</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isPremium && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">Unlock Premium Features</h3>
          <p className="text-sm text-blue-600 mb-4">
            Get access to all muscle group tracking, unlimited templates, and more!
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full">
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
}