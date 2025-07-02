import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaCalendar, FaCalendarAlt } from "react-icons/fa";
import { supabase } from "../../../supabase-client";
import { TripItem } from "./TripItem";

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

const fetchTrips = async (userId: string, showAll: boolean = false): Promise<Trip[]> => {
    const query = supabase
        .from("trips")
        .select("*")
        .eq("created_by", userId)
        .order('end_date', { ascending: true });

    if (!showAll) {
        const today = new Date().toISOString();
        query
            .lte('start_date', today)
    }

    const { data, error } = await query;
        
    if (error) {
        throw new Error(error.message);
    }
    return data as Trip[];
}

export const ShowTrips = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [showAllTrips, setShowAllTrips] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const { data, error, isLoading } = useQuery<Trip[], Error>({
        queryKey: ["trips", userId, showAllTrips],
        queryFn: () => fetchTrips(userId!, showAllTrips),
        enabled: !!userId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowAllTrips(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    title={showAllTrips ? "Afficher les voyages en cours" : "Afficher tous les voyages"}
                >
                    {showAllTrips ? <FaCalendar className="text-sm" /> : <FaCalendarAlt className="text-sm" />}
                    <span className="text-sm">
                        {showAllTrips ? "Voyages en cours" : "Tous les voyages"}
                    </span>
                </button>
            </div>

            {data?.length === 0 && (
                <div className="text-center text-gray-500">Aucun voyage trouvé.</div>
            )}
            
            {data?.map((trip) => (
                <TripItem trip={trip} key={trip.id} />
            ))}
        </div>
    );
};