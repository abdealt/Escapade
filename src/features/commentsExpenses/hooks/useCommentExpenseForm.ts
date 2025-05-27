import { useEffect, useState } from "react";
import { CommentExpense, CommentExpenseFormData } from "../services/commentExpenseService";

interface UseCommentExpenseFormProps {
  editingComment: CommentExpense | null;
  selectedExpenseId?: number | null;
  userName: string;
  onSubmit: (data: CommentExpenseFormData, editingCommentId?: number) => void;
  onCancel?: () => void;
}

export const useCommentExpenseForm = ({
  editingComment,
  selectedExpenseId,
  userName,
  onSubmit,
  onCancel
}: UseCommentExpenseFormProps) => {
  const [formData, setFormData] = useState({
    content: "",
    expense_id: selectedExpenseId || ("" as number | "")
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mettre à jour le formulaire si un commentaire est en cours d'édition
  useEffect(() => {
    if (editingComment) {
      setFormData({
        content: editingComment.content,
        expense_id: editingComment.expense_id
      });
    } else {
      setFormData({
        content: "",
        expense_id: selectedExpenseId || ""
      });
    }
  }, [editingComment, selectedExpenseId]);

  // Si selectedExpenseId change, mettre à jour expense_id
  useEffect(() => {
    if (selectedExpenseId && !editingComment) {
      setFormData(prev => ({
        ...prev,
        expense_id: selectedExpenseId
      }));
    }
  }, [selectedExpenseId, editingComment]);

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "expense_id" ? (value ? Number(value) : "") : value 
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
    
    if (!formData.expense_id) {
      errors.expense_id = "Veuillez sélectionner une dépense.";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData: CommentExpenseFormData = {
        content: formData.content,
        expense_id: Number(formData.expense_id),
        user_comment: userName
      };

      onSubmit(submitData, editingComment?.id);
    }
  };

  // Annuler l'édition
  const handleCancel = () => {
    setFormData({
      content: "",
      expense_id: selectedExpenseId || ""
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