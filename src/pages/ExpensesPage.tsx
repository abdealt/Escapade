import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

// Interfaces pour les dépenses et les voyages
interface Trip {
    id: string;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    created_by: string;
}

interface Expense {
    id: string;
    trip_id: string;
    title: string;
    amount: number;
    paid_by: string;
    date: Date;
    user_paid_by: string;
}

interface ExpenseWithTrip extends Expense {
    trip: Trip;
}

// Fonction pour récupérer les dépenses avec les informations du voyage
const fetchExpensesWithTrips = async (userId: string): Promise<ExpenseWithTrip[]> => {
    const { data, error } = await supabase
        .from("expenses")
        .select(`
            *,
            trip:trips(*)
        `)
        .eq("paid_by", userId)
        .order("date", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data.map((item: any) => ({
        ...item,
        trip: item.trip,
    })) as ExpenseWithTrip[];
};

export const ExpensesPage = () => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const { 
        data: expenses,
        error,
        isLoading
    } = useQuery<ExpenseWithTrip[], Error>({
        queryKey: ["expenses", userId],
        queryFn: () => fetchExpensesWithTrips(userId!),
        enabled: !!userId,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading expenses: {error.message}</div>;
    }

    const hasNoExpenses = !expenses || expenses.length === 0;

    // Calculer le total des dépenses
    const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

    // Organiser les dépenses par voyage
    const expensesByTrip = expenses?.reduce((acc, expense) => {
        const tripId = expense.trip.id;
        if (!acc[tripId]) {
            acc[tripId] = {
                trip: expense.trip,
                expenses: [],
                total: 0
            };
        }
        acc[tripId].expenses.push(expense);
        acc[tripId].total += expense.amount;
        return acc;
    }, {} as Record<string, { trip: Trip; expenses: ExpenseWithTrip[]; total: number }>);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl text-gray-600 font-bold">Mes dépenses</h2>
                    <div className="text-2xl font-bold text-blue-600">
                        Total général: {totalExpenses.toFixed(2)}€
                    </div>
                </div>
            </div>

            {hasNoExpenses && (
                <div className="text-center text-gray-500">Aucune dépense trouvée.</div>
            )}

            {expensesByTrip && Object.values(expensesByTrip).map(({ trip, expenses, total }) => (
                <div key={trip.id} className="mb-8">
                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-700">
                            {trip.name}
                        </h3>
                        <div className="font-bold text-blue-600">
                            Total du voyage: {total.toFixed(2)}€
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {expense.title}
                                        </h3>
                                    </div>
                                    <div className="text-xl font-bold text-green-600">
                                        {expense.amount.toFixed(2)}€
                                    </div>
                                </div>
                                
                                <div className="flex justify-between text-sm text-gray-500">
                                    <div>
                                        Payé par: {expense.user_paid_by}
                                    </div>
                                    <div>
                                        Date: {new Date(expense.date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
