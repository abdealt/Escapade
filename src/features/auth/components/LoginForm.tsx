// src/pages/Login.tsx
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../../context/AuthContext";

interface LocationState {
  from?: string;
}

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const location = useLocation();
  
  // Récupérer le chemin de redirection, s'il existe
  const from = (location.state as LocationState)?.from || "/";

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'origine ou d'accueil
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation pour l'inscription
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        if (password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères");
        }
        
        await signUpWithEmail(email, password);
        setSuccessMessage("Compte créé avec succès! Vérifiez votre email pour confirmer votre compte.");
        setIsSignUp(false);
      } else {
        // Connexion
        await signInWithEmail(email, password);
        // La redirection se fera automatiquement grâce au code ci-dessus
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion Google modifiée pour stocker l'URL de redirection
  const handleGoogleSignIn = () => {
    // Stocker l'URL de redirection dans le localStorage avant de déclencher la redirection OAuth
    localStorage.setItem('redirectAfterLogin', from);
    signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? "Créer un compte" : "Connectez-vous à votre compte"}
          </h2>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 text-white p-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Adresse email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white-900 ${isSignUp ? "" : "rounded-b-md"} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                "Chargement..."
              ) : isSignUp ? (
                "S'inscrire"
              ) : (
                "Se connecter"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-indigo-400 hover:text-indigo-300"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Déjà un compte? Se connecter"
                : "Pas de compte? S'inscrire"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">
                Ou continuer avec
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <FcGoogle className="h-5 w-5 mr-2" />
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};