import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut, user } = useAuth();
  const [displayName, setDisplayName] = useState<string>("Utilisateur");

  useEffect(() => {
    if (user) {
      const fetchDisplayName = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setDisplayName(data.display_name || "Utilisateur");
        }
      };
      fetchDisplayName();
    }
  }, [user]);

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
            <Link to="/my-trips" className="hover:text-white transition-colors duration-200">
              Mes voyages
            </Link>
            <Link to="/expenses" className="hover:text-white transition-colors duration-200">
              Mes dépenses
            </Link>
            <Link to="/comments" className="hover:text-white transition-colors duration-200">
              Mes commentaires
            </Link>
            <Link to="/friends" className="hover:text-white transition-colors duration-200">
              Mes amis
            </Link>
          </div>

          {/* Right: User Display */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {displayName}
                </Link>
                <button
                  onClick={signOut}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Connexion
              </Link>
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
          <Link to="/my-trips" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes voyages
          </Link>
          <Link to="/expenses" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes dépenses
          </Link>
          <Link to="/comments" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes commentaires
          </Link>
          <Link to="/friends" className="block text-gray-300 hover:text-white transition-colors duration-200">
            Mes amis
          </Link>
          
          {/* User auth for mobile */}
          {user ? (
            <div className="pt-2 border-t border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <Link 
                  to="/profile"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {displayName}
                </Link>
              </div>
              <button
                onClick={signOut}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-700">
              <Link 
                to="/login"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-center text-sm"
              >
                Connexion
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};