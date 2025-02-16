export const getLevelColor = (level: number): string => {
  if (level >= 8) return 'bg-red-500'; // Titan level
  if (level >= 6) return 'bg-purple-500'; // Master level
  if (level >= 4) return 'bg-blue-500'; // Advanced level
  if (level >= 2) return 'bg-green-500'; // Intermediate level
  return 'bg-gray-400'; // Beginner level
};

export const getLevelName = (level: number): string => {
  if (level >= 8) return 'Titan';
  if (level >= 6) return 'Master';
  if (level >= 4) return 'Advanced';
  if (level >= 2) return 'Intermediate';
  return 'Beginner';
};