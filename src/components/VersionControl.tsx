import { useState, useEffect } from 'react';
import { versionControl } from '../utils/versionControl';
import { XMarkIcon, ArrowPathIcon, CloudArrowDownIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface Version {
  id: string;
  timestamp: number;
  name: string;
  files: {
    path: string;
    content: string;
  }[];
}

export default function VersionControl() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      const loadedVersions = await versionControl.getVersions();
      setVersions(loadedVersions.sort((a, b) => b.timestamp - a.timestamp));
      setError(null);
    } catch (err) {
      setError('Failed to load versions');
      console.error('Error loading versions:', err);
    }
  };

  const handleSaveVersion = async () => {
    if (!versionName.trim()) return;
    
    setLoading(true);
    try {
      await versionControl.saveVersion(versionName);
      await loadVersions();
      setVersionName('');
      setError(null);
    } catch (err) {
      setError('Failed to save version');
      console.error('Error saving version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (version: Version) => {
    if (!confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      return;
    }

    setLoading(true);
    try {
      await versionControl.restoreVersion(version);
      setError(null);
      // Reload the page to apply changes
      window.location.reload();
    } catch (err) {
      setError('Failed to restore version');
      console.error('Error restoring version:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportVersion = async (version: Version) => {
    try {
      const data = JSON.stringify(version, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${version.name.toLowerCase().replace(/\s+/g, '_')}_${new Date(version.timestamp).toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (err) {
      setError('Failed to export version');
      console.error('Error exporting version:', err);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await versionControl.importVersions(text);
        await loadVersions();
        setError(null);
      } catch (err) {
        setError('Failed to import versions');
        console.error('Error importing versions:', err);
      }
    };

    input.click();
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setShowVersions(!showVersions)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
      >
        <ArrowPathIcon className="h-6 w-6" />
      </button>

      {showVersions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Version Control</h2>
              <button onClick={() => setShowVersions(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="Version name"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={handleSaveVersion}
                  disabled={!versionName.trim() || loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  onClick={handleImport}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  Import
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {versions.map(version => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{version.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleExportVersion(version)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50 hover:bg-blue-200"
                      >
                        {loading ? 'Restoring...' : 'Restore'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}