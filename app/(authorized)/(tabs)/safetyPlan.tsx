import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
    StyleSheet,
    Platform,
} from "react-native";
import axios from 'axios';
import ToastManager, { Toast } from 'toastify-react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import config from '../../../config';



const SafetyPlanPage = () => {
    const [safetyItems, setSafetyItems] = useState<any>([]);
    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        category: "general",
    });
    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshData, setRefreshData] = useState<boolean>(false);
    const [editingItemId, setEditingItemId] = useState("");
    const [token, setToken] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const baseUrl = config.API_URL;


    const API_URL = `${baseUrl}/api/safety-plan`;


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
        if (token) {
            getSafetyPlan();
        }

    }, [token, refreshData]);

    const getSafetyPlan = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${API_URL}`, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setSafetyItems(response?.data?.items || []);
            resetCompletedStates(response?.data?.items || []);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            Toast.show({
                type: "error",
                text1: "No Data Found.",
            });
        }
    };

    const resetCompletedStates = (items: any) => {
        const now: any = new Date();
        const updatedItems = items.map((item: any) => {
            const lastUpdated: any = new Date(item.updatedAt);
            const hoursDiff = Math.abs(now - lastUpdated) / 36e5;
            if (hoursDiff > 24) {
                return { ...item, completed: false }; // Reset toggle after 24 hours
            }
            return item;
        });
        setSafetyItems(updatedItems);
    };

    const calculateProgress = () => {
        const completedCount = safetyItems.filter((item: any) => item.completed).length;
        const totalCount = safetyItems.length;
        return totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    };

    const handleToggleComplete = async (itemId: any) => {
        const item: any = safetyItems.find((item: any) => item._id === itemId);
        if (item) {
            const updatedItem = {
                ...item,
                completed: !item.completed
            };
            try {
                setLoading(true)
                await axios.put(`${API_URL}/item/${item._id}`, updatedItem, {
                    headers: {
                        "x-auth-token": token,
                    },
                });
                setSafetyItems(safetyItems.map((item: any) => (item._id === itemId ? updatedItem : item)));
                Toast.show({
                    type: "success",
                    text1: updatedItem.completed ? "Item completed" : "Item marked as incomplete",
                });
                setLoading(false)
                setRefreshData(!refreshData)
            } catch (error) {
                setLoading(false)
                console.error("Error updating item:", error);
                Toast.show({
                    type: "error",
                    text1: "Failed to update item. Please try again.",
                });
            }
        }
    };

    const handleAddItem = async () => {
        if (!newItem.title) {
            Toast.show({
                type: "error",
                text1: "Please provide a title for the safety item.",
            });
            return;
        }

        const item = {
            id: Date.now().toString(),
            title: newItem.title,
            description: newItem.description || "",
            completed: false,
            category: newItem.category || "general",
        };

        try {
            setLoading(true)
            const response = await axios.post(API_URL, { items: [...safetyItems, item] }, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setSafetyItems(response.data.items);
            setNewItem({ title: "", description: "", category: "general" });
            setShowAddForm(false);

            Toast.show({
                type: "success",
                text1: `"${item.title}" has been added to your safety plan.`,
            });
            setLoading(false)
            setRefreshData(!refreshData)
        } catch (error) {
            setLoading(false)
            console.error("Error adding item:", error);
            Toast.show({
                type: "error",
                text1: "Failed to add item. Please try again.",
            });
        }
    };

    const handleDeleteItem = async (itemId: any) => {
        setLoading(true)
        try {
            await axios.delete(`${API_URL}/item/${itemId}`, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setSafetyItems(safetyItems.filter((item: any) => item.id !== itemId));

            Toast.show({
                type: "success",
                text1: `Item has been removed from your safety plan.`,
            });
            setLoading(false)
            setRefreshData(!refreshData)
        } catch (error) {
            setLoading(false)
            console.error("Error deleting item:", error);
            Toast.show({
                type: "error",
                text1: "Failed to delete item. Please try again.",
            });
        }
    };

    const handleEditItem = (itemId: any) => {
        console.log(safetyItems, "item", itemId)
        setEditingItemId(itemId);
        const item = safetyItems.find((item: any) => item._id === itemId);
        if (item) {
            setNewItem({
                title: item.title,
                description: item.description,
                category: item.category,
            });
            setShowAddForm(true);
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItemId || !newItem.title) return;

        const updatedItem = {
            ...safetyItems.find((item: any) => item._id === editingItemId),
            title: newItem.title,
            description: newItem.description || "",
            category: newItem.category || "general",
        };

        try {
            setLoading(true)
            await axios.put(`${API_URL}/item/${editingItemId}`, updatedItem, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setSafetyItems(safetyItems.map((item: any) => (item._id === editingItemId ? updatedItem : item)));

            setNewItem({ title: "", description: "", category: "general" });
            setShowAddForm(false);
            setEditingItemId("");

            Toast.show({
                type: "success",
                text1: "Your safety plan has been updated.",
            });
            setLoading(false)
            setRefreshData(!refreshData)
        } catch (error) {
            setLoading(false)
            console.error("Error updating item:", error);
            Toast.show({
                type: "error",
                text1: "Failed to update item. Please try again.",
            });
        }
    };

    const progressPercentage = calculateProgress();
    const filteredItems = safetyItems.filter((item: any) => {
        return activeTab === "all" || item.category === activeTab;
    });

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.mainContent}>
                <View style={styles.gridContainer}>
                    <View style={styles.mainColumn}>
                        <View style={styles.card}>
                            <View style={{ marginVertical: 10 }}>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => {
                                        setShowAddForm(true);
                                        setEditingItemId("");
                                        setNewItem({ title: "", description: "", category: "general" });
                                    }}
                                >
                                    <Ionicons name="add" size={16} color="#fff" />
                                    <Text style={styles.addButtonText}>Add Item</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.planTitle}>
                                        <Ionicons name="file-tray" size={20} color="#4B006E" /> My Safety Plan
                                    </Text>
                                    <Text style={styles.planSubtitle}>
                                        Personalized safety measures based on your preferences and routines
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <Text style={styles.progressBarText}>Progress: {progressPercentage.toFixed(0)}%</Text>
                                <View style={styles.progressBarBackground}>
                                    <View
                                        style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                                    ></View>
                                </View>
                            </View>
                            <View style={styles.tabContainer}>
                                <View style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    overflowX: "auto"
                                }}>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab("all")}
                                        style={[styles.tabButton, activeTab === "all" && styles.activeTab]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabButtonText,
                                                activeTab === "all" && styles.activeTabButtonText,
                                            ]}
                                        >
                                            All
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab("general")}
                                        style={[styles.tabButton, activeTab === "general" && styles.activeTab]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabButtonText,
                                                activeTab === "general" && styles.activeTabButtonText,
                                            ]}
                                        >
                                            General
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab("home")}
                                        style={[styles.tabButton, activeTab === "home" && styles.activeTab]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabButtonText,
                                                activeTab === "home" && styles.activeTabButtonText,
                                            ]}
                                        >
                                            Home
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab("work")}
                                        style={[styles.tabButton, activeTab === "work" && styles.activeTab]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabButtonText,
                                                activeTab === "work" && styles.activeTabButtonText,
                                            ]}
                                        >
                                            Work
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab("travel")}
                                        style={[styles.tabButton, activeTab === "travel" && styles.activeTab]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabButtonText,
                                                activeTab === "travel" && styles.activeTabButtonText,
                                            ]}
                                        >
                                            Travel
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab("social")}
                                        style={[styles.tabButton, activeTab === "social" && styles.activeTab]}
                                    >
                                        <Text
                                            style={[
                                                styles.tabButtonText,
                                                activeTab === "social" && styles.activeTabButtonText,
                                            ]}
                                        >
                                            Social
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {showAddForm && (
                                <View style={styles.addFormContainer}>
                                    <Text style={styles.addFormTitle}>
                                        {editingItemId ? "Edit Safety Item" : "Add New Safety Item"}
                                    </Text>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>Title</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter a title for this safety measure"
                                            value={newItem.title}
                                            onChangeText={(text) => setNewItem({ ...newItem, title: text })}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>Description (Optional)</Text>
                                        <TextInput
                                            style={styles.textAreaInput}
                                            placeholder="Add details about this safety measure"
                                            value={newItem.description}
                                            onChangeText={(text) => setNewItem({ ...newItem, description: text })}
                                            multiline
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>Category</Text>
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={newItem.category}
                                                onValueChange={(itemValue) => setNewItem({ ...newItem, category: itemValue })}
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="General" value="general" />
                                                <Picker.Item label="Home" value="home" />
                                                <Picker.Item label="Work" value="work" />
                                                <Picker.Item label="Travel" value="travel" />
                                                <Picker.Item label="Social" value="social" />
                                            </Picker>
                                        </View>
                                    </View>
                                    <View style={styles.formActions}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
                                            <Text>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={editingItemId ? handleUpdateItem : handleAddItem}
                                            disabled={!newItem.title}
                                        >
                                            <Ionicons name="save" size={16} color="#fff" />
                                            <Text style={styles.saveButtonText}>
                                                {editingItemId ? "Update Item" : "Add Item"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            {
                                loading ? (
                                    <ActivityIndicator size="large" color="#4B006E" />
                                ) :
                                    (filteredItems?.length > 0 ?
                                        filteredItems.map((item: any) => (
                                            <View key={item._id} style={styles.safetyItem}>
                                                <View style={styles.safetyItemToggle}>
                                                    <Switch
                                                        trackColor={{ false: "grey", true: "#4B006E" }}
                                                        thumbColor={item.completed ? "#f8fafc" : "#f4f4f5"}
                                                        ios_backgroundColor="#d1d5db"
                                                        onValueChange={() => handleToggleComplete(item._id)}
                                                        value={item.completed}
                                                    />
                                                </View>
                                                <View style={styles.safetyItemDetails}>
                                                    <Text style={[styles.safetyItemTitle, item.completed && styles.completedText]}>{item.title}</Text>
                                                    {item.description && (
                                                        <Text
                                                            style={[
                                                                styles.safetyItemDescription,
                                                                item.completed && styles.completedDescription,
                                                            ]}
                                                        >
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                <View style={styles.safetyItemActions}>
                                                    <TouchableOpacity
                                                        style={styles.actionButton}
                                                        onPress={() => handleEditItem(item._id)}>
                                                        <Ionicons name="pencil" size={16} color="#4B006E" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.actionButton, styles.deleteButton]}
                                                        onPress={() => handleDeleteItem(item._id)}>
                                                        <Ionicons name="trash" size={16} color="#4B006E" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))
                                        :
                                        <View style={styles.noPostsContainer}>
                                            <Ionicons name="alert-circle" size={40} color="#9ca3af" />
                                            <Text style={styles.noPostsTitle}>No Plan found</Text>
                                            <Text style={styles.noPostsText}>
                                                Be the first to add Plan in this category
                                            </Text>
                                        </View>)
                            }

                        </View>
                        <View style={styles.sideColumn}>
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Safety Categories</Text>
                                <View style={styles.categoryList}>
                                    <View style={styles.categoryItem}>
                                        <View style={styles.categoryIconContainer}>
                                            <Ionicons name="home" size={20} color="#4B006E" />
                                        </View>
                                        <View>
                                            <Text style={styles.categoryTitle}>Home Safety</Text>
                                            <Text style={styles.categorySubtitle}>Secure your living space</Text>
                                        </View>
                                    </View>
                                    <View style={styles.categoryItem}>
                                        <View style={styles.categoryIconContainer}>
                                            <Ionicons name="briefcase" size={20} color="#4B006E" />
                                        </View>
                                        <View>
                                            <Text style={styles.categoryTitle}>Work Safety</Text>
                                            <Text style={styles.categorySubtitle}>Stay safe at your workplace</Text>
                                        </View>
                                    </View>
                                    <View style={styles.categoryItem}>
                                        <View style={styles.categoryIconContainer}>
                                            <Ionicons name="car" size={20} color="#4B006E" />
                                        </View>
                                        <View>
                                            <Text style={styles.categoryTitle}>Travel Safety</Text>
                                            <Text style={styles.categorySubtitle}>Protect yourself while commuting</Text>
                                        </View>
                                    </View>
                                    <View style={styles.categoryItem}>
                                        <View style={styles.categoryIconContainer}>
                                            <Ionicons name="person" size={20} color="#4B006E" />
                                        </View>
                                        <View>
                                            <Text style={styles.categoryTitle}>Social Safety</Text>
                                            <Text style={styles.categorySubtitle}>Stay safe in social situations</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Safety Recommendations</Text>
                                <View style={styles.recommendationList}>
                                    <Text style={styles.recommendationText}>
                                        Based on your profile and location, we recommend these additional safety measures:
                                    </Text>
                                    <View style={styles.recommendationItem}>
                                        <Text style={styles.recommendationItemTitle}>Install motion-sensor lights</Text>
                                        <Text style={styles.recommendationItemSubtitle}>
                                            Enhance visibility around your homes exterior
                                        </Text>

                                    </View>
                                    <View style={styles.recommendationItem}>
                                        <Text style={styles.recommendationItemTitle}>Set up emergency SOS on phone</Text>
                                        <Text style={styles.recommendationItemSubtitle}>
                                            Configure quick emergency access on your device
                                        </Text>

                                    </View>
                                    <View style={styles.recommendationItem}>
                                        <Text style={styles.recommendationItemTitle}>Join neighborhood watch group</Text>
                                        <Text style={styles.recommendationItemSubtitle}>
                                            Connect with local safety initiatives
                                        </Text>

                                    </View>
                                </View>
                            </View>

                        </View>
                    </View>
                </View>
            </ScrollView>
            <ToastManager />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
        //   backgroundColor: '#222831',
        //   opacity: 0.7,
        fontFamily: "Poppins"
    },
    noPostsTitle: {
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 4,
        fontFamily: "Poppins"
    },
    noPostsText: {
        color: "#6b7280",
        fontFamily: "Poppins"
    },
    noPostsContainer: {
        textAlign: "center",
        paddingVertical: 40,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins"
    },
    header: {
        backgroundColor: "#ffffff",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins"
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        fontFamily: "Poppins"
    },
    mainContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        fontFamily: "Poppins"
    },
    gridContainer: {
        flexDirection: Platform.OS === "web" ? "row" : "column",
        gap: 24,
        fontFamily: "Poppins"
    },
    mainColumn: {
        flex: Platform.OS === "web" ? 2 : 1,
        gap: 24,
        fontFamily: "Poppins"
    },
    sideColumn: {
        flex: 1,
        gap: 24,
        fontFamily: "Poppins"
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        //   elevation: 2, // shadow
        padding: 24,
        fontFamily: "Poppins"
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    planTitle: {
        fontSize: 20,
        fontWeight: "bold",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        fontFamily: "Poppins"
    },
    planSubtitle: {
        color: "#6b7280",
        fontFamily: "Poppins"
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4B006E",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    addButtonText: {
        color: "#ffffff",
        marginLeft: 8,
        fontFamily: "Poppins"
    },
    progressBarContainer: {
        marginBottom: 24,
        fontFamily: "Poppins"
    },
    progressBarTextRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    progressBarText: {
        marginBottom: 6,
        fontSize: 14,
        fontWeight: "500",
        fontFamily: "Poppins"
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 9999,
        fontFamily: "Poppins"
    },
    progressBarFill: {
        height: 8,
        backgroundColor: "#4B006E",
        borderRadius: 9999,
        fontFamily: "Poppins"
    },
    addFormContainer: {
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#4B006E",
        borderRadius: 8,
        padding: 16,
        fontFamily: "Poppins"
    },
    addFormTitle: {
        fontWeight: "bold",
        fontSize: 18,
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    formGroup: {
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    formLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 4,
        fontFamily: "Poppins"
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: "100%",
        backgroundColor: "#ffffff",
        fontFamily: "Poppins"
    },
    textAreaInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: "100%",
        minHeight: 80,
        textAlignVertical: "top",
        backgroundColor: "#ffffff",
        fontFamily: "Poppins"
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        backgroundColor: "#ffffff",
        fontFamily: "Poppins"
    },
    picker: {
        height: 50,
        width: "100%",
        fontFamily: "Poppins"
    },
    formActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
        fontFamily: "Poppins"
    },
    cancelButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        backgroundColor: "#ffffff",
        fontFamily: "Poppins"
    },
    saveButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4B006E",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    saveButtonText: {
        color: "#ffffff",
        marginLeft: 8,
        fontFamily: "Poppins"
    },
    tabContainer: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
        fontFamily: "Poppins"
    },
    tabButton: {
        paddingHorizontal: 6,
        paddingVertical: 8,
        marginRight: 8,
        fontFamily: "Poppins"
    },
    tabButtonText: {
        fontWeight: "500",
        fontSize: 14,
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    activeTab: {
        borderBottomWidth: 2,
        borderColor: "#4B006E",
        fontFamily: "Poppins"
    },
    activeTabButtonText: {
        color: "#4B006E",
        fontFamily: "Poppins"
    },
    safetyItemsList: {
        gap: 16,
        fontFamily: "Poppins"
    },
    safetyItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    safetyItemToggle: {
        paddingTop: 2,
        fontFamily: "Poppins"
    },
    safetyItemDetails: {
        flex: 1,
        fontFamily: "Poppins"
    },
    safetyItemTitle: {
        fontWeight: "500",
        fontFamily: "Poppins"
    },
    completedText: {
        textDecorationLine: "line-through",
        color: "#6b7280",
        fontFamily: "Poppins"
    },
    safetyItemDescription: {
        fontSize: 14,
        marginTop: 4,
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    completedDescription: {
        color: "#9ca3af",
        fontFamily: "Poppins"
    },
    safetyItemActions: {
        flexDirection: "row",
        gap: 4,
        fontFamily: "Poppins"
    },
    actionButton: {
        padding: 4,
        borderRadius: 9999,
        backgroundColor: "#ffffff",
        fontFamily: "Poppins"
    },
    deleteButton: {
        backgroundColor: "#fef2f2",
        fontFamily: "Poppins"
    },
    noItemsContainer: {
        alignItems: "center",
        paddingVertical: 40,
        fontFamily: "Poppins"
    },
    noItemsIcon: {
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    noItemsTitle: {
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 4,
        fontFamily: "Poppins"
    },
    noItemsSubtitle: {
        color: "#6b7280",
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    addFirstItemButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4B006E",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    addFirstItemButtonText: {
        color: "#ffffff",
        marginLeft: 8,
        fontFamily: "Poppins"
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    categoryList: {
        gap: 16,
        fontFamily: "Poppins"
    },
    categoryItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    categoryIconContainer: {
        padding: 8,
        backgroundColor: "#F2F2F2",
        borderRadius: 9999,
        marginRight: 12,
        fontFamily: "Poppins"
    },
    categoryTitle: {
        fontWeight: "500",
        fontFamily: "Poppins"
    },
    categorySubtitle: {
        fontSize: 14,
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    recommendationList: {
        gap: 12,
        fontFamily: "Poppins"
    },
    recommendationText: {
        fontSize: 14,
        color: "#4b5563",
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    recommendationItem: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    recommendationItemTitle: {
        fontWeight: "500",
        fontFamily: "Poppins"
    },
    recommendationItemSubtitle: {
        fontSize: 14,
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    addToPlanButton: {
        marginTop: 8,
        width: "100%",
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        alignItems: "center",
        fontFamily: "Poppins"
    },
    addToPlanButtonText: {
        color: "#1f2937",
        fontFamily: "Poppins"
    },
    exportOptionsList: {
        gap: 12,
        fontFamily: "Poppins"
    },
    exportOptionsText: {
        fontSize: 14,
        color: "#4b5563",
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    exportButton: {
        width: "100%",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        fontFamily: "Poppins"
    },
    exportButtonIcon: {
        marginRight: 8,
        fontFamily: "Poppins"
    },
    exportButtonText: {
        textAlign: "left",
        color: "#1f2937",
        fontFamily: "Poppins"
    },
})


export default SafetyPlanPage;