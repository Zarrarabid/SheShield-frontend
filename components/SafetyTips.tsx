import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const SafetyTips = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const isNightTime = currentTime.getHours() >= 18 || currentTime.getHours() <= 6;

  const allTips = [
    {
      id: "1",
      title: "Stay aware of your surroundings",
      description: "Keep your head up and avoid distractions like looking at your phone while walking. Be aware of who is around you.",
      category: "general",
      icon: <Ionicons name="alert-circle" size={20} />,
    },
    {
      id: "2",
      title: "Share your location with trusted contacts",
      description: "Let someone know your plans, especially when meeting new people or going to unfamiliar places.",
      category: "general",
      icon: <Ionicons name="map" size={20} />,
    },
    {
      id: "3",
      title: "Use well-lit and populated routes",
      description: "Especially at night, stick to well-lit streets and avoid shortcuts through isolated areas.",
      category: "travel",
      icon: <Ionicons name="moon" size={20} />,
      isTimeBased: true,
    },
    {
      id: "4",
      title: "Check your car before entering",
      description: "Before getting in, check the back seat and under the vehicle. Lock doors immediately after entering.",
      category: "travel",
      icon: <Ionicons name="car" size={20} />,
    },
    {
      id: "5",
      title: "Trust your instincts",
      description: "If a situation feels wrong, it probably is. Don't worry about being polite - your safety comes first.",
      category: "general",
      icon: <Ionicons name="alert-circle" size={20} />,
    },
    {
      id: "6",
      title: "Secure your home properly",
      description: "Use deadbolts, security systems, and ensure all windows and doors are locked before leaving or going to bed.",
      category: "home",
      icon: <Ionicons name="home" size={20} />,
    },
    {
      id: "7",
      title: "Be cautious with ride-sharing services",
      description: "Verify the driver and car details before getting in. Share your trip status with a friend.",
      category: "travel",
      icon: <Ionicons name="car" size={20} />,
    },
    {
      id: "8",
      title: "Stay in groups when possible",
      description: "There's safety in numbers. Try to avoid being alone in unfamiliar or isolated areas.",
      category: "social",
      icon: <Ionicons name="person" size={20} />,
    },
  ];

  const filteredTips = allTips.filter((tip) => {
    if (activeCategory !== "all" && tip.category !== activeCategory) {
      return false;
    }

    if (tip.isTimeBased && !isNightTime && tip.icon.type === "Moon") {
      return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Tips & Advice</Text>
        <Text style={styles.subTitle}>
          Personalized safety recommendations based on your location and current conditions
        </Text>
      </View>
      <View style={styles.locationInfo}>
        <Ionicons name="map" size={20} style={styles.icon} />
        <Text style={styles.locationText}>
        </Text>
        <Ionicons name="watch" size={20} style={styles.icon} />
        <Text style={styles.locationText}>
          {isNightTime ? <Ionicons name="moon" size={20} /> : <Ionicons name="sunny" size={20} />} {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

      <View style={styles.categoryContainer}>
        {["all", "general", "travel", "social", "home"].map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveCategory(category)}
            style={[styles.categoryButton, activeCategory === category && styles.activeCategoryButton]}
          >
            <Text style={[styles.categoryText, activeCategory === category && styles.activeCategoryText]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tipCard}>
            <View style={styles.tipContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, item.isTimeBased && isNightTime ? styles.nightTime : styles.dayTime]}>
                  {item.icon}
                </View>
              </View>
              <View>
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipDescription}>{item.description}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 5,
    fontFamily: "Poppins"
  },
  header: {
    marginBottom: 16,
    fontFamily: "Poppins"
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: "Poppins"
  },
  subTitle: {
    color: '#A0AEC0',
    fontFamily: "Poppins"
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    fontFamily: "Poppins"
  },
  locationText: {
    marginLeft: 8,
    color: '#A0AEC0',
    fontFamily: "Poppins"
  },
  icon: {
    color: '#A0AEC0',
    fontFamily: "Poppins"
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    fontFamily: "Poppins"
  },
  categoryButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
    fontFamily: "Poppins"
  },
  activeCategoryButton: {
    backgroundColor: '#E53E3E',
    fontFamily: "Poppins"
  },
  categoryText: {
    color: '#A0AEC0',
    fontFamily: "Poppins"
  },
  activeCategoryText: {
    color: 'white',
    fontFamily: "Poppins"
  },
  tipCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
    fontFamily: "Poppins"
  },
  tipContent: {
    flexDirection: 'row',
    fontFamily: "Poppins"
  },
  iconContainer: {
    marginRight: 16,
    fontFamily: "Poppins"
  },
  iconBackground: {
    padding: 8,
    borderRadius: 50,
    fontFamily: "Poppins"
  },
  nightTime: {
    backgroundColor: '#FEE2E2',
    fontFamily: "Poppins"
  },
  dayTime: {
    backgroundColor: '#E0E0E0',
    fontFamily: "Poppins"
  },
  tipTitle: {
    fontWeight: 'bold',
    fontFamily: "Poppins"
  },
  tipDescription: {
    color: '#6B7280',
    fontFamily: "Poppins"
  },
});


export default SafetyTips;