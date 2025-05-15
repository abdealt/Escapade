import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

interface FriendRequest {
  id: string;
  requester_id: string;
  users: {
    email: string;
    id: string;
  };
}

interface Friend {
  id: string;
  requester_id: string;
  receiver_id: string;
  requester: {
    email: string;
    id: string;
  };
  receiver: {
    email: string;
    id: string;
  };
}

export function Friends() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les demandes d'amis en attente
  const loadPendingRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select('id, requester_id, users!requester_id(*)')
        .eq('receiver_id', user?.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(requests || []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    }
  };

  // Charger la liste des amis
  const loadFriends = async () => {
    try {
      const { data: friends, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:users!requester_id(*),
          receiver:users!receiver_id(*)
        `)
        .or(`requester_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(friends || []);
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    }
  };

  // Envoyer une demande d'ami
  const sendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Vérifier si l'utilisateur existe
      const { data: userFound, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userFound) {
        setError('Utilisateur non trouvé');
        return;
      }

      // Vérifier si une demande existe déjà
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(requester_id.eq.${user?.id},receiver_id.eq.${userFound.id}),and(requester_id.eq.${userFound.id},receiver_id.eq.${user?.id})`)
        .not('status', 'eq', 'declined');

      if (existingRequest && existingRequest.length > 0) {
        setError('Une demande d\'ami existe déjà avec cet utilisateur');
        return;
      }

      // Envoyer la demande
      const { error } = await supabase.from('friend_requests').insert([
        { requester_id: user?.id, receiver_id: userFound.id }
      ]);

      if (error) throw error;

      setSuccess('Demande d\'ami envoyée avec succès');
      setEmail('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      setError('Erreur lors de l\'envoi de la demande');
    }
  };

  // Accepter une demande d'ami
  const acceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('receiver_id', user?.id);

      if (error) throw error;
      
      loadPendingRequests();
      loadFriends();
      setSuccess('Demande acceptée');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
      setError('Erreur lors de l\'acceptation de la demande');
    }
  };

  // Refuser une demande d'ami
  const declineRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId)
        .eq('receiver_id', user?.id);

      if (error) throw error;
      
      loadPendingRequests();
      setSuccess('Demande refusée');
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      setError('Erreur lors du refus de la demande');
    }
  };

  useEffect(() => {
    loadPendingRequests();
    loadFriends();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des amis</h1>

      {/* Formulaire d'ajout d'ami */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter un ami</h2>
        <form onSubmit={sendFriendRequest} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse email de votre ami"
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Envoyer une demande
          </button>
        </form>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="bg-red-600 text-white p-4 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-600 text-white p-4 rounded mb-4">
          {success}
        </div>
      )}

      {/* Liste des demandes en attente */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Demandes d'amis en attente</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-400">Aucune demande en attente</p>
        ) : (
          <ul className="space-y-4">
            {pendingRequests.map((request) => (
              <li key={request.id} className="flex items-center justify-between bg-gray-700 p-4 rounded">
                <span>{request.users.email}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => acceptRequest(request.id)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => declineRequest(request.id)}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Liste des amis */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Mes amis</h2>
        {friends.length === 0 ? (
          <p className="text-gray-400">Aucun ami pour le moment</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => {
              const friendInfo = friend.requester_id === user?.id ? friend.receiver : friend.requester;
              return (
                <li key={friend.id} className="flex items-center justify-between bg-gray-700 p-4 rounded">
                  <span>{friendInfo.email}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
