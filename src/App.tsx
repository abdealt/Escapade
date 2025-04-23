import { Route, Routes } from 'react-router';
import { Navbar } from './components/Navbar';
import { TripList } from './components/TripList';
import { Home } from './pages/Home';

function App() {
  return (
    <div className="min-h-screen text-gray-100">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/s" element={<TripList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
