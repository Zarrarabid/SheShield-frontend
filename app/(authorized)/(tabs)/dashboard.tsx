import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons from Expo Vector Icons
// import DashboardHeader from '../components/DashboardHeader';
import PanicButton from '@/components/PanicButton';
// import SafeRouteMap from '@/components/SafeRouteMap';
import EmergencyContacts from '@/components/EmergencyContacts';
import SafetyTips from '@/components/SafetyTips';
import ChatbotInterface from '@/components/ChatbotInterface';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CaptureImage from '@/components/CaptureImage';
import * as Location from 'expo-location';

const DashboardPage = () => {
    const router = useRouter()
    const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // Default location
    const [activeTab, setActiveTab] = useState('panic');
    const [token, setToken] = useState<string>("");
    const [user, setUser] = useState<any>("");
    const [uri, setUri] = useState<any>(null);
    const [locationCor, setLocationCor] = useState<{ lat: number; lng: number } | null>(null);





    useEffect(() => {
        const loadUserData = async () => {
            const storedToken = await AsyncStorage.getItem("@token");
            const storedUser = await AsyncStorage.getItem("@user");

            if (storedToken) {
                setToken(storedToken);
            }

            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData || "");
            }
        };
        loadUserData();
    }, []);

    const getUserLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position?.coords?.latitude,
                    lng: position?.coords?.longitude,
                });
            },
            (error) => {
                console.error('Error getting location:', error);
            },
        );
    };

    const getLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            setLocationCor({
                lat: location?.coords?.latitude,
                lng: location?.coords?.longitude,
            });
        } catch (error) {
            console.error("Error getting location:", error);
        }
    };

    useEffect(() => {
        // getUserLocation();
        getLocation()
    }, []);

    const googleMapsLink = `https://www.google.com/maps/?q=${locationCor?.lat},${locationCor?.lng}`;

    return (
        <View style={styles.container}>
            {/* <DashboardHeader /> */}


            <ScrollView contentContainerStyle={styles.main}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>Welcome Back</Text>
                    <Text style={styles.welcomeText}>Your safety dashboard is ready</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.panicButton} onPress={() => setActiveTab('panic')}>
                            <MaterialCommunityIcons name="shield" size={24} color="white" />
                            <Text style={styles.buttonText}>Quick Access Panic Button</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.chatButton} onPress={() => setActiveTab('chatbot')}>
                            <MaterialCommunityIcons name="message-text" size={24} color="black" />
                            <Text style={styles.buttonTextChat}>Talk to Safety Assistant</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tipCard}>
                        <Text style={styles.tipTitle}>Safety Tip of the Day</Text>
                        <Text style={styles.tipText}>
                            Always be aware of your surroundings. If you feel uncomfortable in any situation, trust your instincts
                            and move to a safer location.
                        </Text>
                    </View>
                </View>

                <View style={styles.quickActionsCard}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.actionButtons}>
                        {/* <TouchableOpacity style={styles.customButton} onPress={getUserLocation}>
        <Text style={styles.buttonText}>Update My Location</Text>
    </TouchableOpacity> */}

                        <TouchableOpacity style={styles.customButton} onPress={() => setActiveTab('contacts')}>
                            <Text style={styles.buttonText}>Manage Emergency Contacts</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.customButton} onPress={() => router.navigate("/(authorized)/(tabs)/community")}>
                            <Text style={styles.buttonText}>Community Forum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.customButton} onPress={() => router.navigate("/(authorized)/(tabs)/safetyPlan")}>
                            <Text style={styles.buttonText}>My Safety Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {activeTab === 'panic' && <PanicButton token={token} uri={uri} user={user} location={location} />}
                {/* {activeTab === 'routes' && <SafeRouteMap />} */}
                {activeTab === 'contacts' && <EmergencyContacts token={token} />}
                {activeTab === 'tips' && <SafetyTips />}
                {activeTab === 'chatbot' && <ChatbotInterface />}
                <View style={styles.ImageView}>
                    <CaptureImage uri={uri} setUri={setUri} />
                </View>
            </ScrollView>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        // backgroundColor: '#222831',
        // opacity: 0.7,
        fontFamily: "Poppins"
    },
    main: {
        padding: 16,
        fontFamily: "Poppins"
    },
    customButton: {
        backgroundColor: '#4B006E',
        padding: 6,
        borderRadius: 5,
        marginVertical: 1,
        alignItems: 'center',
    },
    welcomeCard: {
        backgroundColor: '#FBFBFB',
        padding: 24,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        // elevation: 2,
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "Poppins"
    },
    welcomeText: {
        color: '#A0AEC0',
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    panicButton: {
        flex: 1,
        backgroundColor: '#4B006E',
        borderRadius: 8,
        padding: 16,
        marginRight: 8,
        fontFamily: "Poppins"
    },
    chatButton: {
        flex: 1,
        borderColor: '#4B006E',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        fontFamily: "Poppins"
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: "Poppins"
    },
    buttonTextChat: {
        color: 'black',
        fontSize: 16,
        fontFamily: "Poppins"
    },
    tipCard: {
        backgroundColor: '#FEEBC8',
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
        fontFamily: "Poppins"
    },
    tipTitle: {
        fontWeight: '500',
        fontFamily: "Poppins"
    },
    tipText: {
        marginTop: 8,
        fontFamily: "Poppins"
    },
    quickActionsCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        // elevation: 2,
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    ImageView: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        // elevation: 2,
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    quickActionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "Poppins"
    },
    actionButtons: {
        marginTop: 16,
        display: "flex",
        flexDirection: "column",
        rowGap: 3,
        fontFamily: "Poppins"
    },
});

export default DashboardPage;