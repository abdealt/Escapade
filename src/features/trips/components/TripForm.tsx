// src/features/trips/components/TripForm.tsx
import { useState } from "react";
import { useCreateTrip, useCurrentUser } from '../hooks/useTrips';

interface CreateTripProps {
    onSuccess?: () => void;
}

export const CreateTrip = ({ onSuccess }: CreateTripProps) => {
    const [tripName, setTripName] = useState<string>("");
    const [tripDescription, setTripDescription] = useState<string>("");
    const [tripStartDate, setTripStartDate] = useState<Date>(new Date());
    const [tripEndDate, setTripEndDate] = useState<Date>(new Date());
    
    const { userEmail } = useCurrentUser();
    const createTripMutation = useCreateTrip();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        // Vérifier que l'email a bien été récupéré
        if (!userEmail) {
            alert("Impossible de récupérer votre email. Veuillez vous reconnecter.");
            return;
        }
        
        try {
            await createTripMutation.mutateAsync({
                name: tripName,
                description: tripDescription,
                start_date: tripStartDate,
                end_date: tripEndDate,
                created_email: userEmail,
            });
            
            // Appeler le callback onSuccess après une insertion réussie
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // L'erreur est déjà gérée dans le hook
        }
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
                    <button 
                        type="submit" 
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                        disabled={createTripMutation.isPending}
                    >
                        {createTripMutation.isPending ? 'Création...' : 'Créer le voyage'}
                    </button>
                    <button 
                        type="reset" 
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
                        disabled={createTripMutation.isPending}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};