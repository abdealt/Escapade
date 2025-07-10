// src/features/trips/components/TripDetails.tsx
import { useState } from "react";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { FcInvite } from "react-icons/fc";
import { useNavigate, useParams } from "react-router";
import { ActivitiesList } from "../../activities/components/ActivitiesList";
import { CommentsActivitiesList } from "../../commentsActivities/components/CommentActivitiesList";
import { DestinationsList } from "../../destinations/components/DestinationList";
import { ExpensesList } from "../../expenses/components/ExpensesList";
import { ParticipantsList } from "../../participants/components/ParticipantsList";
import { useCurrentUser, useDeleteTrip, useFriends, useShareTrip, useTripDetails } from '../hooks/useTrips';

export const TripDetails = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'destinations' | 'activities' | 'expenses' | 'comments' | 'participants'>('info');

  const { userId } = useCurrentUser();
  const { data: trip, error, isLoading } = useTripDetails(tripId);
  const { data: friends = [] } = useFriends(userId);
  const deleteTripMutation = useDeleteTrip();
  const shareTrip = useShareTrip();

  const handleDelete = async () => {
    try {
      await deleteTripMutation.mutateAsync(tripId!);
      setShowDeleteModal(false);
      navigate("/my-trips");
    } catch (error) {
      // L'erreur est déjà gérée dans le hook
    }
  };

  const handleShare = async (selectedUserId: string) => {
    try {
      await shareTrip.mutateAsync({ tripId: tripId!, userId: selectedUserId });
      alert("Le voyage a été partagé avec succès !");
      setShowShareModal(false);
      setSelectedFriendId('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors du partage du voyage.";
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{error.message}</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Voyage non trouvé: </strong>
        <span className="block sm:inline">Ce voyage n'existe pas ou a été supprimé.</span>
      </div>
    );
  }

  // Formatage des dates pour l'affichage
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Bouton retour */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <FaArrowLeft className="mr-2" /> Retour
        </button>
      </div>
      
      {/* Détails du voyage */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* En-tête avec titre et actions */}
        <div className="flex justify-between items-center p-6 bg-gray-700">
          <h1 className="text-2xl font-bold text-white">{trip.name}</h1>
          <div className="flex space-x-2">
            <button 
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition"
              title="Modifier ce voyage"
              onClick={() => navigate(`/edit-trip/${tripId}`)}
            >
              <FaEdit className="text-white" />
            </button>
            <button 
              className="p-2 bg-green-500 rounded-full hover:bg-green-600 transition"
              title="Ajouter un ami"
              onClick={() => setShowShareModal(true)}
            >
              <FcInvite className="text-white" />
            </button>
            <button 
              className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
              title="Supprimer ce voyage"
              onClick={() => setShowDeleteModal(true)}
            >
              <FaTrash className="text-white" />
            </button>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="bg-gray-700 border-b border-gray-600">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'destinations'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Destinations
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Activités
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Dépenses
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Commentaires
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === 'participants'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Participants
            </button>
          </nav>
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-300">{trip.description || "Aucune description"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Dates</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date de début:</span>
                      <span className="text-white">{formatDate(trip.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date de fin:</span>
                      <span className="text-white">{formatDate(trip.end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Info voyage</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Créé le:</span>
                      <span className="text-white">{formatDate(trip.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Créateur du voyage:</span>
                      <span className="text-white">
                        {trip.creator?.display_name || trip.created_email || "Non disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'destinations' && tripId && (
            <DestinationsList tripId={tripId} />
          )}

          {activeTab === 'activities' && tripId && (
            <ActivitiesList tripId={tripId} />
          )}

          {activeTab === 'expenses' && tripId && (
            <ExpensesList tripId={tripId} />
          )}
          
          {activeTab === 'participants' && tripId && (
            <ParticipantsList tripId={tripId} />
          )}
          
          {activeTab === 'comments' && tripId && (
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Commentaires</h2>
                <div className="grid grid-cols-1 md:grid-cols gap-4">
                    <CommentsActivitiesList tripId={tripId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                disabled={deleteTripMutation.isPending}
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                disabled={deleteTripMutation.isPending}
              >
                {deleteTripMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de partage */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Partager ce voyage</h3>
            <p className="mb-4">Sélectionnez l'ami avec qui vous souhaitez partager ce voyage :</p>
            <select
              value={selectedFriendId}
              onChange={(e) => setSelectedFriendId(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">Sélectionner un ami</option>
              {friends.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.display_name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedFriendId('');
                }} 
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                disabled={shareTrip.isPending}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  if (selectedFriendId && tripId) {
                    handleShare(selectedFriendId);
                  }
                }} 
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                disabled={!selectedFriendId || shareTrip.isPending}
              >
                {shareTrip.isPending ? 'Partage...' : 'Partager'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};