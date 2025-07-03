import React, { useEffect, useState, useRef } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    TextInput,
    Button,
    Text,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    TouchableOpacity
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import config from '@/config';


export default function Map() {
    const mapRef = useRef<MapView>(null);
    const GOOGLE_MAPS_APIKEY = config.GoolgelMap_API;
    const [region, setRegion] = useState({
        latitude: 33.6844,
        longitude: 73.0479,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }); // initial islamabad
    const [currentLocation, setCurrentLocation] = useState<any>(null);
    const [currentAddress, setCurrentAddress] = useState('');
    const [destination, setDestination] = useState('');
    const [destinationCoords, setDestinationCoords] = useState<any>(null);
    const [routeReady, setRouteReady] = useState(false);

    useEffect(() => {
        const fetchLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const [address] = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            const addressString = [
                address.name,
                address.street,
                address.city,
                address.region,
                address.postalCode,
                address.country
            ].filter(Boolean).join(', ');

            const newRegion = {
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            };

            setCurrentLocation({ latitude, longitude });
            setCurrentAddress(addressString);
            setRegion(newRegion);

            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }
        };

        fetchLocation();
    }, []);

    useEffect(() => {
        if (routeReady && currentLocation) {
            mapRef.current?.animateToRegion({
                ...currentLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        }
    }, [routeReady, currentLocation]);

    const handleSearch = async () => {
        Keyboard.dismiss();
        try {
            const results = await Location.geocodeAsync(destination);
            if (results.length > 0) {
                const { latitude, longitude } = results[0];
                setDestinationCoords({ latitude, longitude });
                mapRef.current?.fitToCoordinates(
                    [currentLocation, { latitude, longitude }],
                    {
                        edgePadding: {
                            top: 100,
                            right: 50,
                            bottom: 50,
                            left: 50
                        },
                        animated: true
                    }
                );
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            alert('Error searching location');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Your Location"
                            value={currentAddress}
                            editable={false}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Destination"
                            value={destination}
                            onChangeText={setDestination}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    <MapView
                        ref={mapRef}
                        style={styles.mapStyle}
                        initialRegion={region}
                        customMapStyle={mapStyle}
                        onMapReady={() => setRouteReady(true)}
                    >
                        {currentLocation && (
                            <Marker
                                coordinate={currentLocation}
                                title="Your Location"
                                pinColor="blue"
                            />
                        )}
                        {destinationCoords && (
                            <Marker
                                coordinate={destinationCoords}
                                title="Destination"
                            />
                        )}
                        {currentLocation && destinationCoords && routeReady && (
                            <MapViewDirections
                                origin={currentLocation}
                                destination={destinationCoords}
                                apikey={GOOGLE_MAPS_APIKEY}
                                strokeWidth={4}
                                strokeColor="hotpink"
                                mode="DRIVING"
                                onReady={(result: any) => {
                                    mapRef.current?.fitToCoordinates(result.coordinates, {
                                        edgePadding: {
                                            top: 100,
                                            right: 50,
                                            bottom: 50,
                                            left: 50
                                        },
                                        animated: true
                                    });
                                }}
                                onError={(errorMessage: any) => {
                                    console.log('Directions error:', errorMessage);
                                    alert('Could not calculate route: ' + errorMessage);
                                }}
                            />
                        )}
                    </MapView>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const mapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }],
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }],
    },
];

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontFamily: "Poppins"
    },
    searchButton: {
        backgroundColor: '#4B006E',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 3,
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mapStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        fontFamily: "Poppins"
    },
    inputContainer: {
        position: 'absolute',
        top: Constants.statusBarHeight + 10,
        left: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
        fontFamily: "Poppins"
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: 'white',
        fontFamily: "Poppins"
    },
});
