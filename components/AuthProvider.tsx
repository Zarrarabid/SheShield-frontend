import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { createContext, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext<{
    signIn: (token: string, user: any) => void;
    signOut: () => void;
    imageCaptured: (imageUri: string) => void;
    token: MutableRefObject<string | null> | null;
    user: MutableRefObject<string | null> | null;
    imageUri: MutableRefObject<string | null> | null;
    isLoading: boolean;
}>({
    signIn: () => null,
    signOut: () => null,
    imageCaptured: () => null,
    token: null,
    user: null,
    imageUri: null,
    isLoading: true
});

export function useAuthSession() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }): ReactNode {
    const tokenRef = useRef<string | null>(null);
    const imageRef = useRef<string | null>(null);
    const userRef = useRef<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async (): Promise<void> => {
            const token = await AsyncStorage.getItem('@token');
            const user = await AsyncStorage.getItem('@user');
            const imageUri = await AsyncStorage.getItem('@imageUri');
            tokenRef.current = token || '';
            userRef.current = user || '';
            imageRef.current = imageUri || '';
            setIsLoading(false);
        })()
    }, []);

    const signIn = useCallback(async (token: string, user: any) => {
        console.log("user------", user)
        await AsyncStorage.setItem('@token', token);
        await AsyncStorage.setItem('@user', JSON.stringify(user));
        tokenRef.current = token;
        userRef.current = user;
        router.replace("/(authorized)/(tabs)");
    }, []);
    const imageCaptured = useCallback(async (imageUri: string,) => {
        await AsyncStorage.setItem('@imageUri', imageUri);
        imageRef.current = imageUri;
    }, []);

    const signOut = useCallback(async () => {
        await AsyncStorage.setItem('@token', '');
        await AsyncStorage.removeItem('user');
        tokenRef.current = null;
        userRef.current = null;
        router.replace('/login');
    }, []);

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                imageCaptured,
                token: tokenRef,
                user: userRef,
                imageUri: imageRef,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
