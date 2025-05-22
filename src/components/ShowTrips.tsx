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
    const today = new Date().toISOString();
    const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("created_by", userId)
        .lte('start_date', today) // date de début inférieure ou égale à aujourd'hui
        .gt('end_date', today)    // date de fin supérieure à aujourd'hui
        .order('end_date', { ascending: true });  // trier par date de fin la plus proche
        
    if (error) {
        throw new Error(error.message);
    }
    return data as Trip[];
}

export const ShowTrips = () => {
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
            {data?.length === 0 && (
                <div className="text-center text-gray-500">Aucun voyage trouvé.</div>
            )}
            
            {data?.map((trip) => (
                <TripItem trip={trip} key={trip.id} />
            ))}
        </div>
    );
};