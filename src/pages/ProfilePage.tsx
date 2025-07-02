import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const queryClient = useQueryClient();

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: publicError } = await supabase
        .from('users')
        .update({
          display_name: displayName
        })
        .eq('id', user?.id);

      if (publicError) throw publicError;

      // Forcer le rafraîchissement des données
      queryClient.invalidateQueries({ queryKey: ['user-display-name'] });
      // Forcer le rafraîchissement de la session
      await supabase.auth.refreshSession();
      
      setMessage({ type: 'success', content: 'Profil mis à jour avec succès!' });
      
      // Recharger la page pour mettre à jour toutes les données
      window.location.reload();
    } catch (error) {
      setMessage({ type: 'error', content: 'Erreur lors de la mise à jour du profil' });
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', content: 'Les mots de passe ne correspondent pas' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage({ type: 'success', content: 'Mot de passe mis à jour avec succès!' });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', content: 'Erreur lors de la mise à jour du mot de passe' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6">Mon Profil</h1>

      {message.content && (
        <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.content}
        </div>
      )}

      <div className="space-y-6">
        <form onSubmit={updateProfile} className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informations du profil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom d'affichage</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Mettre à jour le profil
            </button>
          </div>
        </form>

        <form onSubmit={updatePassword} className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Changer le mot de passe</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 border border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Mettre à jour le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
