import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, TrophyIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-5 px-4 h-16">
          <Link to="/" className="flex flex-col items-center justify-center">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/stats" className="flex flex-col items-center justify-center">
            <ChartBarIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Stats</span>
          </Link>
          <Link to="/start-workout" className="flex flex-col items-center justify-center">
            <PlusIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Add</span>
          </Link>
          <Link to="/rankings" className="flex flex-col items-center justify-center">
            <TrophyIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Rankings</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center justify-center">
            <UserIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}