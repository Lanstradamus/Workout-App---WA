import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stats from './pages/Stats';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import StartWorkout from './pages/StartWorkout';
import VersionControl from './components/VersionControl';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/start-workout" 
              element={
                <ProtectedRoute>
                  <StartWorkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/stats" 
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              } 
            />
            <Route path="/rankings" element={<Rankings />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Navbar />
          <VersionControl />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App