import { Navigate, Route, Routes } from 'react-router';
import { Navbar } from './components/Navbar';
import { TripList } from './components/TripList';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CreateTripPage } from './pages/CreateTrip';

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
          <Route path="/trips" element={
            <ProtectedRoute>
              <TripList />
            </ProtectedRoute>
          } />
          <Route path="/create-trip" element={
            <ProtectedRoute>
              <CreateTripPage />
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