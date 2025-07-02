import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { HiUser } from "react-icons/hi";
import { supabase } from "../../../supabase-client";

interface Participant {
  id: string;
  trip_id: string;
  user_id: string;
  joined_at: string;
  user: {
    display_name: string;
  };
}

interface ParticipantsListProps {
  tripId: string;
}

const fetchParticipants = async (tripId: string): Promise<Participant[]> => {
  const { data, error } = await supabase
    .from("trip_participants")
    .select(`*, user:users (display_name)`)
    .eq("trip_id", tripId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

const deleteParticipant = async (participantId: string) => {
  const { error } = await supabase
    .from("trip_participants")
    .delete()
    .eq("id", participantId);

  if (error) throw error;
};

export const ParticipantsList = ({ tripId }: ParticipantsListProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: participants, isLoading, error } = useQuery({
    queryKey: ["participants", tripId],
    queryFn: () => fetchParticipants(tripId)
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteParticipant(id);
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
      setDeleteModalOpen(false);
      setParticipantToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const openDeleteModal = (id: string) => {
    setParticipantToDelete(id);
    setDeleteModalOpen(true);
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Participants</h3>
      </div>

      {participants && participants.length > 0 ? (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center text-lg font-medium text-white">
                    <HiUser className="mr-2 text-blue-400" />
                    {participant.user.display_name}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Rejoint le {new Date(participant.joined_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button
                  onClick={() => openDeleteModal(participant.id)}
                  className="p-1.5 bg-red-500 rounded hover:bg-red-600 transition"
                >
                  <FaTrash className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-400">
          Aucun participant n'a encore rejoint ce voyage.
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmer le retrait</h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir retirer ce participant du voyage ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={() => participantToDelete && handleDelete(participantToDelete)}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                Retirer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
