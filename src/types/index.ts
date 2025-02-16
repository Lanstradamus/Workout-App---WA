// Add these new types
export interface WorkoutHistory {
  id: string;
  template_id: string;
  template_name: string;
  created_at: string;
  sets: {
    weight: number;
    reps: number;
  }[];
}

// Update existing types
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipmentType: string;
  isCustom: boolean;
  history?: WorkoutHistory[];
}