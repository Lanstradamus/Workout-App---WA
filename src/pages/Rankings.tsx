export default function Rankings() {
  const rankings = [
    { range: 'Local (5mi)', rank: 5, total: 120 },
    { range: 'State', rank: 156, total: 5840 },
    { range: 'National', rank: 1458, total: 54620 }
  ];

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Rankings</h1>

      <div className="space-y-4">
        {rankings.map((ranking) => (
          <div key={ranking.range} className="bg-white rounded-lg p-4 shadow">
            <h2 className="text-lg font-semibold mb-2">{ranking.range}</h2>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-blue-500">#{ranking.rank}</span>
              <span className="text-sm text-gray-600">of {ranking.total}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Nearby Athletes</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-semibold">Athlete {i + 1}</p>
                  <p className="text-sm text-gray-600">Level {10 - i}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">{(5 - i) * 0.2}mi away</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}