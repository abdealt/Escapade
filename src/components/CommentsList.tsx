import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase-client';
import { CommentsForm } from './CreateCommentForm';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_comment: string;
  activity_id?: string | null;
  expense_id?: string | null;
  activity?: { title: string };
  expense?: { title: string };
}

interface CommentsListProps {
  tripId: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({ tripId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          activity:activities(title),
          expense:expenses(title)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComments(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des commentaires:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [tripId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCommentTarget = (comment: Comment) => {
    if (comment.activity_id) {
      return `Activité: ${comment.activity?.title || 'N/A'}`;
    }
    if (comment.expense_id) {
      return `Dépense: ${comment.expense?.title || 'N/A'}`;
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout de commentaire */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Ajouter un commentaire</h3>
        <CommentsForm 
          tripId={tripId} 
          onCommentAdded={fetchComments} 
        />
      </div>

      {/* Liste des commentaires */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Commentaires ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            Aucun commentaire pour le moment
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">
                      {comment.user_comment}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {renderCommentTarget(comment)}
                  </span>
                </div>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};