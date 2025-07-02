import { Navigate, Route, Routes } from 'react-router';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './context/ProtectedRoute';
import { Login } from './features/auth/components/LoginForm.tsx';
import { TripDetails } from './features/trips/components/TripDetails.tsx';
import { CreateTrip } from './features/trips/components/TripForm.tsx';
import { CommentsList } from './pages/CommentsPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { ExpensesPage } from './pages/ExpensesPage.tsx';
import { Friends } from './pages/FriendsPage.tsx';
import { Home } from './pages/HomePage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { ProfilePage } from './pages/ProfilePage';
import { RGPDPage } from './pages/RGPDPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { TripsList } from './pages/TripsPage.tsx';

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
              <CreateTrip />
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
          <Route path="/expenses" element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          } />
          <Route path="/comments" element={
            <ProtectedRoute>
              <CommentsList />
            </ProtectedRoute>
          } />          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
            {/* Pages publiques */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/rgpd" element={<RGPDPage />} />

          {/* Redirection vers la page de login si la route n'existe pas */}
          <Route path="*" element={<Navigate to="/login" replace />} /></Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;