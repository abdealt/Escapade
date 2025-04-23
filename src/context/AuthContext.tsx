import { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase-client';

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null)

    useEffect(()=> {
        supabase.auth.getSession().then(({data : {session}})=> {
            setUser(session?.user ?? null)
        });

        const {data: listerner} = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            listerner?.subscription.unsubscribe()
        }
    }, []);

    const signInWithGoogle = () => {
        supabase.auth.signInWithOAuth({
            provider:'google',
        })
    }

    const signOut = () => {
        supabase.auth.signOut();
    }


    return <AuthContext.Provider value={{user, signInWithGoogle, signOut}}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}