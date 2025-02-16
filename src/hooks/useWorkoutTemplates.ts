import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import type { Exercise } from '../types';

type WorkoutTemplate = Database['public']['Tables']['workout_templates']['Row'];

export function useWorkoutTemplates(userId: string) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchTemplates();
  }, [userId]);

  const createTemplate = async (name: string, exercises: Exercise[]) => {
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: userId,
          name,
          exercises,
          is_custom: true
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to create template');
      return null;
    }
  };

  const updateTemplate = async (templateId: string, updates: { name?: string; exercises?: Exercise[] }) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('workout_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setTemplates(prev => prev.map(t => t.id === templateId ? data : t));
      return data;
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to update template');
      return null;
    }
  };

  const duplicateTemplate = async (templateId: string) => {
    try {
      setError(null);
      const template = templates.find(t => t.id === templateId);
      if (!template) return null;

      const baseNameMatch = template.name.match(/(.*?)(?:\s*\(Copy(?:\s*(\d+))?\))?$/);
      const baseName = baseNameMatch?.[1] || template.name;
      const existingCopies = templates.filter(t => 
        t.name.startsWith(baseName) && t.name.match(/\(Copy(?:\s*\d+)?\)$/)
      ).length;
      const newName = existingCopies === 0 
        ? `${baseName} (Copy)`
        : `${baseName} (Copy ${existingCopies + 1})`;

      const { data, error: insertError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: userId,
          name: newName,
          exercises: template.exercises,
          is_custom: true
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error duplicating template:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate template');
      return null;
    }
  };

  const renameTemplate = async (templateId: string, newName: string) => {
    try {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('workout_templates')
        .update({ name: newName })
        .eq('id', templateId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setTemplates(prev => prev.map(t => t.id === templateId ? data : t));
      return data;
    } catch (err) {
      console.error('Error renaming template:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename template');
      return null;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      return false;
    }
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    renameTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates
  };
}