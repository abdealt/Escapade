import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TripItem } from "../pages/TripItem";
import { supabase } from "../supabase-client";

// Trip model
export interface Trip {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    created_by: string;
    created_at: Date;
}

const fetchTrips = async (userId: string): Promise<Trip[]> => {
    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        
    if (error) {
        throw new Error(error.message);
    }
    return data as Trip[];
}

export const TripList = () => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const { data, error, isLoading } = useQuery<Trip[], Error>({
        queryKey: ["trips", userId],
        queryFn: () => fetchTrips(userId!),
        enabled: !!userId, // n'exécute la requête que si userId est défini
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            {data?.map((trip) => (
                <TripItem trip={trip} key={trip.id} />
            ))}
        </div>
    );
};