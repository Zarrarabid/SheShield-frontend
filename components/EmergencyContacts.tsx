import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from "react-native";
import ToastManager, { Toast } from 'toastify-react-native';
import axios from "axios";
import { ActivityIndicator } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from '../config';


const EmergencyContacts = ({ token }: any) => {
    const [contacts, setContacts] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [newContact, setNewContact] = useState<any>({
        name: "",
        email: "",
        phone: "",
        relationship: "",
        contactId: "",
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const apiUrl = config.API_URL;


    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiUrl}/api/contacts`, {
                    headers: {
                        "x-auth-token": token,
                    },
                });
                console.log("response", response)
                setContacts(response.data);
            } catch (error) {
                console.error("Error fetching contacts:", error);
                Toast.error("Failed to load contacts.");
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const handleNewContactChange = (field: string, value: string) => {
        setNewContact({ ...newContact, [field]: value });
    };

    const handleAddContact = async () => {
        if (!newContact.name || !newContact.phone) {
            Toast.error("Please provide a name and phone number.");
            return;
        }

        const formData = {
            name: newContact.name,
            email: newContact.email,
            phone: newContact.phone,
            relationship: newContact.relationship || "",
        };

        try {
            const response = await axios.post(
                `${apiUrl}/api/contacts/`,
                formData,
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );
            setContacts([...contacts, response.data]);
            Toast.success(`${newContact.name} has been added to your emergency contacts.`);
            setNewContact({ name: "", email: "", phone: "", relationship: "" });
            setShowAddForm(false);
        } catch (error) {
            console.error("Error Adding:", error);
            Toast.error("Error Adding Contact");
        }
    };

    const handleDeleteContact = async (id: string) => {
        try {
            await axios.delete(`${apiUrl}/api/contacts/${id}`, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setContacts(contacts.filter((contact: any) => contact._id !== id));
            Toast.success("The contact has been removed from your emergency contacts.");
        } catch (error) {
            console.error("Error deleting contact:", error);
            Toast.error("Failed to delete contact.");
        }
    };

    const handleSaveContact = async (id: string) => {
        const updatedFields = {
            name: newContact.name,
            email: newContact.email,
            phone: newContact.phone,
            relationship: newContact.relationship,
        };

        try {
            const response = await axios.put(`${apiUrl}/api/contacts/${id}`, updatedFields, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setContacts(
                contacts.map((contact: any) => (contact._id === id ? response.data : contact))
            );
            Toast.success("The contact information has been updated.");
            setNewContact({ name: "", email: "", phone: "", relationship: "", contactId: "" });
        } catch (error) {
            console.error("Error updating contact:", error);
            Toast.error("Failed to update contact.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Emergency Contacts</Text>
                <Text style={styles.subTitle}>Manage contacts who will be notified in case of emergency</Text>
            </View>
            {!loading ? (
                <View>
                    <FlatList
                        data={contacts}
                        keyExtractor={(item: any) => item._id}
                        renderItem={({ item }: any) => (
                            <View style={styles.contactCard}>
                                {newContact.contactId === item._id ? (
                                    <View style={styles.editForm}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Name"
                                            value={newContact.name}
                                            onChangeText={(value) => handleNewContactChange("name", value)}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Phone"
                                            value={newContact.phone}
                                            onChangeText={(value) => handleNewContactChange("phone", value)}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
                                            value={newContact.email}
                                            onChangeText={(value) => handleNewContactChange("email", value)}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Relationship"
                                            value={newContact.relationship}
                                            onChangeText={(value) => handleNewContactChange("relationship", value)}
                                        />
                                        <View style={styles.editButtons}>
                                            <TouchableOpacity
                                                style={styles.saveButton}
                                                onPress={() => handleSaveContact(newContact.contactId)}
                                            >
                                                <Ionicons name="save" size={16} color="white" />
                                                <Text style={styles.buttonText}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.cancelButton}
                                                onPress={() => setNewContact({ name: "", email: "", phone: "", relationship: "", contactId: "" })}
                                            >
                                                <Ionicons name="close" size={16} color="#4B006E" />
                                                <Text style={styles.buttonText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactName}>{item.name}</Text>
                                        <Text>{item.phone}</Text>
                                        <Text style={styles.relationship}>{item.relationship}</Text>
                                        <View style={styles.buttonsContainer}>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() => setNewContact({ ...item, contactId: item._id })}
                                            >
                                                <Ionicons name="pencil" size={16} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDeleteContact(item._id)}
                                            >
                                                <Ionicons name="trash" size={16} color="#4B006E" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    />
                    {showAddForm && (
                        <View style={styles.addContactForm}>
                            <Text style={styles.addContactTitle}>Add New Contact</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                value={newContact.name}
                                onChangeText={(value) => handleNewContactChange("name", value)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone"
                                value={newContact.phone}
                                onChangeText={(value) => handleNewContactChange("phone", value)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={newContact.email}
                                onChangeText={(value) => handleNewContactChange("email", value)}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Relationship (optional)"
                                value={newContact.relationship}
                                onChangeText={(value) => handleNewContactChange("relationship", value)}
                            />
                            <View style={styles.addButtons}>
                                <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                                    <Ionicons name="pencil" size={16} color="white" />
                                    <Text style={styles.buttonText}>Add Contact</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
                                    <Ionicons name="close" size={16} color="#4B006E" />
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {!showAddForm && (
                        <TouchableOpacity
                            style={styles.showAddButton}
                            onPress={() => {
                                setNewContact({ name: "", email: "", phone: "", relationship: "", contactId: "" });
                                setShowAddForm(true);
                            }}
                        >
                            <Ionicons name="add" size={16} color="white" />
                            <Text style={styles.buttonText}>Add Emergency Contact</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.footerText}>
                        Your emergency contacts will receive your location and alert when you activate the panic button.
                    </Text>
                </View>
            ) : (
                <ActivityIndicator size="large" color="#4B006E" />
            )}
            <ToastManager />
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
        //   elevation: 5,
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
    contactCard: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    editForm: {
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontFamily: "Poppins"
    },
    saveButton: {
        backgroundColor: '#4B006E',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: "Poppins",
        width: 80
    },
    cancelButton: {
        padding: 8,
        borderRadius: 8,
        fontFamily: "Poppins"
    },
    contactInfo: {
        flexDirection: 'column',
        fontFamily: "Poppins"
    },
    contactName: {
        fontWeight: 'bold',
        fontFamily: "Poppins"
    },
    relationship: {
        color: '#A0AEC0',
        fontFamily: "Poppins"
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        fontFamily: "Poppins"
    },
    editButton: {
        padding: 8,
        fontFamily: "Poppins"
    },
    deleteButton: {
        padding: 8,
        fontFamily: "Poppins"
    },
    addContactForm: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    addContactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: "Poppins"
    },
    addButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontFamily: "Poppins"
    },
    addButton: {
        backgroundColor: '#4B006E',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        fontFamily: "Poppins"
    },
    showAddButton: {
        backgroundColor: '#4B006E',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
        fontFamily: "Poppins"
    },
    buttonText: {
        color: 'white',
        marginLeft: 8,
        fontFamily: "Poppins"
    },
    footerText: {
        marginTop: 16,
        fontSize: 12,
        color: '#A0AEC0',
        fontFamily: "Poppins"
    },
});


export default EmergencyContacts;