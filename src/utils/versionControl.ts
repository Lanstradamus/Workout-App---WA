import { openDB, IDBPDatabase } from 'idb';

interface Version {
  id: string;
  timestamp: number;
  name: string;
  files: {
    path: string;
    content: string;
  }[];
  supabaseData?: {
    tables: {
      [tableName: string]: any[];
    };
  };
}

const DB_NAME = 'dev_version_control';
const STORE_NAME = 'versions';

class VersionControl {
  private db: IDBPDatabase | null = null;

  async init() {
    this.db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async getAllFiles() {
    const files: { path: string; content: string }[] = [];
    
    // Get all source files
    const sourceFiles = [
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'src/vite-env.d.ts',
      'src/types/index.ts',
      'src/lib/supabase.ts',
      'src/lib/database.types.ts',
      'src/utils/levelColors.ts',
      'src/utils/strengthCalculator.ts',
      'src/utils/versionControl.ts',
      'src/hooks/useAuth.ts',
      'src/hooks/useEmptyWorkout.ts',
      'src/hooks/useWorkout.ts',
      'src/hooks/useWorkoutHistory.ts',
      'src/hooks/useWorkoutStats.ts',
      'src/hooks/useWorkoutTemplates.ts',
      'src/components/ActiveWorkout.tsx',
      'src/components/AuthModal.tsx',
      'src/components/AuthProvider.tsx',
      'src/components/CoachInsights.tsx',
      'src/components/CreateTemplateModal.tsx',
      'src/components/EmptyWorkout.tsx',
      'src/components/ExerciseHistoryModal.tsx',
      'src/components/ExerciseOptionsMenu.tsx',
      'src/components/ExerciseReplaceModal.tsx',
      'src/components/ExerciseSelectionScreen.tsx',
      'src/components/MuscleMap.tsx',
      'src/components/Navbar.tsx',
      'src/components/ProtectedRoute.tsx',
      'src/components/TemplateOptionsMenu.tsx',
      'src/components/VersionControl.tsx',
      'src/components/WorkoutLogger.tsx',
      'src/components/WorkoutSummary.tsx',
      'src/pages/Home.tsx',
      'src/pages/Profile.tsx',
      'src/pages/Rankings.tsx',
      'src/pages/StartWorkout.tsx',
      'src/pages/Stats.tsx',
      'package.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
      'eslint.config.js',
      'index.html'
    ];

    for (const path of sourceFiles) {
      try {
        const response = await fetch(`/home/project/${path}`);
        if (response.ok) {
          const content = await response.text();
          files.push({ path, content });
        }
      } catch (error) {
        console.warn(`Could not read file ${path}:`, error);
      }
    }

    return files;
  }

  async saveVersion(name: string) {
    if (!this.db) await this.init();
    
    const files = await this.getAllFiles();
    
    const version: Version = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      name,
      files
    };

    await this.db!.put(STORE_NAME, version);
    return version;
  }

  async getVersions(): Promise<Version[]> {
    if (!this.db) await this.init();
    return this.db!.getAll(STORE_NAME);
  }

  async getVersion(id: string): Promise<Version | undefined> {
    if (!this.db) await this.init();
    return this.db!.get(STORE_NAME, id);
  }

  async restoreVersion(version: Version) {
    // Create backup of current state before restoring
    await this.saveVersion(`Backup before restoring ${version.name}`);

    // Restore each file
    for (const file of version.files) {
      try {
        await fetch(`/home/project/${file.path}`, {
          method: 'PUT',
          body: file.content
        });
      } catch (error) {
        console.error(`Error restoring file ${file.path}:`, error);
        throw error;
      }
    }
  }

  async deleteVersion(id: string) {
    if (!this.db) await this.init();
    await this.db!.delete(STORE_NAME, id);
  }

  async exportVersions(): Promise<string> {
    const versions = await this.getVersions();
    return JSON.stringify(versions, null, 2);
  }

  async importVersions(jsonData: string) {
    try {
      const versions: Version[] = JSON.parse(jsonData);
      if (!Array.isArray(versions)) throw new Error('Invalid version data');

      if (!this.db) await this.init();
      const tx = this.db!.transaction(STORE_NAME, 'readwrite');
      
      for (const version of versions) {
        await tx.store.put(version);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Error importing versions:', error);
      throw error;
    }
  }
}

export const versionControl = new VersionControl();