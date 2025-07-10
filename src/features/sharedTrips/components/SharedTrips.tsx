// src/features/sharedTrips/components/SharedTrips.tsx
import { TripItem } from "../../trips/components/TripItem";
import { useCurrentUser, useSharedTrips } from '../hooks/useSharedTrips';

export const SharedTrips = () => {
  const userId = useCurrentUser();
  const { data, error, isLoading } = useSharedTrips(userId);

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