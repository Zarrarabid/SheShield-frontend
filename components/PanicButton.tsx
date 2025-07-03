import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import axios from 'axios';
import ToastManager, { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import * as Location from 'expo-location';
import { ActivityIndicator } from "react-native-paper";
import { Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';


const PanicButton = ({ token, user, uri }: any) => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [imageString, setImageString] = useState<string | null>(uri || null);
    const apiUrl = config.API_URL;
    const [locationCor, setLocationCor] = useState<{ lat: number; lng: number } | null>(null);

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const tokenRef = useRef<string | null>(null);
    const accelerometerSubscription = useRef<any>(null);
    const lastShakeTime = useRef(0);
    const isAlertProcessing = useRef(false);

    const shakeCount = useRef(0);
    const lastIndividualShakeTime = useRef(0);
    const countdownTimer = useRef<any>(null);

    const SHAKE_THRESHOLD = 2.5;
    const DEBOUNCE_TIME = 3000;

    const SHAKE_WINDOW_TIME = 1500;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const storedImage = await AsyncStorage.getItem("@imageUri");
                const storedToken = await AsyncStorage.getItem("@token");

                if (storedImage) {
                    setImageString(storedImage);
                }

                if (storedToken) {
                    tokenRef.current = storedToken;
                    console.log("Token loaded from AsyncStorage:", storedToken ? "Present" : "Missing");
                } else if (token) {
                    tokenRef.current = token;
                    console.log("Using token from props:", token ? "Present" : "Missing");
                } else {
                    console.warn("No token available from props or AsyncStorage after initial load.");
                }

                await updateCurrentLocationForDisplay();

            } catch (error) {
                console.error("Failed to load initial data from AsyncStorage or get initial location:", error);
                Toast.show({
                    type: "error",
                    text1: "Failed to load app data. Please restart.",
                });
            }
        };
        loadInitialData();

        return () => {
            _unsubscribe();
            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (tokenRef.current && !accelerometerSubscription.current) {
            _subscribe();
        } else if (!tokenRef.current && accelerometerSubscription.current) {
            _unsubscribe();
        }
    }, [tokenRef.current]);


    const updateCurrentLocationForDisplay = async () => {
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
                console.warn("Location permission not granted for initial display.");
            }
        } catch (error) {
            console.error("Error getting initial display location:", error);
        }
    };

    const sendAlert = async () => {
        if (isAlertProcessing.current) {
            console.log("sendAlert: Alert already in progress, skipping.");
            return;
        }

        const currentToken = tokenRef.current;
        console.log("sendAlert: Current token for API call:", currentToken ? "Present" : "Missing");

        if (!currentToken) {
            Toast.show({
                type: "error",
                text1: "Authentication token is missing. Please log in again.",
            });
            console.error("sendAlert: No authentication token available.");
            setLoading(false);
            isAlertProcessing.current = false;
            return;
        }

        setShowConfirmationModal(false);
        if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
        }
        setCountdown(5);

        isAlertProcessing.current = true;
        setLoading(true);

        let googleMapsLink = "";
        let currentLatitude: number | null = null;
        let currentLongitude: number | null = null;

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: "error",
                    text1: "Location permission not granted. Cannot send alert.",
                });
                console.error("sendAlert: Location permission denied.");
                return;
            }

            const locationData = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            currentLatitude = locationData.coords.latitude;
            currentLongitude = locationData.coords.longitude;
            setLocationCor({
                lat: currentLatitude,
                lng: currentLongitude,
            });

            googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${currentLatitude},${currentLongitude}`; // Corrected Google Maps URL

        } catch (error) {
            console.error("sendAlert: Error getting location data:", error);
            Toast.show({
                type: "error",
                text1: "Error getting your current location. Please ensure location services are enabled.",
            });
            return;
        }

        try {
            const formData = new FormData();
            if (imageString) {
                formData.append('image', {
                    uri: imageString,
                    type: 'image/jpeg',
                    name: 'photo.jpg',
                } as any);
            } else {
                formData.append('image', "");
            }

            formData.append('location', googleMapsLink);
            formData.append('contacts', "");
            formData.append('email', user?.email || "");

            console.log("sendAlert: Attempting to send alert with data:", {
                location: googleMapsLink,
                email: user?.email,
                imageAttached: !!imageString,
                token: currentToken ? "Token present" : "Token missing"
            });

            const res = await axios.post(`${apiUrl}/api/contacts/send-alert`, formData, {
                headers: {
                    'x-auth-token': currentToken,
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("sendAlert: API Response for alert:", res.data);

            if (res.data.status === 404) {
                Toast.show({
                    type: "warn",
                    text1: res.data.message,
                });
                return;
            }

            Toast.show({
                type: "success",
                text1: "Alert has been sent to all contacts",
            });
            router.navigate("/(authorized)/(tabs)/dashboard")

        } catch (error: any) {
            console.error("sendAlert: Axios request error during alert sending:", error.response ? error.response.data : error.message);
            Toast.show({
                type: "error",
                text1: `Error sending Alert: ${error.response?.data?.message || error.message || "Unknown error"}`,
            });
        } finally {
            setLoading(false);
            isAlertProcessing.current = false;
        }
    };

    const handleShake = () => {
        const currentTime = Date.now();

        if (showConfirmationModal && (currentTime - lastIndividualShakeTime.current < SHAKE_WINDOW_TIME)) {
            console.log("Second shake detected! Confirming alert.");
            sendAlert();
            shakeCount.current = 0;
            lastIndividualShakeTime.current = 0;
            return;
        }

        if (currentTime - lastShakeTime.current > DEBOUNCE_TIME && !isAlertProcessing.current) {
            lastShakeTime.current = currentTime;
            lastIndividualShakeTime.current = currentTime;
            shakeCount.current = 1;
            console.log("First distinct shake detected. Showing confirmation modal.");
            setShowConfirmationModal(true);
            setCountdown(5);

            if (countdownTimer.current) {
                clearInterval(countdownTimer.current);
            }
            countdownTimer.current = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        clearInterval(countdownTimer.current!);
                        countdownTimer.current = null;
                        setShowConfirmationModal(false);
                        shakeCount.current = 0;
                        lastIndividualShakeTime.current = 0;
                        console.log("Countdown finished, alert not sent.");
                        return 0;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
        } else {
            console.log(`Shake detected but debounced or alert in progress. Time diff: ${currentTime - lastShakeTime.current}, Processing: ${isAlertProcessing.current}`);
        }
    };

    const _subscribe = () => {
        if (tokenRef.current && !accelerometerSubscription.current) {
            accelerometerSubscription.current = Accelerometer.addListener(accelerometerData => {
                const { x, y, z } = accelerometerData;
                const totalForce = Math.sqrt(x * x + y * y + z * z);
                if (totalForce > SHAKE_THRESHOLD) {
                    handleShake();
                }
            });
            Accelerometer.setUpdateInterval(100);
            console.log("_subscribe: Accelerometer subscribed successfully.");
        } else {
            console.warn("_subscribe: Accelerometer not subscribed because token is not yet available or already subscribed.");
        }
    };

    const _unsubscribe = () => {
        if (accelerometerSubscription.current) {
            accelerometerSubscription.current.remove();
            accelerometerSubscription.current = null;
            console.log("_unsubscribe: Accelerometer unsubscribed.");
        }
    };

    const handleCancelAlert = () => {
        setShowConfirmationModal(false);
        if (countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
        }
        setCountdown(5);
        shakeCount.current = 0;
        lastIndividualShakeTime.current = 0;
        console.log("Alert cancelled by user.");
        Toast.show({
            type: "info",
            text1: "Alert cancelled.",
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Emergency Panic Button</Text>
                <Text style={styles.subTitle}>Press in case of emergency or shake phone to alert your contacts and authorities</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity disabled={loading} style={styles.panicButton} onPress={sendAlert}>
                    {loading ?
                        <ActivityIndicator size="large" color="#ffffff" />
                        :
                        <Ionicons name="shield" size={64} color="white" />
                    }
                </TouchableOpacity>
            </View>
            <Text style={styles.coordinates}>
                Your current coordinates: {locationCor?.lat?.toFixed(6) || 'Loading...'}, {locationCor?.lng?.toFixed(6) || 'Loading...'}
            </Text>
            <ToastManager />

            {/* Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showConfirmationModal}
                onRequestClose={handleCancelAlert}
            >
                <View style={modalStyles.centeredView}>
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalTitle}>Emergency Alert</Text>
                        <Text style={modalStyles.modalText}>
                            Alert will be sent in {countdown} seconds.
                        </Text>
                        <Text style={modalStyles.modalSubText}>
                            Shake again or press Send Now to send immediately.
                        </Text>
                        <View style={modalStyles.buttonGroup}>
                            <Pressable
                                style={[modalStyles.button, modalStyles.buttonCancel]}
                                onPress={handleCancelAlert}
                            >
                                <Text style={modalStyles.textStyle}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[modalStyles.button, modalStyles.buttonSend]}
                                onPress={sendAlert}
                            >
                                <Text style={modalStyles.textStyle}>Send Now</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: '#4B006E',
        borderRadius: 8,
        padding: 24,
        backgroundColor: 'white',
    },
    header: {
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subTitle: {
        color: '#A0AEC0',
        textAlign: 'center',
        fontSize: 14,
    },
    buttonContainer: {
        marginTop: 16,
    },
    panicButton: {
        height: 100,
        width: 100,
        backgroundColor: '#4B006E',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    coordinates: {
        marginTop: 16,
        fontSize: 12,
        color: '#A0AEC0',
        textAlign: 'center',
    },
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 10,
        fontSize: 18,
        textAlign: 'center',
    },
    modalSubText: {
        marginBottom: 20,
        fontSize: 14,
        textAlign: 'center',
        color: '#666',
    },
    buttonGroup: {
        flexDirection: 'row',
        marginTop: 10,
    },
    button: {
        borderRadius: 10,
        padding: 12,
        marginHorizontal: 10,
        minWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#f44336',
    },
    buttonSend: {
        backgroundColor: '#4B006E',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});


export default PanicButton;