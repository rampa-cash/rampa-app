import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from './types';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    sessionToken: string | null;
    isLoading: boolean;
    login: (user: User, sessionToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            isAuthenticated: false,
            user: null,
            sessionToken: null,
            isLoading: false,
            login: (user, sessionToken) =>
                set({
                    isAuthenticated: true,
                    user,
                    sessionToken,
                    isLoading: false,
                }),
            logout: () =>
                set({
                    isAuthenticated: false,
                    user: null,
                    sessionToken: null,
                    isLoading: false,
                }),
            setLoading: loading => set({ isLoading: loading }),
        }),
        {
            name: 'auth-storage',
            partialize: state => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                sessionToken: state.sessionToken,
            }),
        }
    )
);
