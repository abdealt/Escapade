import { Navigate, Route, Routes } from 'react-router';
import { CommentsList } from './components/CommentsList.tsx';
import { Navbar } from './components/Navbar';
import { TripsList } from './components/TripsList.tsx';
import { ProtectedRoute } from './context/ProtectedRoute';
import { CreateTripPage } from './pages/CreateTrip';
import { Friends } from './pages/Friends';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ProfilePage } from './pages/ProfilePage';
import { TripDetails } from './pages/TripDetails';

function App() {
  return (
    <div className="min-h-screen text-gray-100">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          
          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/my-trips" element={
            <ProtectedRoute>
              <TripsList />
            </ProtectedRoute>
          } />
          <Route path="/create-trip" element={
            <ProtectedRoute>
              <CreateTripPage />
            </ProtectedRoute>
          } />
          <Route path="/trip/:tripId" element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          } />
          <Route path="/friends" element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          } />
          <Route path="/comments" element={
            <ProtectedRoute>
              <CommentsList />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Redirection vers la page de login si la route n'existe pas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;