import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useAuthSession } from "@/components/AuthProvider";

export default function TabsLayout() {
    const { signOut } = useAuthSession();
    //     violet: #7f00ff
    // purple: #4B006E
    // white: #FFFFFF

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "white",
                headerStyle: {
                    backgroundColor: "#4B006E"
                    // backgroundColor: "#222831"
                },
                headerShadowVisible: false,
                headerTintColor: "white",
                tabBarStyle: {
                    backgroundColor: "#4B006E"
                    // backgroundColor: "#222831"
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerTitle: "HomePage",
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "home-sharp" : "home-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    headerTitle: "Community",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "people-circle-sharp" : "people-circle-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            />
            {/* <Tabs.Screen
                name="about"
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    headerTitle: "About",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "information-circle-sharp" : "information-circle-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            /> */}
            <Tabs.Screen
                name="safetyPlan"
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    headerTitle: "Safety Plan",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "shield-checkmark-sharp" : "shield-checkmark-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    headerTitle: "Dashboard",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "card-sharp" : "card-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="Maps"
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    headerTitle: "Map View",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "map-sharp" : "map-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="safetyTips"
                options={{
                    headerRight: () => (
                        <TouchableOpacity onPress={() => {
                            signOut()
                        }}>
                            <Ionicons name="log-out" size={24} color="#fff" style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    ),
                    headerTitle: "My Safety Plan",
                    tabBarIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? "alert-circle-sharp" : "alert-circle-outline"}
                            size={20}
                            color={color}
                        />
                    )
                }}
            />
        </Tabs>
    );
}