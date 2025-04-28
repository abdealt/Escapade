import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "../supabase-client";

// Destination model
export interface Destination {
  id: string;
  trip_id: string;
  city: string;
  country: string;
  start_date: Date;
  end_date: Date;
}

interface DestinationFormProps {
  tripId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  destination?: Destination; // Pour l'édition
}

const createDestination = async (destination: Omit<Destination, "id">) => {
  const { data, error } = await supabase.from("destinations").insert(destination);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const updateDestination = async (destination: Destination) => {
  const { data, error } = await supabase
    .from("destinations")
    .update({
      city: destination.city,
      country: destination.country,
      start_date: destination.start_date,
      end_date: destination.end_date,
    })
    .eq("id", destination.id);
  
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const DestinationForm = ({ tripId, onSuccess, onCancel, destination }: DestinationFormProps) => {
  const isEditMode = !!destination;
  const queryClient = useQueryClient();
  
  const [city, setCity] = useState(destination?.city || "");
  const [country, setCountry] = useState(destination?.country || "");
  const [startDate, setStartDate] = useState<string>(
    destination?.start_date 
      ? new Date(destination.start_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    destination?.end_date 
      ? new Date(destination.end_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  const createMutation = useMutation({
    mutationFn: createDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
      if (onSuccess) onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", tripId] });
      if (onSuccess) onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const destinationData = {
      city,
      country,
      start_date: new Date(startDate),
      end_date: new Date(endDate),
      trip_id: tripId,
    };

    if (isEditMode && destination) {
      updateMutation.mutate({
        ...destinationData,
        id: destination.id,
      });
    } else {
      createMutation.mutate(destinationData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Ville
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            placeholder="Paris, New York, Tokyo..."
            required
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Pays
          </label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            placeholder="France, États-Unis, Japon..."
            required
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Date d'arrivée
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Date de départ
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? "Chargement..."
            : isEditMode
            ? "Mettre à jour"
            : "Ajouter"}
        </button>
      </div>
    </form>
  );
};