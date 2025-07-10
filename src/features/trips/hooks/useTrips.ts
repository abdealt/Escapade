// src/features/trips/hooks/useTrips.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase-client";
import { Trip } from '../components/ShowTrips';
import { TripsService } from '../services/tripsService';

export const useCurrentUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "");
      }
    };
    getUser();
  }, []);

  return { userId, userEmail };
};

export const useTrips = (userId: string | null, showAll: boolean = false) => {
  return useQuery<Trip[], Error>({
    queryKey: ["trips", userId, showAll],
    queryFn: () => TripsService.fetchTrips(userId!, showAll),
    enabled: !!userId,
  });
};

export const useTripDetails = (tripId: string | undefined) => {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => TripsService.fetchTripDetails(tripId!),
    enabled: !!tripId
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TripsService.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error) => {
      console.error("Erreur lors de la création:", error);
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, updates }: { tripId: string; updates: Partial<Trip> }) =>
      TripsService.updateTrip(tripId, updates),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour:", error);
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: TripsService.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
    },
  });
};

export const useFriends = (userId: string | null) => {
  return useQuery({
    queryKey: ["friends", userId],
    queryFn: () => TripsService.loadFriends(userId!),
    enabled: !!userId,
  });
};

export const useShareTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, userId }: { tripId: string; userId: string }) =>
      TripsService.shareTrip(tripId, userId),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ["participants", tripId] });
    },
    onError: (error) => {
      console.error("Erreur lors du partage:", error);
      throw error;
    },
  });
};