import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ToastManager, { Toast } from 'toastify-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator } from "react-native-paper";
import config from '../../../config';


interface User {
    _id: string;
    name: string;
}

interface Comment {
    _id: string;
    user: User;
    text: string;
    createdAt: string;
}

interface PostCardProps {
    post: Post;
    userId: string;
    handleLikes: (postId: string) => void;
    addComment: (postId: string, text: string) => void;
}

interface Post {
    _id: string;
    user: User;
    content: string;
    createdAt: string;
    likes: string[];
    comments: Comment[];
    category: string;
}

const CommunityPage = () => {
    const [posts, setPosts] = useState<any>([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [allEventData, setAllEventData] = useState<any>([]);

    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [eventTitle, setEventTitle] = useState("");
    const [eventDate, setEventDate] = useState<any>(new Date());
    const [eventTime, setEventTime] = useState<any>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [showPickerTime, setShowPickerTime] = useState<boolean>(false);
    const [eventLocation, setEventLocation] = useState("");
    const [postText, setPostText] = useState("");
    const [categoryText, setCategoryText] = useState("general");
    const [token, setToken] = useState<string>("");
    const [userId, setUserId] = useState<string>("");
    const [eventFlag, setEventFlag] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const categories = ["general", "tips", "alerts", "events"];
    const apiUrl = config.API_URL;



    useEffect(() => {
        const loadUserData = async () => {
            const storedToken = await AsyncStorage.getItem("@token");
            const storedUser = await AsyncStorage.getItem("@user");

            if (storedToken) {
                setToken(storedToken);
            }

            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUserId(userData?.id || "");
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        setFilteredPosts(
            posts?.filter((post: any) => {
                if (activeTab !== "all" && post.category !== activeTab) {
                    return false;
                }
                if (
                    searchQuery &&
                    !post.content.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                    return false;
                }
                return true;
            })
        );
    }, [posts, searchQuery, activeTab]);

    useEffect(() => {
        if (token) {
            fetchCommunityPosts();
            fetchAllEvents()
        }
    }, [refreshData, token]);

    const fetchCommunityPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/community`, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setPosts(response?.data);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            console.error(
                "Error fetching community posts:",
                error.response ? error.response.data : error.message
            );
            Toast.show({
                type: "error",
                text1: "Error fetching posts",
                text2: error.response?.data?.message || "Something went wrong!",
            });
        }
    };

    const fetchAllEvents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/api/events`, {
                headers: {
                    "x-auth-token": token,
                },
            });
            setAllEventData(response?.data);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            console.error(
                "Error fetching community events:",
                error.response ? error.response.data : error.message
            );
            Toast.show({
                type: "error",
                text1: "Error fetching events",
                text2: error.response?.data?.message || "Something went wrong!",
            });
        }
    };

    const createPost = async () => {
        setLoading(true);
        try {
            let res = await axios.post(
                `${apiUrl}/api/community`,
                {
                    content: postText || "",
                    category: categoryText || "",
                },
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );

            setLoading(false);
            setPostText("");
            setRefreshData(!refreshData);
            Toast.show({
                type: "success",
                text1: "Post created!",
            });
        } catch (error: any) {
            setLoading(false);
            Toast.show({
                type: "error",
                text1: "Error creating post",
                text2: error.response?.data?.message || "Something went wrong!",
            });
        }
    };

    const resetValues = () => {
        setEventDate("")
        setEventTitle("")
        setEventTime("")
        setEventLocation("")
        setEventFlag(false)
    }

    const createEvent = async () => {
        setLoading(true);
        try {
            let res = await axios.post(
                `${apiUrl}/api/events`,
                {
                    title: eventTitle || "",
                    date: eventDate || "",
                    time: eventTime || "",
                    location: eventLocation || "",
                },
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );

            setLoading(false);
            resetValues()
            setRefreshData(!refreshData);
            Toast.show({
                type: "success",
                text1: "Event created!",
            });
        } catch (error: any) {
            setLoading(false);
            Toast.show({
                type: "error",
                text1: "Error creating event",
                text2: error.response?.data?.message || "Something went wrong!",
            });
        }
    };

    const addComment = async (postId: string, text: string) => {
        if (!text.trim()) {
            Toast.show({
                type: "error",
                text1: "Comment cannot be empty",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${apiUrl}/api/community/${postId}/comment`,
                { text },
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );
            setLoading(false);
            setRefreshData(!refreshData);
            Toast.show({
                type: "success",
                text1: "Comment added!",
            });
        } catch (error: any) {
            setLoading(false);
            console.error(
                "Error adding comment:",
                error.response ? error.response.data : error.message
            );
            Toast.show({
                type: "error",
                text1: "Error adding comment",
                text2: error.response?.data?.message || "Something went wrong!",
            });
        }
    };

    const handleLikes = async (postId: string) => {
        setLoading(true);
        try {
            const response = await axios.put(
                `${apiUrl}/api/community/${postId}/like`,
                {},
                {
                    headers: {
                        "x-auth-token": token,
                    },
                }
            );

            setPosts(
                posts.map((post: any) => (post._id === postId ? response.data : post))
            );
            setLoading(false);
            setRefreshData(!refreshData);
        } catch (error: any) {
            setLoading(false);
            console.error(
                "Error toggling like on post:",
                error.response ? error.response.data : error.message
            );
            Toast.show({
                type: "error",
                text1: "Error liking post",
                text2: error.response?.data?.message || "Something went wrong!",
            });
        }
    };

    const PostCard = ({ post, userId, handleLikes, addComment }: PostCardProps) => {
        const [commentText, setCommentText] = useState("");
        const [isAddingComment, setIsAddingComment] = useState(false);
        return (
            <View style={styles.card}>
                <View style={styles.postHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{post?.user?.name?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{post.user.name?.toUpperCase()}</Text>
                        <Text style={styles.timestamp}>
                            {new Date(post.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </Text>
                    </View>
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleLikes(post?._id)}
                    >
                        <Ionicons
                            name="heart"
                            size={16}
                            color={post?.likes?.includes(userId) ? "#4B006E" : "#4b5563"}
                        />
                        <Text
                            style={[
                                styles.actionText,
                                post?.likes?.includes(userId) && { color: "#4B006E" },
                            ]}
                        >
                            {post?.likes?.length}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            setIsAddingComment(!isAddingComment);
                        }}
                    >
                        <Ionicons name="chatbubble" size={16} color="#4b5563" />
                        <Text style={styles.actionText}>{post.comments.length}</Text>
                    </TouchableOpacity>
                </View>

                {isAddingComment && (
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            placeholder="Add a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            style={styles.commentInput}
                            multiline
                            autoFocus
                        />
                        <TouchableOpacity
                            style={styles.submitCommentButton}
                            onPress={() => {
                                if (commentText.trim()) {
                                    addComment(post._id, commentText);
                                    setCommentText("");
                                    setIsAddingComment(false);
                                } else {
                                    Toast.show({
                                        type: "error",
                                        text1: "Comment cannot be empty",
                                    });
                                }
                            }}
                        >
                            <Text style={styles.submitCommentButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {post.comments.map((comment: any) => (
                    <View key={comment._id} style={styles.commentContainer}>
                        <View style={styles.postHeader}>
                            <View style={styles.avatarComment}>
                                <Text style={styles.avatarCommentText}>{comment?.user?.name?.charAt(0)?.toUpperCase()}</Text>
                            </View>
                            <View>
                                <Text style={styles.userCommentName}>{comment?.user?.name?.toUpperCase()}</Text>
                                <Text style={styles.timestampComment}>
                                    {new Date(comment?.createdAt).toLocaleString(undefined, {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                ))}
            </View>
        )
    };


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.mainContent}>
                <View style={styles.leftColumn}>
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Community Forum</Text>
                        <Text style={styles.sectionDescription}>
                            Connect with others, share experiences, and support each other
                        </Text>
                        <TextInput
                            placeholder="Share your thoughts, tips, or ask for advice..."
                            value={postText}
                            onChangeText={setPostText}
                            style={styles.textArea}
                            multiline
                        />
                        <Picker
                            selectedValue={categoryText}
                            onValueChange={(itemValue: any) => setCategoryText(itemValue)}
                            style={styles.picker}
                        >
                            {categories.map((category) => (
                                <Picker.Item
                                    key={category}
                                    label={category?.toUpperCase()}
                                    value={category}
                                />
                            ))}
                        </Picker>
                        <TouchableOpacity
                            style={styles.createPostButton}
                            onPress={createPost}
                        >
                            <Ionicons name="add" size={16} color="#fff" style={styles.iconMr2} />
                            <Text style={styles.createPostButtonText}>Create Post</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchFilterContainer}>
                        <View style={styles.searchInputContainer}>
                            <Ionicons
                                name="search"
                                size={16}
                                color="#4B006E"
                                style={styles.searchIcon}
                            />
                            <TextInput
                                placeholder="Search posts..."
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity style={styles.filterButton}>
                            <Ionicons name="filter" size={16} color="#4B006E" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabContainer}>
                        <View style={{
                            display: "flex",
                            flexDirection: "row",
                            overflowX: "auto"
                        }}>
                            <TouchableOpacity
                                onPress={() => setActiveTab("all")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "all" && styles.activeTabButton,
                                ]}
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
                                onPress={() => setActiveTab("tips")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "tips" && styles.activeTabButton,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        activeTab === "tips" && styles.activeTabButtonText,
                                    ]}
                                >
                                    Tips
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab("alerts")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "alerts" && styles.activeTabButton,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        activeTab === "alerts" && styles.activeTabButtonText,
                                    ]}
                                >
                                    Alerts
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab("events")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "events" && styles.activeTabButton,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        activeTab === "events" && styles.activeTabButtonText,
                                    ]}
                                >
                                    Events
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setActiveTab("general")}
                                style={[
                                    styles.tabButton,
                                    activeTab === "general" && styles.activeTabButton,
                                ]}
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
                        </View>

                    </View>


                    {loading ? (
                        <ActivityIndicator size="large" color="#dc2626" />
                    ) : filteredPosts?.length > 0 ? (
                        <FlatList
                            data={filteredPosts}
                            renderItem={({ item }) => <PostCard
                                post={item}
                                userId={userId}
                                handleLikes={handleLikes}
                                addComment={addComment}
                            />}
                            keyExtractor={(item: any) => item?._id}
                        />
                    ) : (
                        <View style={styles.noPostsContainer}>
                            <Ionicons name="alert-circle" size={40} color="#9ca3af" />
                            <Text style={styles.noPostsTitle}>No posts found</Text>
                            <Text style={styles.noPostsText}>
                                Be the first to post in this category
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.rightColumn}>
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Community Guidelines</Text>
                        <View style={styles.guidelinesContainer}>
                            <View style={styles.guidelineItem}>
                                <Text style={styles.guidelineTitle}>Be Respectful</Text>
                                <Text style={styles.guidelineText}>
                                    Treat others with kindness and respect. No harassment or
                                    bullying.
                                </Text>
                            </View>
                            <View style={styles.guidelineItem}>
                                <Text style={styles.guidelineTitle}>Protect Privacy</Text>
                                <Text style={styles.guidelineText}>
                                    Do not share personal information about yourself or others.
                                </Text>
                            </View>
                            <View style={styles.guidelineItem}>
                                <Text style={styles.guidelineTitle}>Stay On Topic</Text>
                                <Text style={styles.guidelineText}>
                                    Keep discussions related to safety and support.
                                </Text>
                            </View>
                            <View style={styles.guidelineItem}>
                                <Text style={styles.guidelineTitle}>Report Concerns</Text>
                                <Text style={styles.guidelineText}>
                                    Flag inappropriate content or safety concerns.
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Upcoming Events</Text>
                        <View style={styles.eventsContainer}>
                            {
                                allEventData?.length > 0 ?
                                    allEventData?.map((event: any, index: number) => {
                                        return (
                                            <View key={index} style={styles.eventItem}>
                                                <Text style={styles.eventTitle}>{event?.title}</Text>
                                                <Text style={styles.eventDate}>
                                                    {new Date(event?.date).toLocaleString(undefined, {
                                                        dateStyle: "medium",
                                                        timeStyle: "short",
                                                    })}
                                                </Text>
                                                <Text style={styles.eventLocation}>
                                                    {event?.location}
                                                </Text>
                                            </View>
                                        )
                                    })
                                    :
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: "bold",
                                        marginVertical: 40
                                    }}>
                                        No Event Found!
                                    </Text>
                            }

                            <TouchableOpacity
                                onPress={() => {
                                    setEventFlag(!eventFlag)
                                }}
                                style={styles.createEventButton}>
                                <Ionicons
                                    name="add"
                                    size={16}
                                    color="#fff"
                                    style={styles.iconMr2}
                                />
                                <Text style={styles.createEventButtonText}>Create Event</Text>
                            </TouchableOpacity>
                            {eventFlag &&
                                <View style={styles.commentInputContainer}>
                                    <TextInput
                                        placeholder="Add Title"
                                        value={eventTitle}
                                        onChangeText={setEventTitle}
                                        style={styles.commentInput}
                                        multiline
                                    />
                                    <TextInput
                                        placeholder="Add Date/Time"
                                        value={eventDate.toLocaleDateString()}
                                        onPress={() => setShowPicker(true)}
                                        style={styles.commentInput}
                                        multiline
                                    />
                                    {showPicker &&
                                        <DateTimePicker
                                            value={eventDate}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate === undefined) {
                                                    setShowPicker(false);
                                                    return;
                                                }
                                                console.log("date--", selectedDate)
                                                const currentDate = selectedDate || eventDate;
                                                setEventDate(currentDate);
                                                setShowPicker(false);
                                            }}
                                        />}
                                    <TextInput
                                        placeholder="Add Time"
                                        value={eventDate.toLocaleTimeString()}
                                        onPress={() => setShowPickerTime(true)}
                                        style={styles.commentInput}
                                        multiline
                                    />
                                    {showPickerTime &&
                                        <DateTimePicker
                                            value={eventTime}
                                            mode="time"
                                            is24Hour={true}
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate === undefined) {
                                                    setShowPickerTime(false);
                                                    return;
                                                }
                                                console.log("time--", selectedDate)
                                                const currentDate = selectedDate || eventTime;
                                                setEventTime(currentDate);
                                                setShowPickerTime(false);
                                            }}
                                        />}
                                    <TextInput
                                        placeholder="Add Location"
                                        value={eventLocation}
                                        onChangeText={setEventLocation}
                                        style={styles.commentInput}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={styles.submitCommentButton}
                                        onPress={() => {
                                            createEvent()
                                        }}
                                    >
                                        <Text style={styles.submitCommentButtonText}>Submit</Text>
                                    </TouchableOpacity>
                                </View>}
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Safety Resources</Text>
                        <View style={styles.resourcesContainer}>
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceTitle}>Pakistan Helpline</Text>
                                <Text style={styles.resourceText}>
                                    24/7 Support: 1099
                                </Text>
                            </View>
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceTitle}>
                                    Local Police Department
                                </Text>
                                <Text style={styles.resourceText}>
                                    Non-emergency: 15
                                </Text>
                            </View>
                            <View style={styles.resourceItem}>
                                <Text style={styles.resourceTitle}>Crisis Helpline</Text>
                                <Text style={styles.resourceText}>Call: 0800-0011</Text>
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
        // backgroundColor: '#222831',
        // opacity: 0.7,
        fontFamily: "Poppins",
    },
    mainContent: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins"
    },
    leftColumn: {
        flex: 1,
        flexDirection: "column",
        marginRight: 0,
        fontFamily: "Poppins"
    },
    rightColumn: {
        flex: 1,
        marginTop: 24,
        fontFamily: "Poppins"
    },
    sectionCard: {
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        // elevation: 1,
        padding: 24,
        marginBottom: 24,
        fontFamily: "Poppins",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        fontFamily: "Poppins",
    },
    sectionDescription: {
        color: "#6b7280",
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    textArea: {
        width: "100%",
        minHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderColor: "#222831",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 16,
        textAlignVertical: "top",
        fontFamily: "Poppins"
    },
    picker: {
        width: "100%",
        borderColor: "#222831",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 16,
        paddingVertical: 6,
        paddingHorizontal: 8,
        fontFamily: "Poppins"
    },
    createPostButton: {
        backgroundColor: "#4B006E",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-end",
        fontFamily: "Poppins"
    },
    createPostButtonText: {
        color: "#FBFBFB",
        fontWeight: "bold",
        fontSize: 14,
        fontFamily: "Poppins"
    },
    iconMr2: {
        marginRight: 8,
        fontFamily: "Poppins"
    },
    searchFilterContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    searchInputContainer: {
        flex: 1,
        position: "relative",
        fontFamily: "Poppins",
    },
    searchIcon: {
        position: "absolute",
        left: 8,
        top: 10,
        fontFamily: "Poppins"
    },
    searchInput: {
        color: "#4B006E",
        width: "100%",
        paddingLeft: 32,
        paddingRight: 12,
        paddingVertical: 10,
        borderColor: "#4B006E",
        borderWidth: 1,
        borderRadius: 6,
        fontFamily: "Poppins"
    },
    filterButton: {
        padding: 8,
        borderColor: "#4B006E",
        borderWidth: 1,
        borderRadius: 6,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontFamily: "Poppins"
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "black",
        fontFamily: "Poppins"
    },
    activeTabButton: {
        borderBottomWidth: 2,
        borderBottomColor: "#4B006E",
        fontFamily: "Poppins",
    },
    activeTabButtonText: {
        color: "black",
        fontFamily: "Poppins"
    },
    card: {
        flexGrow: 1,
        // height: 300,
        // overflowY: "auto",
        backgroundColor: "#FBFBFB",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        // elevation: 1,
        marginBottom: 16,
        padding: 24,
        // borderColor: "#9AA6B2",
        // borderWidth: 0.1,
        fontFamily: "Poppins"
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
        fontFamily: "Poppins"
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        fontFamily: "Poppins"
    },
    avatarComment: {
        height: 30,
        width: 30,
        borderRadius: 20,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        fontFamily: "Poppins"
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    avatarCommentText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    userName: {
        fontWeight: "500",
        fontSize: 16,
        fontFamily: "Poppins"
    },
    userCommentName: {
        fontWeight: "500",
        fontSize: 13,
        fontFamily: "Poppins"
    },
    timestamp: {
        fontSize: 12,
        color: "#6b7280",
        fontFamily: "Poppins"
    },
    timestampComment: {
        fontSize: 10,
        color: "#6b7280",
        fontFamily: "Poppins"
    },
    postContent: {
        marginBottom: 16,
        fontFamily: "Poppins"
    },
    postActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 12,
        fontFamily: "Poppins"
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 16,
        fontFamily: "Poppins"
    },
    actionText: {
        marginLeft: 4,
        fontSize: 14,
        color: "#6b7280",
        fontFamily: "Poppins"
    },
    commentInputContainer: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 16,
        fontFamily: "Poppins"
    },
    commentInput: {
        width: "100%",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderColor: "#222831",
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: 8,
        textAlignVertical: "top",
        fontFamily: "Poppins"
    },
    submitCommentButton: {
        backgroundColor: "#4B006E",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignSelf: "flex-start",
        fontFamily: "Poppins"
    },
    submitCommentButtonText: {
        color: "#FBFBFB",
        fontWeight: "bold",
        fontSize: 14,
        fontFamily: "Poppins"
    },
    commentContainer: {
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        fontFamily: "Poppins"
    },
    commentUser: {
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 2,
        fontFamily: "Poppins"
    },
    commentText: {
        fontSize: 13,
        color: "#374151",
        fontFamily: "Poppins"
    },
    noPostsContainer: {
        textAlign: "center",
        paddingVertical: 40,
        backgroundColor: "#FBFBFB",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        // elevation: 1,
        alignItems: "center",
        justifyContent: "center",
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
    guidelinesContainer: {
    },
    guidelineItem: {
        marginBottom: 12,
        fontFamily: "Poppins"
    },
    guidelineTitle: {
        fontWeight: "500",
        marginBottom: 4,
        fontFamily: "Poppins"
    },
    guidelineText: {
        fontSize: 14,
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    eventsContainer: {
    },
    eventItem: {
        borderWidth: 1,
        borderColor: "#222831",
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        fontFamily: "Poppins"
    },
    eventTitle: {
        fontWeight: "500",
        fontFamily: "Poppins"
    },
    eventDate: {
        fontSize: 14,
        color: "#4b5563",
        marginBottom: 4,
        fontFamily: "Poppins"
    },
    eventLocation: {
        fontSize: 14,
        marginBottom: 12,
        fontFamily: "Poppins"
    },
    viewDetailsButton: {
        width: "100%",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#222831",
        borderRadius: 6,
        alignItems: "center",
        fontFamily: "Poppins"
    },
    viewDetailsButtonText: {
        fontSize: 14,
        fontFamily: "Poppins"
    },
    createEventButton: {
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "#4B006E",
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins"
    },
    createEventButtonText: {
        color: "#FBFBFB",
        fontWeight: "bold",
        fontFamily: "Poppins"
    },
    resourcesContainer: {
    },
    resourceItem: {
        borderWidth: 1,
        borderColor: "#222831",
        borderRadius: 6,
        padding: 12,
        marginBottom: 12,
        fontFamily: "Poppins"
    },
    resourceTitle: {
        fontWeight: "500",
        fontFamily: "Poppins"
    },
    resourceText: {
        fontSize: 14,
        color: "#4b5563",
        fontFamily: "Poppins"
    },
    viewAllResourcesButton: {
        width: "100%",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#222831",
        borderRadius: 6,
        alignItems: "center",
        fontFamily: "Poppins"
    },
    viewAllResourcesButtonText: {
        fontSize: 14,
        fontFamily: "Poppins"
    },
});

export default CommunityPage;