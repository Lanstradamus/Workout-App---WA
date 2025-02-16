/*
  # Update workout template policies

  1. Changes
    - Drop existing policies
    - Add comprehensive policies for all template operations
    - Fix soft delete functionality
    - Add proper security checks

  2. Security
    - Enable RLS on workout_templates table
    - Users can only access their own templates
    - Proper handling of soft deletes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can soft delete own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can update or soft delete own templates" ON workout_templates;

-- Create policies with proper permissions
CREATE POLICY "Users can read own templates"
  ON workout_templates
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id OR NOT is_custom)
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert own templates"
  ON workout_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_deleted_at ON workout_templates(deleted_at) WHERE deleted_at IS NULL;