import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { FcInvite } from "react-icons/fc";
import { Link, useNavigate, useParams } from "react-router";
import { Trip } from "../components/TripList";
import { supabase } from "../supabase-client";

// Fonction pour récupérer les détails d'un voyage
const fetchTripDetails = async (tripId: string): Promise<Trip | null> => {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Trip;
};

// Fonction pour récupérer l'utilisateur par son ID
const fetchUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.email;
};

export const TripDetails = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [creatorEmail, setCreatorEmail] = useState<string | null>(null);

  const { data: trip, error, isLoading } = useQuery<Trip | null, Error>({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTripDetails(tripId!),
    enabled: !!tripId
  });

  useEffect(() => {
    if (trip && trip.created_by) {
      // Récupérer l'email de l'utilisateur qui a créé le voyage
      fetchUserById(trip.created_by).then(email => {
        setCreatorEmail(email);
      }).catch(err => console.error(err));
    }
  }, [trip]);

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

  const handleDelete = async () => {
    try {
      await supabase.from("trips").delete().eq("id", tripId);
      setShowDeleteModal(false);
      navigate("/my-trips");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
    }
  };

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
              title="Envoyer une invitation"
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

        {/* Corps avec détails */}
        <div className="p-6 space-y-4">
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
                    <span className="text-white">{creatorEmail || "Chargement..."}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sections pour future fonctionnalités */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={`/trip/${tripId}/activities`} className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition">
              <h3 className="text-lg font-medium">Activités</h3>
              <p className="text-gray-400 text-sm">Gérer les activités de ce voyage</p>
            </Link>
            
            <Link to={`/trip/${tripId}/expenses`} className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition">
              <h3 className="text-lg font-medium">Dépenses</h3>
              <p className="text-gray-400 text-sm">Suivre les dépenses du voyage</p>
            </Link>
            
            <Link to={`/trip/${tripId}/notes`} className="block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition">
              <h3 className="text-lg font-medium">Notes</h3>
              <p className="text-gray-400 text-sm">Ajouter des notes et commentaires</p>
            </Link>
          </div>
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
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Supprimer
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
            <p className="mb-4">Entrez l'email de la personne avec qui vous souhaitez partager ce voyage:</p>
            <input 
              type="email" 
              className="w-full p-2 mb-4 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="email@exemple.com"
            />
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowShareModal(false)} 
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Annuler
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Partager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
