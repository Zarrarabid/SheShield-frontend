import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HeroSection() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/homeImage1.png')}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    Your Safety Companion <Text style={styles.highlight}>Anytime, Anywhere</Text>
                </Text>
                <Text style={styles.description}>
                    A comprehensive solution designed to empower women with real-time assistance, proactive safety measures,
                    and a supportive community.
                </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.navigate("/(authorized)/(tabs)/dashboard")}
                    >
                        <Text style={styles.buttonText}>Get Started</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="white" style={styles.arrowIcon} />
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        paddingVertical: 20,
        paddingHorizontal: 16,
        // backgroundColor: '#222831',
        backgroundColor: '#F2F2F2',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: "black",
        marginBottom: 12,
    },
    highlight: {
        color: '#4B006E',
    },
    description: {
        fontSize: 18,
        color: "black",
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4B006E',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
    },
    arrowIcon: {
        marginLeft: 8,
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

