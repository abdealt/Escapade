import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase-client';

interface User {
  id: string;
  email: string;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  requester?: User;
  receiver?: User;
}

export function Friends() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les demandes d'amis en attente
  const loadPendingRequests = async () => {
    if (!user) return;
    
    try {
      console.log("Chargement des demandes en attente pour:", user.id);
      
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:users!friend_requests_requester_id_fkey (
            id,
            email
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      console.log("Demandes en attente avec utilisateurs:", requests);
      
      if (!requests || requests.length === 0) {
        setPendingRequests([]);
        return;
      }

      setPendingRequests(requests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    }
  };

  // Charger la liste des amis
  const loadFriends = async () => {
    if (!user) return;
    
    try {
      console.log("Chargement des amis pour:", user.id);
      
      const { data: friendships, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:users!friend_requests_requester_id_fkey (
            id,
            email
          ),
          receiver:users!friend_requests_receiver_id_fkey (
            id,
            email
          )
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      console.log("Amitiés avec utilisateurs:", friendships);
      
      if (!friendships || friendships.length === 0) {
        setFriends([]);
        return;
      }

      setFriends(friendships);
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
    }
  };

  // Envoyer une demande d'ami
  const sendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log("Recherche d'utilisateur avec l'email:", email);
      
      // Rechercher l'utilisateur par email
      const { data: userFound, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (userError || !userFound) {
        console.error('Erreur de recherche utilisateur:', userError);
        setError('Utilisateur non trouvé. Vérifiez l\'adresse email.');
        return;
      }
      
      console.log("Utilisateur trouvé:", userFound);
      await processRequest(userFound.id);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      setError(`Erreur: ${error.message || 'Problème lors de l\'envoi de la demande'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour traiter la demande une fois l'utilisateur trouvé
  const processRequest = async (receiverId: string) => {
    if (!user) return;
    
    if (receiverId === user.id) {
      setError('Vous ne pouvez pas vous ajouter vous-même comme ami');
      return;
    }
    
    try {
      // Vérifier si une demande existe déjà
      const { data: existingRequest, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .not('status', 'eq', 'declined');
      
      if (checkError) {
        console.error('Erreur vérification demande existante:', checkError);
        setError('Erreur lors de la vérification des demandes existantes');
        return;
      }

      console.log("Demandes existantes:", existingRequest);

      if (existingRequest && existingRequest.length > 0) {
        const acceptedRequest = existingRequest.find(req => req.status === 'accepted');
        if (acceptedRequest) {
          setError('Vous êtes déjà ami avec cet utilisateur');
        } else {
          setError('Une demande d\'ami existe déjà avec cet utilisateur');
        }
        return;
      }

      // Envoyer la demande
      const { data, error: insertError } = await supabase
        .from('friend_requests')
        .insert([{ requester_id: user.id, receiver_id: receiverId, status: 'pending' }])
        .select();

      if (insertError) throw insertError;

      console.log("Demande insérée:", data);
      setSuccess('Demande d\'ami envoyée avec succès');
      setEmail('');
      
      await loadPendingRequests();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      throw error;
    }
  };

  // Accepter une demande d'ami
  const acceptRequest = async (requestId: string) => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Acceptation de la demande:", requestId);
      
      // 1. Vérifier que la demande existe et est en attente
      const { data: request, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (checkError || !request) {
        console.error('Erreur lors de la vérification de la demande:', checkError);
        setError('Demande non trouvée ou déjà traitée');
        return;
      }

      // 2. Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('receiver_id', user.id);  // Ajout de cette ligne

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        throw updateError;
      }
      
      console.log("Demande acceptée avec succès");
      await Promise.all([loadPendingRequests(), loadFriends()]);
      setSuccess('Demande acceptée');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
      setError('Erreur lors de l\'acceptation de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  // Refuser une demande d'ami
  const declineRequest = async (requestId: string) => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Refus de la demande:", requestId);
      
      // 1. Vérifier que la demande existe et est en attente
      const { data: request, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (checkError || !request) {
        console.error('Erreur lors de la vérification de la demande:', checkError);
        setError('Demande non trouvée ou déjà traitée');
        return;
      }

      // 2. Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;
      
      console.log("Demande refusée avec succès");
      await loadPendingRequests();
      setSuccess('Demande refusée');
    } catch (error) {
      console.error('Erreur lors du refus de la demande:', error);
      setError('Erreur lors du refus de la demande');
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un ami
  const removeFriend = async (requestId: string) => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Suppression de l'ami:", requestId);
      
      // 1. Vérifier que l'amitié existe et est acceptée
      const { data: friendship, error: checkError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .single();

      if (checkError || !friendship) {
        console.error('Erreur lors de la vérification de l\'amitié:', checkError);
        setError('Amitié non trouvée');
        return;
      }

      // 2. Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (updateError) throw updateError;
      
      console.log("Ami supprimé avec succès");
      await loadFriends();
      setSuccess('Ami supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'ami:', error);
      setError('Erreur lors de la suppression de l\'ami');
    } finally {
      setIsLoading(false);
    }
  };

  // Effacer les messages d'erreur et de succès après 5 secondes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      loadPendingRequests();
      loadFriends();
      
      // Polling toutes les 30 secondes
      const intervalId = setInterval(() => {
        loadPendingRequests();
        loadFriends();
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des amis</h1>
        <p className="text-gray-400">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Mes amis</h2>

        <form onSubmit={sendFriendRequest} className="flex gap-4 mb-4">
          <input
            type="email"
            placeholder="Email de l'ami"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Ajouter
          </button>
        </form>

        {error && <div className="text-red-600 font-medium mb-2">{error}</div>}
        {success && <div className="text-green-600 font-medium mb-2">{success}</div>}
      </div>

      {/* Demandes d'amis en attente */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Demandes en attente</h3>
        {pendingRequests.length === 0 ? (
          <div className="text-gray-500">Aucune demande en attente.</div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div className="text-gray-800">{request.requester?.email}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(request.id)}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => declineRequest(request.id)}
                    disabled={isLoading}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liste des amis */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Mes amis</h3>
        {friends.length === 0 ? (
          <div className="text-gray-500">Vous n'avez pas encore d'amis.</div>
        ) : (
          <div className="space-y-4">
            {friends.map((friend, index) => {
              const otherUser =
                friend.requester?.id === user?.id ? friend.receiver : friend.requester;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-gray-800">{otherUser?.email}</div>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      disabled={isLoading}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition ml-4"
                    >
                    Supprimer
                    </button>
                  </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}