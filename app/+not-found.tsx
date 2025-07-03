import { Link } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function NotFoundScreen() {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://static-00.iconduck.com/assets.00/404-page-not-found-illustration-2048x998-yjzeuy4v.png' }} // Use URI for remote images
                // source={require('./assets/404.png')} // Replace with your own image
                style={styles.image}
            />
            <Text style={styles.title}>Oops! Page Not Found</Text>
            <Text style={styles.subtitle}>The page you are looking for does not exist.</Text>
            <Link
                style={
                    styles.linkBtn
                }
                href="/(tabs)" >
                Go back to Home screen!
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    linkBtn: {
        fontSize: 22,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    image: {
        width: "100%",
        height: 200,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#343a40',
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
