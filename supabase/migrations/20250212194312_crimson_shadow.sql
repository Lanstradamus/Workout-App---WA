/*
  # Fix workout template delete policies

  1. Changes
    - Add proper update policy for soft deleting templates
    - Ensure users can only soft delete their own templates

  2. Security
    - Maintain data integrity with proper policy checks
    - Prevent unauthorized template deletions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON workout_templates;

-- Recreate policies with proper permissions
CREATE POLICY "Users can read own templates"
  ON workout_templates
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id OR NOT is_custom)
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON workout_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);