import { useAuthSession } from "@/components/AuthProvider";
import React, { ReactNode, useState } from "react";
import { StyleSheet, View, Image, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import axios from 'axios';
import ToastManager, { Toast } from 'toastify-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../../config';


export default function Login(): ReactNode {
    const { signIn } = useAuthSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const apiUrl = config.API_URL;

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        let newFormData = {
            email: formData?.email,
            password: formData?.password
        }
        setIsLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/auth/login`, newFormData);
            Toast.success('Login successful!');
            signIn(response?.data?.token, response?.data?.user);
        } catch (error: any) {
            console.error('Login error:', error);
            Toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };
    const handleSubmitRegister = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${apiUrl}/api/auth/register`, formData);
            Toast.success("Account created successfully!")
            setIsRegistered(true)
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
            })
        } catch (error: any) {
            console.error("Registration error:", error);
            Toast.error(error.response?.data?.message || "Failed to register");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['#FFFFFF', '#FFFFFF']}
                style={styles.gradient}>
                <View style={styles.container}>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                    />
                    <View style={styles.mainTextContainer}>
                        <Text style={styles.mainText}>Welcome!</Text>
                        <Text style={styles.mainText}>To SheSafe</Text>
                    </View>
                    {isRegistered ?
                        <>
                            <TextInput
                                label="Email"
                                mode="flat"
                                value={formData?.email}
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => handleChange('email', text)}
                                right={<TextInput.Icon icon="email" color="#4B006E" />}
                            />
                            <TextInput
                                label="Password"
                                mode="flat"
                                value={formData?.password}
                                style={styles.input}
                                secureTextEntry
                                onChangeText={(text) => handleChange('password', text)}
                                right={<TextInput.Icon icon="lock" color="#4B006E" />}
                            />
                            <Button mode="contained" style={styles.button} onPress={handleSubmit} loading={isLoading}>
                                Login
                            </Button>
                            <View style={styles.row}>
                                <Text style={styles.msg}>Do not have an account ? </Text>
                                <TouchableOpacity onPress={() => {
                                    setFormData({
                                        name: "",
                                        email: "",
                                        phone: "",
                                        password: "",
                                    })
                                    setIsRegistered(false)
                                }}>
                                    <Text style={styles.link}>Sign up</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                        :
                        <>
                            <TextInput
                                label="Full Name"
                                mode="flat"
                                value={formData?.name}
                                style={styles.input}
                                autoCapitalize="none"
                                onChangeText={(text) => handleChange('name', text)}
                                right={<TextInput.Icon icon="account" color="#4B006E" />}
                            />
                            <TextInput
                                label="Email"
                                value={formData?.email}
                                mode="flat"
                                style={styles.input}
                                autoCapitalize="none"
                                onChangeText={(text) => handleChange('email', text)}
                                right={<TextInput.Icon icon="email" color="#4B006E" />}
                            />
                            <TextInput
                                label="Phone No"
                                mode="flat"
                                value={formData?.phone}
                                style={styles.input}
                                autoCapitalize="none"
                                onChangeText={(text) => handleChange('phone', text)}
                                right={<TextInput.Icon icon="phone" color="#4B006E" />}

                            />
                            <TextInput
                                label="Password"
                                mode="flat"
                                value={formData?.password}
                                style={styles.input}
                                secureTextEntry
                                onChangeText={(text) => handleChange('password', text)}
                                right={<TextInput.Icon icon="lock" color="#4B006E" />}
                            />
                            <Button mode="contained" style={styles.button} onPress={handleSubmitRegister} loading={isLoading}>
                                Register
                            </Button>
                            <View style={styles.row}>
                                <Text style={styles.msg}>Already have account ? </Text>
                                <TouchableOpacity onPress={() => {
                                    setFormData({
                                        name: "",
                                        email: "",
                                        phone: "",
                                        password: "",
                                    })
                                    setIsRegistered(true)
                                }}>
                                    <Text style={styles.link}>Sign in</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    }
                    <ToastManager />
                </View>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    mainTextContainer: {
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
        marginBottom: 20,
    },
    mainText: {
        fontSize: 30,
        textAlign: "center",
        color: "black",
        fontFamily: "Poppins"
    },
    msg: {
        color: "black",
        fontFamily: "Poppins"
    },
    row: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: "center",
    },
    link: {
        marginTop: 3,
        fontWeight: 'bold',
        color: "#7f00ff",
        fontFamily: "Poppins"
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        overflowY: "auto"
        // backgroundColor: '#f5f5f5',
    },
    logo: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        // marginBottom: 40,
    },
    input: {
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
        backgroundColor: "#4B006E"
    },
    footerText: {
        marginTop: 20,
        alignSelf: 'center',
        color: '#6200ee',
    },
});