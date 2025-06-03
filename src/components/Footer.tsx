import { FaApple, FaFacebook, FaGooglePlay, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Apps */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Bientôt disponible sur</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FaApple className="text-2xl" />
                <span>App Store</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaGooglePlay className="text-2xl" />
                <span>Google Play</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                <FaFacebook className="text-2xl" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                <FaXTwitter className="text-2xl" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                <FaTiktok className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-400 transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/rgpd" className="hover:text-blue-400 transition-colors">
                  RGPD
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-blue-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Escapade. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
