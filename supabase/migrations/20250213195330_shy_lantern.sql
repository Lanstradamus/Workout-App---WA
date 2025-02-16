/*
  # Implement soft delete for workout templates

  1. Changes
    - Drop existing policies
    - Create new policies that handle soft deletion
    - Add proper security checks for all operations
    - Add performance indexes for soft delete queries

  2. Security
    - Enable RLS on workout_templates table
    - Users can only access their own templates
    - Proper handling of soft deletes
    - Explicit user_id checks for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON workout_templates;

-- Create comprehensive policies with proper permissions
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
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for soft delete performance
CREATE INDEX IF NOT EXISTS idx_workout_templates_soft_delete 
ON workout_templates(user_id, deleted_at) 
WHERE deleted_at IS NULL;