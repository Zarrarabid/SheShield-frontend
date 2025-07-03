import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <View style={styles.card}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>{icon}</View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderRadius: 10,
        // elevation: 3, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: 'white',
        marginBottom: 16,
        marginTop: 16,
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: '#F2F2F2',
        padding: 12,
        borderRadius: 50,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    description: {
        marginTop: 8,
        color: '#4B5563',
    },
});

export default FeatureCard;