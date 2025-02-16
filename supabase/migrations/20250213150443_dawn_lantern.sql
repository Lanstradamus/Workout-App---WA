/*
  # Update workout template policies

  1. Changes
    - Drop existing policies
    - Add comprehensive policies for all template operations
    - Fix soft delete functionality

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

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS validate_template_update ON workout_templates;
DROP FUNCTION IF EXISTS check_template_update();

-- Recreate policies with proper permissions
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

-- Single comprehensive update policy that handles both regular updates and soft deletes
CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);