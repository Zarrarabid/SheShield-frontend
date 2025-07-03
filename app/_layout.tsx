import AuthProvider from "@/components/AuthProvider";
import { Slot } from "expo-router";
import { ReactNode, useState, useEffect } from "react";
import { LogBox, View, Text, StyleSheet, Image } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

LogBox.ignoreAllLogs(true);

SplashScreen.preventAutoHideAsync();

function CustomSplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')} 
        style={styles.splashImage}
        resizeMode="contain"
        onError={(e) => console.log('Splash image loading error:', e.nativeEvent.error)}
      />
      <Text style={styles.splashText}>Welcome to the App!</Text>
      <Text style={styles.splashSubText}>Loading content...</Text>
    </View>
  );
}


export default function RootLayout(): ReactNode {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'Poppins': require('@/assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();

      const timer = setTimeout(() => {
        setAppIsReady(true); 
      }, 2500); 

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]); 

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center', 
    backgroundColor: '#6200EE', 
  },
  splashImage: {
    width: 250, 
    height: 250, 
    marginBottom: 30, 
    borderRadius: 25, 
  },
  splashText: {
    fontSize: 32, 
    fontWeight: 'bold',
    color: '#FFFFFF', 
    fontFamily: 'Poppins', 
    textShadowColor: 'rgba(0, 0, 0, 0.3)', 
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  splashSubText: {
    fontSize: 18,
    color: '#E0E0E0', 
    marginTop: 10,
    fontFamily: 'Poppins', 
  },
});


