import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from '../config';
import { ScrollView } from "react-native-gesture-handler";

const ChatbotInterface = () => {
  const [messages, setMessages] = useState<any>([
    {
      id: "1",
      content: "Hello! I'm your AI safety assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const [token, setToken] = useState<string>("");
  const apiUrl = config.API_URL;


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
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev: any) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    fetchBotResponse(input);
  };

  const fetchBotResponse = async (userInput: string) => {
    try {
      let response = await axios.post(
        `${apiUrl}/api/openAI`,
        {
          prompt: userInput
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      console.log("response", response)
      const botMessage = {
        id: Date.now().toString(),
        content: response?.data?.reasoning,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev: any) => [...prev, botMessage]);
      setIsTyping(false);

    } catch (error) {
      console.error("Error fetching bot response:", error);
      setIsTyping(false);
      setMessages((prev: any) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I couldn't process that. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Safety Assistant</Text>
        <Text style={styles.subTitle}>Get real-time guidance and support for any safety concerns</Text>
      </View>
      <ScrollView style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageContainer, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
              <View style={styles.messageContent}>
                {item.sender === "bot" && (
                  <View style={styles.avatar}>
                    <Ionicons name="tv-sharp" size={20} />
                  </View>
                )}
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>{item.content}</Text>
                  <Text style={styles.timestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                {item.sender === "user" && (
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={20} />
                  </View>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.avatar}>
              <Ionicons name="tv-sharp" size={20} />
            </View>
            <Text style={styles.typingText}>Typing...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your message..."
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    height: 600,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    //   elevation: 5,
    fontFamily: "Poppins"
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  messagesContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    fontFamily: "Poppins"
  },
  messageContainer: {
    marginBottom: 8,
    fontFamily: "Poppins"
  },
  userMessage: {
    alignItems: 'flex-end',
    fontFamily: "Poppins"
  },
  botMessage: {
    alignItems: 'flex-start',
    fontFamily: "Poppins"
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontFamily: "Poppins"
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginLeft: 10,
    marginRight: 10,
    fontFamily: "Poppins"
  },
  messageText: {
    color: '#333',
    fontFamily: "Poppins"
  },
  timestamp: {
    fontSize: 10,
    color: '#A0AEC0',
    marginTop: 4,
    fontFamily: "Poppins"
  },
  avatar: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    fontFamily: "Poppins"
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    fontFamily: "Poppins"
  },
  typingText: {
    marginLeft: 8,
    color: '#A0AEC0',
    fontFamily: "Poppins"
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    fontFamily: "Poppins"
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginHorizontal: 8,
    fontFamily: "Poppins"
  },
  sendButton: {
    backgroundColor: '#4B006E',
    padding: 10,
    borderRadius: 8,
    fontFamily: "Poppins"
  },
  micButton: {
    padding: 8,
    fontFamily: "Poppins"
  },
});


export default ChatbotInterface;
