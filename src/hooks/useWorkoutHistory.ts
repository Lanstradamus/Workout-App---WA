import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useWorkoutHistory(userId: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching workout history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const saveWorkoutHistory = async (templateId: string | null, workoutData: any) => {
    try {
      const { data, error } = await supabase
        .from('workout_history')
        .insert({
          user_id: userId,
          template_id: templateId,
          workout_data: workoutData
        })
        .select()
        .single();

      if (error) throw error;
      setHistory(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error saving workout history:', error);
      return null;
    }
  };

  return {
    history,
    loading,
    saveWorkoutHistory
  };
}