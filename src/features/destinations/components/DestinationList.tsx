import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdLocationCity, MdLocationOn } from "react-icons/md";
import { supabase } from "../../../supabase-client";
import { Destination, DestinationForm } from "./DestinationForm";

interface DestinationsListProps {
  tripId: string;
}

const fetchDestinations = async (tripId: string): Promise<Destination[]> => {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("trip_id", tripId)
    .order("start_date");

  if (error) {
    throw new Error(error.message);
  }

  return data as Destination[];
};

const deleteDestination = async (destinationId: string) => {
  const { error } = await supabase
    .from("destinations")
    .delete()
    .eq("id", destinationId);

  if (error) {
    throw new Error(error.message);
  }
};

export const DestinationsList = ({ tripId }: DestinationsListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<string | null>(null);

  const { data: destinations, error, isLoading, refetch } = useQuery<Destination[], Error>({
    queryKey: ["destinations", tripId],
    queryFn: () => fetchDestinations(tripId),
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteDestination(id);
      refetch();
      setDeleteModalOpen(false);
      setDestinationToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const openDeleteModal = (id: string) => {
    setDestinationToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleEditClick = (destination: Destination) => {
    setEditingDestination(destination);
    setShowAddForm(false);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditingDestination(null);
    refetch();
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div>Chargement des destinations...</div>;
  }

  if (error) {
    return <div>Erreur: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Destinations</h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingDestination(null);
          }}
          className="flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
        >
          <FaPlus className="mr-1" /> Ajouter une destination
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-medium mb-2">Nouvelle destination</h4>
          <DestinationForm
            tripId={tripId}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {editingDestination && (
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-medium mb-2">Modifier la destination</h4>
          <DestinationForm
            tripId={tripId}
            destination={editingDestination}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingDestination(null)}
          />
        </div>
      )}

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
                    onClick={() => handleEditClick(destination)}
                    className="p-1 bg-blue-500 rounded hover:bg-blue-600 transition"
                  >
                    <FaEdit className="text-white" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(destination.id)}
                    className="p-1 bg-red-500 rounded hover:bg-red-600 transition"
                  >
                    <FaTrash className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400">
          Aucune destination n'a été ajoutée à ce voyage.
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
                onClick={() => destinationToDelete && handleDelete(destinationToDelete)}
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