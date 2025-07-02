import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { CreateTrip } from "../features/trips/components/TripForm"; // Assure-toi que ce composant existe pour gérer la création d'un voyage
import { TripItem } from "../features/trips/components/TripItem";
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

export const TripsList = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [showTripModal, setShowTripModal] = useState(false); // état pour gérer l'affichage du modal

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

    const openModal = () => setShowTripModal(true);
    const closeModal = () => setShowTripModal(false);

    return (
        <div>
            <div className="flex justify-between mb-4">
                <div>
                    <h2 className="text-2xl text-gray-600 font-bold mb-4">Liste de mes voyages</h2>
                </div>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={openModal}
                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
                    >
                        <FaPlus className="mr-2" />
                        Créer un voyage
                    </button>
                </div>
            </div>

            {data?.length === 0 && (
                <div className="text-center text-gray-500">Aucun voyage trouvé.</div>
            )}
            
            {data?.map((trip) => (
                <TripItem trip={trip} key={trip.id} />
            ))}

            {/* Appliquer un flou au fond lorsque le modal est ouvert */}
            {showTripModal && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-md">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Créer un nouveau voyage</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                                &times;
                            </button>
                        </div>
                        <CreateTrip onSuccess={closeModal} /> {/* Ce composant gère le formulaire de création */}
                    </div>
                </div>
            )}
        </div>
    );
};
