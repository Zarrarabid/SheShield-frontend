import { useAuthSession } from "@/components/AuthProvider";
import { Redirect, Stack } from 'expo-router';
import { StatusBar, Text } from 'react-native';
import { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout(): ReactNode {
    const { token, isLoading } = useAuthSession()

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!token?.current) {
        return <Redirect href="/login" />;
    }

    return (
        <GestureHandlerRootView style={{ flexGrow: 1 }}>
            <StatusBar barStyle="default" />
            <Stack >
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false
                    }}

                />
                <Stack.Screen
                    name="+note-found"
                    options={{
                        headerTitle: "Oops! Not Found",
                        // headerShown: false
                    }}
                />
            </Stack >
        </GestureHandlerRootView>
    );
}