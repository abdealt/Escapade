import React, { useState } from 'react';
import { supabase } from '../supabase-client';

interface CommentsFormProps {
  tripId: string;
  onCommentAdded?: () => void;
}

export const CommentsForm: React.FC<CommentsFormProps> = ({ tripId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState<'activity' | 'expense'>('activity');
  const [targetId, setTargetId] = useState('');
  const [userComment, setUserComment] = useState('');
  const [activities, setActivities] = useState<{id: string, title: string}[]>([]);
  const [expenses, setExpenses] = useState<{id: string, title: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch activities and expenses when the component mounts
  React.useEffect(() => {
    const fetchTargets = async () => {
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, title')
        .eq('trip_id', tripId);

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('id, title')
        .eq('trip_id', tripId);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      } else {
        setActivities(activitiesData || []);
      }

      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
      } else {
        setExpenses(expensesData || []);
      }
    };

    fetchTargets();
  }, [tripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !targetId || !userComment.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content,
          target_id: targetId,
          user_comment: userComment,
          activity_id: targetType === 'activity' ? targetId : null,
          expense_id: targetType === 'expense' ? targetId : null,
          trip_id: tripId
        });

      if (error) {
        throw error;
      }

      // Reset form
      setContent('');
      setTargetType('activity');
      setTargetId('');
      setUserComment('');

      // Call onCommentAdded callback if provided
      onCommentAdded?.();

      alert('Commentaire ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      alert('Échec de l\'ajout du commentaire');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="targetType" className="block text-sm font-medium text-gray-300 mb-2">
          Type de cible
        </label>
        <select
          id="targetType"
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value as 'activity' | 'expense');
            setTargetId(''); // Reset target ID when type changes
          }}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          <option value="activity">Activité</option>
          <option value="expense">Dépense</option>
        </select>
      </div>

      <div>
        <label htmlFor="targetId" className="block text-sm font-medium text-gray-300 mb-2">
          {targetType === 'activity' ? 'Activité' : 'Dépense'}
        </label>
        <select
          id="targetId"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
          required
        >
          <option value="">Sélectionnez une {targetType === 'activity' ? 'activité' : 'dépense'}</option>
          {(targetType === 'activity' ? activities : expenses).map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="userComment" className="block text-sm font-medium text-gray-300 mb-2">
          Nom d'affichage
        </label>
        <input
          type="text"
          id="userComment"
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          placeholder="Votre nom ou pseudo"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
          Commentaire
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Votre commentaire"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white h-24"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 text-white disabled:opacity-50"
      >
        {isLoading ? 'Envoi en cours...' : 'Ajouter un commentaire'}
      </button>
    </form>
  );
};