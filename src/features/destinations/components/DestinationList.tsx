import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdLocationCity, MdLocationOn } from "react-icons/md";
import { useDestinations } from "../hooks/useDestinations";
import { Destination } from "../services/destinationService";
import { DestinationForm } from "./DestinationForm";

interface DestinationsListProps {
  tripId: string;
}

export const DestinationsList = ({ tripId }: DestinationsListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editDestination, setEditDestination] = useState<Destination | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<string | null>(null);

  const {
    destinations,
    trip,
    isLoading,
    error,
    createOrUpdateDestination,
    deleteDestination,
    isSubmitting
  } = useDestinations(tripId);

  // Gérer la modification d'une destination
  const handleEdit = (destination: Destination) => {
    setEditDestination(destination);
    setShowForm(true);
  };

  // Gérer la suppression d'une destination
  const handleDelete = (destinationId: string) => {
    setDestinationToDelete(destinationId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (destinationToDelete) {
      deleteDestination(destinationToDelete);
      setDeleteModalOpen(false);
      setDestinationToDelete(null);
    }
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = (payload: any) => {
    createOrUpdateDestination(payload, {
      onSuccess: () => {
        setShowForm(false);
        setEditDestination(null);
      },
      onError: (error) => {
        console.error("Erreur lors de l'enregistrement:", error);
      }
    });
  };

  // Formater les dates pour l'affichage
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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

  return (
    <div className="space-y-4">
      {/* Bouton pour ajouter une destination */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Destinations</h3>
        <button
          onClick={() => {
            setEditDestination(null);
            setShowForm(true);
          }}
          className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
        >
          <FaPlus className="mr-1" /> Ajouter une destination
        </button>
      </div>

      {/* Formulaire (affiché conditionnellement) */}
      {showForm && (
        <div className="mb-8">
          <DestinationForm
            tripId={tripId}
            destination={editDestination}
            trip={trip || null}
            onClose={() => {
              setShowForm(false);
              setEditDestination(null);
            }}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Liste des destinations */}
      {destinations && destinations.length > 0 ? (
        <div className="space-y-3">
          {destinations.map((destination) => (
            <div key={destination.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center text-lg font-medium">
                    <MdLocationCity className="mr-2 text-blue-400" />
                    {destination.city}
                  </div>
                  <div className="flex items-center text-sm text-gray-300 mt-1">
                    <MdLocationOn className="mr-1 text-green-400" />
                    Du {formatDate(destination.start_date)} au {formatDate(destination.end_date)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(destination)}
                    className="p-1 bg-blue-500 rounded hover:bg-blue-600 transition"
                    title="Modifier cette destination"
                  >
                    <FaEdit className="text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(destination.id)}
                    className="p-1 bg-red-500 rounded hover:bg-red-600 transition"
                    title="Supprimer cette destination"
                  >
                    <FaTrash className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-700 p-8 rounded-lg text-center">
          <p className="text-gray-400">Aucune destination n'a été ajoutée à ce voyage.</p>
          <button
            onClick={() => {
              setEditDestination(null);
              setShowForm(true);
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Ajouter votre première destination
          </button>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer cette destination ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};