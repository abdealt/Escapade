import { useEffect, useState } from "react";
import { CommentActivity, CommentActivityFormData } from "../services/commentActivityService";

interface UseCommentActivityFormProps {
  editingComment: CommentActivity | null;
  selectedActivityId?: number | null;
  userName: string;
  onSubmit: (data: CommentActivityFormData, editingCommentId?: number) => void;
  onCancel?: () => void;
}

export const useCommentActivityForm = ({
  editingComment,
  selectedActivityId,
  userName,
  onSubmit,
  onCancel
}: UseCommentActivityFormProps) => {
  const [formData, setFormData] = useState({
    content: "",
    activity_id: selectedActivityId || ("" as number | "")
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mettre à jour le formulaire si un commentaire est en cours d'édition
  useEffect(() => {
    if (editingComment) {
      setFormData({
        content: editingComment.content,
        activity_id: editingComment.activity_id
      });
    } else {
      setFormData({
        content: "",
        activity_id: selectedActivityId || ""
      });
    }
  }, [editingComment, selectedActivityId]);

  // Si selectedActivityId change, mettre à jour activity_id
  useEffect(() => {
    if (selectedActivityId && !editingComment) {
      setFormData(prev => ({
        ...prev,
        activity_id: selectedActivityId
      }));
    }
  }, [selectedActivityId, editingComment]);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "activity_id" ? (value ? Number(value) : "") : value 
    }));
    
    // Effacer l'erreur si l'utilisateur commence à corriger
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.content.trim()) {
      errors.content = "Le commentaire est requis.";
    }
    
    if (!formData.activity_id) {
      errors.activity_id = "Veuillez sélectionner une activité.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData: CommentActivityFormData = {
        content: formData.content,
        activity_id: Number(formData.activity_id),
        user_comment: userName
      };

      onSubmit(submitData, editingComment?.id);
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    setFormData({
      content: "",
      activity_id: selectedActivityId || ""
    });
    setFormErrors({});
    onCancel?.();
  };

  // Gestion des erreurs de soumission
  const setSubmitError = (error: string) => {
    setFormErrors(prev => ({
      ...prev,
      submit: error
    }));
  };

  return {
    formData,
    formErrors,
    isEditMode: !!editingComment,
    handleChange,
    handleSubmit,
    handleCancel,
    setSubmitError
  };
};