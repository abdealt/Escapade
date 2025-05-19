import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

// Destination model avec timestamps
export interface Destination {
  id: string;
  trip_id: string;
  city: string;
  start_date: string; // Timestamp sous format string
  end_date: string; // Timestamp sous format string
}

// Interface pour le trip parent
interface Trip {
  id: string;
  start_date: string; // Timestamp sous format string
  end_date: string; // Timestamp sous format string
}

interface DestinationFormProps {
  tripId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  destination?: Destination; // Pour l'édition
}

// Récupérer les infos du voyage parent pour vérifier l'intervalle de dates
const fetchTripDetails = async (tripId: string): Promise<Trip> => {
  const { data, error } = await supabase
    .from("trips")
    .select("id, start_date, end_date")
    .eq("id", tripId)
    .single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Trip;
};

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
  const [validationError, setValidationError] = useState<string | null>(null);

  // Requête pour récupérer les informations du voyage parent
  const { data: trip, isLoading: tripLoading } = useQuery<Trip>({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTripDetails(tripId),
    enabled: !!tripId
  });

  // Mise à jour des dates min et max pour les sélecteurs de date
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  // Mise à jour des contraintes de date quand on récupère le voyage
  useEffect(() => {
    if (trip) {
      const tripStartDate = new Date(trip.start_date).toISOString().split('T')[0];
      const tripEndDate = new Date(trip.end_date).toISOString().split('T')[0];
      
      setMinDate(tripStartDate);
      setMaxDate(tripEndDate);
      
      // Si les dates actuelles sont hors de l'intervalle, les ajuster
      if (new Date(startDate) < new Date(tripStartDate)) {
        setStartDate(tripStartDate);
      }
      
      if (new Date(endDate) > new Date(tripEndDate)) {
        setEndDate(tripEndDate);
      }
    }
  }, [trip]);

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

  const validateDates = () => {
    if (!trip) return false;
    
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    const tripStartTimestamp = new Date(trip.start_date).getTime();
    const tripEndTimestamp = new Date(trip.end_date).getTime();
    
    if (startTimestamp < tripStartTimestamp) {
      setValidationError(`La Date de fin doit être après le début du voyage (${new Date(trip.start_date).toLocaleDateString()})`);
      return false;
    }
    
    if (endTimestamp > tripEndTimestamp) {
      setValidationError(`La date de début doit être avant la fin du voyage (${new Date(trip.end_date).toLocaleDateString()})`);
      return false;
    }
    
    if (startTimestamp > endTimestamp) {
      setValidationError("La Date de début doit être avant la date de fin");
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDates()) {
      return;
    }
    
    // Conversion des dates en timestamps (ISO string)
    const startTimestamp = new Date(startDate).toISOString();
    const endTimestamp = new Date(endDate).toISOString();
    
    const destinationData = {
      city,
      start_date: startTimestamp,
      end_date: endTimestamp,
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

  if (tripLoading) {
    return <div className="text-center py-4">Chargement des informations du voyage...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{validationError}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-400">
            Ville
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            placeholder="Paris, New York, Tokyo..."
            required
          />
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-400">
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setValidationError(null);
            }}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            required
          />
          {trip && (
            <p className="text-xs text-gray-400 mt-1">
              Entre {new Date(trip.start_date).toLocaleDateString()} et {new Date(trip.end_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-400">
            Date de fin
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            min={startDate} // La date de fin doit être après la date de début
            max={maxDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setValidationError(null);
            }}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
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
