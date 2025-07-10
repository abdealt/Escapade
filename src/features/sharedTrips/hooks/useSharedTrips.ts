// src/features/sharedTrips/hooks/useSharedTrips.ts
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase-client";
import { Trip } from '../../trips/components/ShowTrips';
import { SharedTripsService } from '../services/sharedTripsService';

export const useCurrentUser = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  return userId;
};

export const useSharedTrips = (userId: string | null) => {
  return useQuery<Trip[], Error>({
    queryKey: ["sharedTrips", userId],
    queryFn: () => SharedTripsService.fetchSharedTrips(userId!),
    enabled: !!userId, // n'exécute la requête que si userId est défini
  });
};

export const useUserParticipations = (userId: string | null) => {
  return useQuery({
    queryKey: ["userParticipations", userId],
    queryFn: () => SharedTripsService.getUserParticipations(userId!),
    enabled: !!userId,
  });
};

export const useSharedTripDetails = (tripIds: string[]) => {
  return useQuery({
    queryKey: ["sharedTripDetails", tripIds],
    queryFn: () => SharedTripsService.getSharedTripDetails(tripIds),
    enabled: tripIds.length > 0,
  });
};