import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase-client";

// Trip model avec created_email
interface Trip {
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    created_email: string;
}

interface CreateTripProps {
    onSuccess?: () => void;
}

const createTrip = async (trip: Trip) => {
    // Ensure the trip object has the correct structure
    const {data, error} = await supabase.from("trips").insert(trip)
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const CreateTrip = ({ onSuccess }: CreateTripProps) => {
    const [tripName, setTripName] = useState<string>("");
    const [tripDescription, setTripDescription] = useState<string>("");
    const [tripStartDate, setTripStartDate] = useState<Date>(new Date());
    const [tripEndDate, setTripEndDate] = useState<Date>(new Date());
    const [userEmail, setUserEmail] = useState<string>("");

    // Récupérer l'email de l'utilisateur connecté au chargement du composant
    useEffect(() => {
        const fetchUserEmail = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || "");
            }
        };
        
        fetchUserEmail();
    }, []);

    const { mutate } = useMutation({
        mutationFn: createTrip,
        onSuccess: () => {
            // Appeler le callback onSuccess après une insertion réussie
            if (onSuccess) {
                onSuccess();
            }
        }
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        
        // Vérifier que l'email a bien été récupéré
        if (!userEmail) {
            alert("Impossible de récupérer votre email. Veuillez vous reconnecter.");
            return;
        }
        
        mutate({
            name: tripName,
            description: tripDescription,
            start_date: tripStartDate,
            end_date: tripEndDate,
            created_email: userEmail, // Ajouter l'email à l'objet trip
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-2xl border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tripName" className="block text-sm font-medium text-gray-700">Nom du voyage</label>
                        <input
                            type="text"
                            id="tripName"
                            name="tripName"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                            placeholder="Entrez le nom de votre voyage"
                            onChange={(event) => setTripName(event.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="tripDescription" className="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            id="tripDescription"
                            name="tripDescription"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                            placeholder="Ajoutez une description"
                            onChange={(event) => setTripDescription(event.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="tripStartDate" className="block text-sm font-medium text-gray-700">Date de début</label>
                        <input
                            type="date"
                            id="tripStartDate"
                            name="tripStartDate"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                            onChange={(event) => setTripStartDate(new Date(event.target.value))}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="tripEndDate" className="block text-sm font-medium text-gray-700">Date de fin</label>
                        <input
                            type="date"
                            id="tripEndDate"
                            name="tripEndDate"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                            onChange={(event) => setTripEndDate(new Date(event.target.value))}
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button type="submit" className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200">
                        Créer le voyage
                    </button>
                    <button type="reset" className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};
