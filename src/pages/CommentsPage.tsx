import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";

// Interfaces pour les commentaires
interface BaseComment {
    id: string;
    user_id: string;
    content: string;
    created_at: Date;
    user_comment: string;
}

interface ActivityComment extends BaseComment {
    activity_id: string;
    target_id: string;
}

interface ExpenseComment extends BaseComment {
    expense_id: string;
    target_id: string;
}

// Fonctions pour récupérer les commentaires
const fetchActivityComments = async (userId: string): Promise<ActivityComment[]> => {
    const { data, error } = await supabase
        .from("comments_activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data as ActivityComment[];
};

const fetchExpenseComments = async (userId: string): Promise<ExpenseComment[]> => {
    const { data, error } = await supabase
        .from("comments_expenses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data as ExpenseComment[];
};

export const CommentsList = () => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUser();
    }, []);

    const { 
        data: activityComments, 
        error: activityError, 
        isLoading: isLoadingActivities 
    } = useQuery<ActivityComment[], Error>({
        queryKey: ["activityComments", userId],
        queryFn: () => fetchActivityComments(userId!),
        enabled: !!userId,
    });

    const { 
        data: expenseComments, 
        error: expenseError, 
        isLoading: isLoadingExpenses 
    } = useQuery<ExpenseComment[], Error>({
        queryKey: ["expenseComments", userId],
        queryFn: () => fetchExpenseComments(userId!),
        enabled: !!userId,
    });

    if (isLoadingActivities || isLoadingExpenses) {
        return <div>Loading...</div>;
    }

    if (activityError) {
        return <div>Error loading activity comments: {activityError.message}</div>;
    }

    if (expenseError) {
        return <div>Error loading expense comments: {expenseError.message}</div>;
    }

    const hasNoComments = (!activityComments || activityComments.length === 0) && 
                         (!expenseComments || expenseComments.length === 0);

    return (
        <div>
            <h2 className="text-2xl text-gray-600 font-bold mb-4">Mes commentaires</h2>

            {hasNoComments && (
                <div className="text-center text-gray-500">Aucun commentaire trouvé.</div>
            )}

            <div className="space-y-4">
                {/* Affichage des commentaires d'activités */}
                {activityComments && activityComments.map((comment) => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500 mb-2">
                            Commentaire sur une activité • {new Date(comment.created_at).toLocaleDateString()} - Nom visible • {comment.user_comment}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                    </div>
                ))}

                {/* Affichage des commentaires de dépenses */}
                {expenseComments && expenseComments.map((comment) => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-500 mb-2">
                            Commentaire sur une dépense • {new Date(comment.created_at).toLocaleDateString()} - Nom visible • {comment.user_comment}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
