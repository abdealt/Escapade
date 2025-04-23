import { useState } from "react";
import { FcGoogle } from "react-icons/fc"; // Import Google icon
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signInWithGoogle, signOut, user } = useAuth();

  const displayName = user?.user_metadata.full_name || user?.email || "Utilisateur";

  return (
    <nav className="fixed top-0 z-50 w-full bg-gray-900/80 text-white backdrop-blur border-b border-gray-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
          </div>

          {/* Center: Links */}
          <div className="hidden md:flex space-x-6 font-medium text-gray-300">
            <Link to="/" className="hover:text-white transition-colors duration-200">
              Accueil
            </Link>
            <Link to="/trips" className="hover:text-white transition-colors duration-200">
              Mes voyages
            </Link>
            <Link to="/destinations" className="hover:text-white transition-colors duration-200">
              Destinations
            </Link>
            <Link to="/activities" className="hover:text-white transition-colors duration-200">
              Mes activités
            </Link>
            <Link to="/expenses" className="hover:text-white transition-colors duration-200">
              Mes dépenses
            </Link>
            <Link to="/comments" className="hover:text-white transition-colors duration-200">
              Mes commentaires
            </Link>
          </div>

          {/* Right: User Display */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-gray-700"
                  />
                )}
                <span className="text-gray-300">{displayName}</span>
                <button
                  onClick={signOut}
                  className="hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                <FcGoogle className="text-2xl" /> {/* Google icon */}
                <span>Connexion</span>
              </button>
            )}
          </div>

          {/* Mobile Icon */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-2xl focus:outline-none"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700 px-4 pb-4 pt-2 space-y-2">
          <Link to="/" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Accueil
          </Link>
          <Link to="/trips" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes voyages
          </Link>
          <Link to="/destinations" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Destinations
          </Link>
          <Link to="/activities" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes activités
          </Link>
          <Link to="/expenses" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes dépenses
          </Link>
          <Link to="/comments" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes commentaires
          </Link>
        </div>
      )}
    </nav>
  );
};
