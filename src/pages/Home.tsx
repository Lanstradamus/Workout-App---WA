export default function Home() {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Welcome back, Warrior!</h1>
      
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl text-white mb-2">Overall Level: 5</h2>
        <div className="bg-gray-700 h-4 rounded-full">
          <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
        </div>
        <p className="text-gray-300 text-sm mt-1">450/750 XP</p>
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600">
          Click the + button below to start a new workout
        </p>
      </div>
    </div>
  );
}