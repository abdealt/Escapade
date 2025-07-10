// src/features/trips/components/ShowTrips.tsx
import { useState } from "react";
import { FaCalendar, FaCalendarAlt } from "react-icons/fa";
import { useCurrentUser, useTrips } from '../hooks/useTrips';
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

export const ShowTrips = () => {
    const { userId } = useCurrentUser();
    const [showAllTrips, setShowAllTrips] = useState(false);
    const { data, error, isLoading } = useTrips(userId, showAllTrips);

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