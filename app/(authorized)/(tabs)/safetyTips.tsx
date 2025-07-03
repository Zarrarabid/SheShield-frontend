import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator } from "react-native-paper";
import axios from 'axios';
import * as Location from 'expo-location';
import config from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
    id: string;
    content: string;
    timestamp: Date;
}

interface LocationCoordinates {
    lat: number | null;
    lng: number | null;
}

const SafetyAdvicePage: React.FC = () => {
    const [message, setMessage] = useState<Message | null>(null);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [locationCor, setLocationCor] = useState<LocationCoordinates>({ lat: null, lng: null });
    const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
    const [token, setToken] = useState<string>("");
    const apiUrl = config.API_URL;

    useEffect(() => {
        const loadUserData = async () => {
            const storedToken = await AsyncStorage.getItem("@token");
            if (storedToken) {
                setToken(storedToken);
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        if (!message && !isLoadingLocation && !isTyping) {
            setMessage({
                id: 'initial-tip',
                content: "Click the 'Get Safety Advice' button to receive location-based safety tips.",
                timestamp: new Date(),
            });
        }
    }, [message, isLoadingLocation, isTyping]);

    const fetchBotResponse = async (userInput: string) => {
        setIsTyping(true);
        try {
            let response = await axios.post(
                `${apiUrl}/api/openAI`,
                {
                    prompt: userInput
                },
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );
            const botMessage: Message = {
                id: Date.now().toString(),
                content: response?.data?.reasoning || "No specific advice received at this time. Please try again.",
                timestamp: new Date(),
            };

            setMessage(botMessage);
            setIsTyping(false);

        } catch (error) {
            setIsTyping(false);
            setMessage({
                id: Date.now().toString(),
                content: "Sorry, I couldn't process that. Please try again.",
                timestamp: new Date(),
            });
        }
    };

    const updateCurrentLocationForDisplay = async () => {
        setIsLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const locationData = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocationCor({
                    lat: locationData.coords.latitude,
                    lng: locationData.coords.longitude,
                });
            } else {
                setMessage({
                    id: Date.now().toString(),
                    content: "Location permission denied. Cannot get safety advice without location.",
                    timestamp: new Date(),
                });
            }
        } catch (error) {
            setMessage({
                id: Date.now().toString(),
                content: "Error getting location. Please try again.",
                timestamp: new Date(),
            });
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleGetSafetyAdvice = async () => {
        setMessage(null);
        await updateCurrentLocationForDisplay();
    };

    useEffect(() => {
        if (locationCor.lat !== null && locationCor.lng !== null) {
            const userInput = `Provides safety advice based on user surroundings and promotes situation awareness and preparedness. My current coordinates are Latitude: ${locationCor.lat}, Longitude: ${locationCor.lng}.`;
            fetchBotResponse(userInput);
        }
    }, [locationCor, token])

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Safety Advice Bot</Text>

            <Button
                title={isLoadingLocation ? "Getting Location..." : "Get Safety Advice"}
                onPress={handleGetSafetyAdvice}
                disabled={isLoadingLocation || isTyping || !token}
                color="#4B006E"
            />

            {(isLoadingLocation || isTyping) && (
                <View style={styles.activityIndicatorContainer}>
                    <ActivityIndicator size="large" color="#4B006E" />
                    <Text style={styles.loadingText}>
                        {isLoadingLocation ? "Getting current location..." : "Fetching safety advice..."}
                    </Text>
                </View>
            )}

            <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
                {message && !isLoadingLocation && !isTyping ? (
                    <View
                        key={message.id}
                        style={styles.singleMessageDisplay}
                    >
                        <Text style={styles.messageText}>{message.content}</Text>
                        <Text style={styles.timestampText}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </Text>
                    </View>
                ) : (
                    <Text>Loading...</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    singleMessageDisplay: {
        padding: 15,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        marginVertical: 10,
        alignSelf: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    activityIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#555',
    },
    messagesContainer: {
        flex: 1,
        width: '100%',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
    },
    messagesContent: {
        paddingBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    timestampText: {
        fontSize: 10,
        color: '#777',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
});

export default SafetyAdvicePage;