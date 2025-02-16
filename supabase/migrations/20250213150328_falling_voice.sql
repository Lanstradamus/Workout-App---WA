/*
  # Update workout template policies

  1. Changes
    - Drop existing policies
    - Add policy for reading non-deleted templates
    - Add policy for inserting templates
    - Add policy for updating templates
    - Add policy for soft deleting templates

  2. Security
    - Enable RLS on workout_templates table
    - Users can only access their own templates
    - Soft delete is handled via deleted_at column
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON workout_templates;
DROP POLICY IF EXISTS "Users can soft delete own templates" ON workout_templates;

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

CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to validate template updates
CREATE OR REPLACE FUNCTION check_template_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow setting deleted_at if it was previously NULL
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- For normal updates, ensure deleted_at stays NULL
  IF NEW.deleted_at IS NULL AND OLD.deleted_at IS NULL THEN
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for template updates
DROP TRIGGER IF EXISTS validate_template_update ON workout_templates;
CREATE TRIGGER validate_template_update
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW
  EXECUTE FUNCTION check_template_update();