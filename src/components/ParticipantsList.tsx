import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaTrash, FaUserPlus } from "react-icons/fa";
import { supabase } from "../supabase-client";

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
    .from("participants")
    .select(`
      *,
      user:users (
        display_name
      )
    `)
    .eq("trip_id", tripId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const ParticipantsList = ({ tripId }: ParticipantsListProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: participants, isLoading, error } = useQuery({
    queryKey: ["participants", tripId],
    queryFn: () => fetchParticipants(tripId)
  });

  const deleteParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const { error } = await supabase
        .from("participants")
        .delete()
        .eq("id", participantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
    }
  });

  const handleDelete = (participantId: string) => {
    if (confirm("Êtes-vous sûr de vouloir retirer ce participant ?")) {
      deleteParticipantMutation.mutate(participantId);
    }
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
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Participants</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <FaUserPlus className="mr-2" /> Ajouter un participant
        </button>
      </div>

      {participants && participants.length > 0 ? (
        <div className="space-y-4">
          {participants.map((participant) => (
            <div 
              key={participant.id} 
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-650 transition flex justify-between items-center"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{participant.user.display_name}</h3>
                  <p className="text-gray-300 text-sm">
                    {new Date(participant.joined_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(participant.id)}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
                title="Retirer ce participant"
              >
                <FaTrash className="text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-700 p-8 rounded-lg text-center">
          <p className="text-gray-400">Aucun participant n'a encore rejoint ce voyage.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            <FaUserPlus className="mr-2 inline" /> Ajouter le premier participant
          </button>
        </div>
      )}
    </div>
  );
};
