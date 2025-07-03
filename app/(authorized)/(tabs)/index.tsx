import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons"
import * as Location from 'expo-location';
import FeatureCard from '@/components/Features';
import HeroSection from '@/components/HeroSection';
import ToastManager, { Toast } from 'toastify-react-native';
import { useRouter } from 'expo-router';

export default function HomePage() {
  const router = useRouter();
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    checkLocationServices();
  }, []);

  const checkLocationServices = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    console.log("Current permission status:", status);

    if (status !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      console.log("New permission status:", newStatus);

      if (newStatus === 'granted') {
        setLocationEnabled(true);
        Toast.show({
          text1: "Location Access Granted",
          text2: "You can now use location services.",
        });
        await getLocation();
      } else {
        setLocationEnabled(false);
        Toast.show({
          text1: "Location Services Disabled",
          text2: "Please enable location services for the app to function properly.",
          type: 'error',
        });
      }
    } else {
      setLocationEnabled(true);
      await getLocation();
    }
  };

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const features = [
    {
      icon: <Ionicons size={32} name="shield" style={styles.icon} />,
      title: "Panic Button",
      description: "Quick, hands-free emergency assistance with voice activation",
    },
    {
      icon: <Ionicons size={32} name="chatbox" style={styles.icon} />,
      title: "AI-Powered Chatbot",
      description: "Real-time guidance and support in critical situations",
    },
    {
      icon: <Ionicons size={32} name="map" style={styles.icon} />,
      title: "Safe Route Planner",
      description: "Identifies and navigates secure paths to your destination",
    },
    {
      icon: <Ionicons size={32} name="barbell" style={styles.icon} />,
      title: "Emergency Alerts",
      description: "Instant notifications to trusted contacts and authorities",
    },
    {
      icon: <Ionicons size={32} name="person" style={styles.icon} />,
      title: "Community Forum",
      description: "Connect, share experiences, and support each other",
    },
    {
      icon: <Ionicons size={32} name="list" style={styles.icon} />,
      title: "Personalized Safety Plan",
      description: "Customized safety strategies based on your preferences",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <HeroSection />

      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, styles.FeatureText]}>Our Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </View>
      </View>

      <View style={styles.readySection}>
        <Text style={styles.sectionTitle}>Ready to Feel Safer?</Text>
        <Text style={styles.readyText}>
          Join thousands of women who are taking control of their safety with our comprehensive solution.
        </Text>
        <TouchableOpacity onPress={() => router.navigate("/(authorized)/(tabs)/dashboard")} style={styles.button}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" color={"white"} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>
      <ToastManager />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F2F2F2',
    // backgroundColor: '#222831',
    // opacity: 0.7,
    fontFamily: "Poppins"
  },
  featuresSection: {
    paddingTop: 26,
    paddingHorizontal: 16,
    // backgroundColor: 'white',
    fontFamily: "Poppins"
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: "Poppins"
  },
  FeatureText: {
    color: "black"
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    fontFamily: "Poppins"
  },
  readySection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: 'white',
    alignItems: 'center',
    fontFamily: "Poppins"
  },
  readyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: "Poppins"
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B006E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    fontFamily: "Poppins"
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: "Poppins"
  },
  arrowIcon: {
    marginLeft: 8,
    fontFamily: "Poppins"
  },
  icon: {
    height: 32,
    width: 32,
    color: '#4B006E',
    fontFamily: "Poppins"
  },
});
