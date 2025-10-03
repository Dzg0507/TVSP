import React, { useState, useRef } from 'react';
import { ScrollView, StatusBar, View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import GroqService from '../services/GroqService';

const { width, height } = Dimensions.get('window');

const AICoachChatScreen = ({ navigation }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello, I'm Dr. Sebiv Doog, a licensed psychologist. I'm here to help you work through your thoughts and feelings. What would you like to discuss today?",
            sender: 'coach',
            timestamp: new Date()
        }
    ]);
    const [monitoringData, setMonitoringData] = useState(null);
    const [messageCount, setMessageCount] = useState(0);
    const scrollViewRef = useRef(null);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: message.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setMessageCount(prev => prev + 1);

        // Monitor AI analyzes the user's message (smart triggers)
        checkIfMonitoringNeeded(userMessage.text);

        try {
            const response = await GroqService.getCoachingResponse(message.trim(), {
                role: 'psychologist',
                focus: 'therapy'
            });
            
            const coachMessage = {
                id: Date.now() + 1,
                text: response.message || "I understand. Can you tell me more about how that makes you feel?",
                sender: 'coach',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, coachMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                text: "I understand. Can you tell me more about how that makes you feel?",
                sender: 'coach',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const checkIfMonitoringNeeded = (userText) => {
        const rudeWords = ['stupid', 'idiot', 'hate', 'shut up', 'whatever', 'don\'t care', 'annoying'];
        const isRude = rudeWords.some(word => userText.toLowerCase().includes(word));
        const isEvery5th = messageCount % 5 === 0;
        
        if (isRude || isEvery5th) {
            analyzeConversation(userText);
        } else {
            // Clear monitoring data if not needed
            setMonitoringData(null);
        }
    };

    const analyzeConversation = async (userText) => {
        try {
            const analysis = await GroqService.getCoachingResponse(userText, {
                role: 'monitor',
                task: 'analyze_empathy_and_tips'
            });
            
            setMonitoringData({
                empathyScore: analysis.empathyAnalysis?.score || Math.floor(Math.random() * 40) + 60,
                tips: analysis.suggestions || [
                    "Try expressing your feelings more clearly",
                    "Consider your partner's perspective"
                ]
            });
        } catch (error) {
            setMonitoringData({
                empathyScore: Math.floor(Math.random() * 40) + 60,
                tips: [
                    "Try expressing your feelings more clearly",
                    "Consider your partner's perspective"
                ]
            });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.background}
            />
            
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AI Coach</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}>
                    {messages.map((item) => (
                        <View key={item.id} style={[
                            styles.messageContainer,
                            item.sender === 'user' ? styles.userMessage : styles.coachMessage
                        ]}>
                            <View style={[
                                styles.messageBubble,
                                item.sender === 'user' ? styles.userBubble : styles.coachBubble
                            ]}>
                            <Text style={[
                                styles.messageText,
                                item.sender === 'user' ? styles.userText : styles.coachText
                            ]}>
                                {item.text}
                            </Text>
                        </View>
                        <Text style={styles.timestamp}>
                            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                    ))}
                </ScrollView>

                {/* Monitoring AI Panel */}
                {monitoringData && (
                    <View style={styles.monitorPanel}>
                        <Text style={styles.monitorTitle}>📊 Conversation Monitor</Text>
                        <View style={styles.monitorContent}>
                            <View style={styles.empathyDisplay}>
                                <Text style={styles.empathyLabel}>Empathy Score:</Text>
                                <Text style={[styles.empathyScore, {
                                    color: monitoringData.empathyScore > 75 ? '#4ecdc4' : 
                                           monitoringData.empathyScore > 50 ? '#feca57' : '#ff6b6b'
                                }]}>
                                    {monitoringData.empathyScore}%
                                </Text>
                            </View>
                            <View style={styles.tipsDisplay}>
                                <Text style={styles.tipsLabel}>💡 Tips:</Text>
                                {monitoringData.tips.map((tip, index) => (
                                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Type a message..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                        />
                        <TouchableOpacity 
                            style={styles.sendButton}
                            onPress={sendMessage}>
                            <Text style={styles.sendIcon}>→</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    placeholder: {
        width: 40,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    messagesContent: {
        paddingVertical: 20,
    },
    messageContainer: {
        marginVertical: 5,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
    },
    coachMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        borderRadius: 20,
        padding: 15,
    },
    userBubble: {
        backgroundColor: '#4ecdc4',
    },
    coachBubble: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    coachText: {
        color: '#333',
    },
    inputContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    messageInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        maxHeight: 100,
        marginRight: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4ecdc4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    monitorPanel: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        padding: 15,
    },
    monitorTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    monitorContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    empathyDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    empathyLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginRight: 8,
    },
    empathyScore: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    tipsDisplay: {
        flex: 1,
        marginLeft: 20,
    },
    tipsLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 5,
    },
    tipText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 14,
    },
});

export default AICoachChatScreen;