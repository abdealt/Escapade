// src/context/AuthContext.tsx - Version corrigée pour Netlify

import { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase-client';

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(()=> {
        // Récupération de la session initiale
        supabase.auth.getSession().then(({data : {session}})=> {
            setUser(session?.user ?? null)
            
            // Si un utilisateur vient de se connecter via OAuth, rediriger vers la page mémorisée
            if (session?.user && window.location.href.includes('access_token')) {
                const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
                localStorage.removeItem('redirectAfterLogin');
                // Nettoyer l'URL des paramètres OAuth et rediriger
                window.history.replaceState({}, document.title, window.location.origin + redirectPath);
            }
        });

        // Écouter les changements d'état d'authentification
        const {data: listener} = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null)
            
            // Si un utilisateur vient de se connecter, rediriger si nécessaire
            if (event === 'SIGNED_IN' && session?.user) {
                const redirectPath = localStorage.getItem('redirectAfterLogin');
                if (redirectPath) {
                    localStorage.removeItem('redirectAfterLogin');
                    // Nettoyer l'URL et rediriger
                    window.history.replaceState({}, document.title, window.location.origin + redirectPath);
                }
            }
        })

        return () => {
            listener?.subscription.unsubscribe()
        }
    }, []);

    const signInWithGoogle = async () => {
        try {
            // Avec l'OAuth intégré Supabase, pas besoin de spécifier redirectTo
            // Supabase utilisera automatiquement la Site URL configurée
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });
        } catch (error: any) {
            console.error('Erreur lors de la connexion Google:', error.message);
            throw error;
        }
    }

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
    }

    const signUpWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
    }

    const signOut = () => {
        supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{
            user, 
            signInWithGoogle, 
            signInWithEmail,
            signUpWithEmail,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
