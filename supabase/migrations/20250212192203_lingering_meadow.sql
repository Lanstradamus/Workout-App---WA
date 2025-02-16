/*
  # Fix RLS policies for user authentication

  1. Changes
    - Update users table RLS policies to allow profile creation during signup
    - Add policies for authenticated users to manage their own data
    - Fix muscle groups policies to allow creation during signup

  2. Security
    - Maintain data isolation between users
    - Allow profile creation during signup
    - Ensure users can only access their own data
*/

-- Update users table policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update muscle_groups table policies
DROP POLICY IF EXISTS "Users can read own muscle groups" ON muscle_groups;
DROP POLICY IF EXISTS "Users can insert own muscle groups" ON muscle_groups;
DROP POLICY IF EXISTS "Users can update own muscle groups" ON muscle_groups;

CREATE POLICY "Users can read own muscle groups"
  ON muscle_groups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own muscle groups"
  ON muscle_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own muscle groups"
  ON muscle_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update workouts table policies
DROP POLICY IF EXISTS "Users can read own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update own workouts" ON workouts;

CREATE POLICY "Users can read own workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update workout_exercises table policies
DROP POLICY IF EXISTS "Users can read own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can insert own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update own workout exercises" ON workout_exercises;

CREATE POLICY "Users can read own workout exercises"
  ON workout_exercises
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own workout exercises"
  ON workout_exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workout exercises"
  ON workout_exercises
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );