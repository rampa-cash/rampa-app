import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from './types';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    sessionToken: string | null;
    isLoading: boolean;
    isSessionValidated: boolean; // Flag to track if session has been validated on this app launch
    login: (user: User, sessionToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setSessionValidated: (validated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        set => ({
            isAuthenticated: false,
            user: null,
            sessionToken: null,
            isLoading: false,
            isSessionValidated: false, // Not persisted - resets on app restart
            login: (user, sessionToken) =>
                set({
                    isAuthenticated: true,
                    user,
                    sessionToken,
                    isLoading: false,
                    isSessionValidated: true, // Session is validated when login succeeds
                }),
            logout: () =>
                set({
                    isAuthenticated: false,
                    user: null,
                    sessionToken: null,
                    isLoading: false,
                    isSessionValidated: false, // Clear validation flag on logout
                }),
            setLoading: loading => set({ isLoading: loading }),
            setSessionValidated: validated =>
                set({ isSessionValidated: validated }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: state => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                sessionToken: state.sessionToken,
                // Note: isSessionValidated is NOT persisted - it resets on app restart
            }),
        }
    )
);
