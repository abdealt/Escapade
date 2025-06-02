import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase-client";
import { Trip } from "../../trips/components/ShowTrips";
import { TripItem } from "../../trips/components/TripItem";

// Fonction pour récupérer les voyages partagés avec l'utilisateur
const fetchSharedTrips = async (userId: string): Promise<Trip[]> => {
  // D'abord, récupérer les IDs des voyages partagés
  const { data: participations, error: participationsError } = await supabase
    .from("trip_participants")
    .select("trip_id")
    .eq("user_id", userId);
  
  if (participationsError) {
    throw new Error(participationsError.message);
  }
  
  if (!participations || participations.length === 0) {
    return []; // Aucun voyage partagé
  }
  
  // Extraire les IDs des voyages
  const tripIds = participations.map(p => p.trip_id);
  
  // Récupérer les détails de ces voyages
  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("*")
    .in("id", tripIds)
    .order("created_at", { ascending: false });
  
  if (tripsError) {
    throw new Error(tripsError.message);
  }
  
  return (trips || []) as Trip[];
};

export const SharedTrips = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const { data, error, isLoading } = useQuery<Trip[], Error>({
    queryKey: ["sharedTrips", userId],
    queryFn: () => fetchSharedTrips(userId!),
    enabled: !!userId, // n'exécute la requête que si userId est défini
  });

  if (isLoading) {
    return <div>Chargement des voyages partagés...</div>;
  }
  
  if (error) {
    return <div>Erreur: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div>Aucun voyage partagé.</div>;
  }

  return (
    <div>
      {data.map((trip) => (
        <TripItem trip={trip} key={trip.id} />
      ))}
    </div>
  );
};