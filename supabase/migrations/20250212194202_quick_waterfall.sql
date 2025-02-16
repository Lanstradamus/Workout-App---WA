/*
  # Add workout history table and template soft delete

  1. New Tables
    - `workout_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `template_id` (uuid, references workout_templates)
      - `workout_data` (jsonb, stores complete workout data)
      - `created_at` (timestamp)

  2. Changes
    - Add `deleted_at` to workout_templates table for soft delete
    - Update template policies to handle soft delete

  3. Security
    - Enable RLS on workout_history
    - Add policies for authenticated users
*/

-- Add deleted_at to workout_templates
ALTER TABLE workout_templates 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Create workout_history table
CREATE TABLE IF NOT EXISTS workout_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  template_id uuid REFERENCES workout_templates(id),
  workout_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

-- Add policies for workout_history
CREATE POLICY "Users can read own workout history"
  ON workout_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout history"
  ON workout_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update workout_templates policies to handle soft delete
DROP POLICY IF EXISTS "Users can read own templates" ON workout_templates;
CREATE POLICY "Users can read own templates"
  ON workout_templates
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id OR NOT is_custom)
    AND deleted_at IS NULL
  );