import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StatusBar, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import AICoachIntegration from '../components/AICoachIntegration';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
    const { partnerName = 'Sarah' } = route?.params || {};
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [pulseAnim] = useState(new Animated.Value(1));
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showCoaching, setShowCoaching] = useState(false);
    const [empathyScore, setEmpathyScore] = useState(85);
    const [communicationHealth, setCommunicationHealth] = useState(92);
    const [showAICoach, setShowAICoach] = useState(true);
    const flatListRef = useRef(null);

    // Revolutionary AI-powered message analysis
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hey! How was your day at work? 😊",
            sender: 'partner',
            timestamp: new Date(Date.now() - 300000),
            emotion: 'caring',
            empathyScore: 88,
            aiAnalysis: {
                tone: 'supportive',
                emotionalIntelligence: 'high',
                suggestions: ['Great opener! Shows genuine interest']
            }
        },
        {
            id: 2,
            text: "It was pretty stressful actually. Had a difficult meeting with my boss.",
            sender: 'user',
            timestamp: new Date(Date.now() - 240000),
            emotion: 'stressed',
            empathyScore: 72,
            aiAnalysis: {
                tone: 'vulnerable',
                emotionalIntelligence: 'medium',
                suggestions: ['Sharing feelings openly - good emotional expression']
            }
        },
        {
            id: 3,
            text: "I'm sorry to hear that. Do you want to talk about what happened? I'm here for you. ❤️",
            sender: 'partner',
            timestamp: new Date(Date.now() - 180000),
            emotion: 'supportive',
            empathyScore: 95,
            aiAnalysis: {
                tone: 'empathetic',
                emotionalIntelligence: 'very high',
                suggestions: ['Excellent empathetic response!', 'Offers support without judgment']
            }
        }
    ]);

    // AI Coaching suggestions based on conversation context
    const [aiCoaching] = useState({
        currentSuggestions: [
            {
                type: 'empathy',
                title: 'Show More Empathy',
                suggestion: 'Try acknowledging their feelings first: "That sounds really frustrating..."',
                icon: '💝',
                color: '#ff6b6b'
            },
            {
                type: 'active_listening',
                title: 'Active Listening',
                suggestion: 'Ask follow-up questions to show you\'re engaged: "What specifically made it difficult?"',
                icon: '👂',
                color: '#4ecdc4'
            },
            {
                type: 'validation',
                title: 'Validate Emotions',
                suggestion: 'Validate their experience: "Your feelings about this are completely understandable."',
                icon: '✅',
                color: '#45b7d1'
            }
        ],
        emotionInsights: {
            partnerEmotion: 'stressed',
            recommendedResponse: 'supportive',
            confidenceLevel: 0.89
        }
    });

    // Real-time emotion detection simulation
    const emotionColors = {
        happy: '#feca57',
        sad: '#54a0ff',
        angry: '#ff6b6b',
        stressed: '#ff9ff3',
        caring: '#4ecdc4',
        supportive: '#96ceb4',
        excited: '#ff9f43',
        neutral: '#a4b0be'
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for AI coaching
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Simulate partner typing
        const typingInterval = setInterval(() => {
            setIsTyping(prev => !prev);
        }, 8000);

        return () => clearInterval(typingInterval);
    }, []);

    // Revolutionary AI message analysis
    const analyzeMessage = (text) => {
        // Simulate AI emotion detection and empathy scoring
        const emotions = ['happy', 'supportive', 'caring', 'excited', 'neutral'];
        const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const empathyScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
        
        const suggestions = [
            'Great emotional awareness!',
            'Consider asking follow-up questions',
            'Try reflecting their feelings back',
            'Excellent use of supportive language'
        ];

        return {
            emotion: detectedEmotion,
            empathyScore,
            aiAnalysis: {
                tone: detectedEmotion,
                emotionalIntelligence: empathyScore > 85 ? 'very high' : empathyScore > 75 ? 'high' : 'medium',
                suggestions: [suggestions[Math.floor(Math.random() * suggestions.length)]]
            }
        };
    };

    const sendMessage = () => {
        if (message.trim()) {
            const analysis = analyzeMessage(message);
            const newMessage = {
                id: messages.length + 1,
                text: message.trim(),
                sender: 'user',
                timestamp: new Date(),
                ...analysis
            };

            setMessages(prev => [...prev, newMessage]);
            setMessage('');
            
            // Update empathy score based on message
            setEmpathyScore(prev => Math.min(100, prev + (analysis.empathyScore > 80 ? 2 : -1)));
            
            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            // Simulate partner response after delay
            setTimeout(() => {
                simulatePartnerResponse();
            }, 2000 + Math.random() * 3000);
        }
    };

    const simulatePartnerResponse = () => {
        const responses = [
            "Thank you for listening 💕",
            "That really helps me feel better",
            "I appreciate you being here for me",
            "You always know what to say ❤️",
            "I'm so grateful to have you"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        const analysis = analyzeMessage(response);
        
        const partnerMessage = {
            id: messages.length + 2,
            text: response,
            sender: 'partner',
            timestamp: new Date(),
            ...analysis
        };

        setMessages(prev => [...prev, partnerMessage]);
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const applySuggestion = (suggestion) => {
        setMessage(suggestion.suggestion);
        setShowCoaching(false);
    };

    const MessageBubble = ({ item }) => {
        const isUser = item.sender === 'user';
        const emotionColor = emotionColors[item.emotion] || '#a4b0be';

        return (
            <Animated.View style={[
                styles.messageContainer,
                isUser ? styles.userMessageContainer : styles.partnerMessageContainer,
                { opacity: fadeAnim }
            ]}>
                {/* Emotion indicator */}
                <View style={[styles.emotionIndicator, { backgroundColor: emotionColor }]}>
                    <Text style={styles.emotionText}>{item.emotion}</Text>
                </View>

                {/* Message bubble */}
                <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.partnerBubble]}>
                    <LinearGradient
                        colors={isUser 
                            ? ['#667eea', '#764ba2'] 
                            : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
                        }
                        style={styles.messageGradient}>
                        <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.partnerMessageText]}>
                            {item.text}
                        </Text>
                        
                        {/* Empathy score indicator */}
                        <View style={styles.empathyScoreContainer}>
                            <View style={[styles.empathyScore, { backgroundColor: item.empathyScore > 85 ? '#4ecdc4' : item.empathyScore > 70 ? '#feca57' : '#ff6b6b' }]}>
                                <Text style={styles.empathyScoreText}>{item.empathyScore}</Text>
                            </View>
                            <Text style={styles.empathyLabel}>EQ</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* AI Analysis (expandable) */}
                {item.aiAnalysis && (
                    <TouchableOpacity style={styles.aiAnalysisContainer}>
                        <Text style={styles.aiAnalysisText}>
                            🤖 {item.aiAnalysis.suggestions[0]}
                        </Text>
                    </TouchableOpacity>
                )}

                <Text style={styles.timestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </Animated.View>
        );
    };

    const CoachingSuggestion = ({ suggestion, onApply }) => (
        <TouchableOpacity style={styles.suggestionCard} onPress={() => onApply(suggestion)}>
            <LinearGradient
                colors={[suggestion.color, suggestion.color + '80']}
                style={styles.suggestionGradient}>
                <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text style={styles.suggestionText}>{suggestion.suggestion}</Text>
                </View>
                <Text style={styles.suggestionApply}>Apply</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Gradient Background */}
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.gradientBackground}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            
            <SafeAreaView style={styles.safeArea}>
                {/* Header with AI insights */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.headerCenter}>
                        <Text style={styles.partnerName}>{partnerName}</Text>
                        <View style={styles.aiInsights}>
                            <View style={styles.insightItem}>
                                <Text style={styles.insightLabel}>Empathy</Text>
                                <Text style={styles.insightValue}>{empathyScore}%</Text>
                            </View>
                            <View style={styles.insightDivider} />
                            <View style={styles.insightItem}>
                                <Text style={styles.insightLabel}>Health</Text>
                                <Text style={styles.insightValue}>{communicationHealth}%</Text>
                            </View>
                        </View>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.coachingButton} 
                        onPress={() => navigation.navigate('AICoachChat', {
                            conversationContext: {
                                partnerName,
                                empathyScore,
                                relationshipHealth: communicationHealth,
                                recentMessages: messages.slice(-3),
                                currentMessage: message
                            }
                        })}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <Text style={styles.coachingIcon}>🤖</Text>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>

                {/* AI Coach Integration - Shows empathy score and quick access */}
                {showAICoach && (
                    <AICoachIntegration
                        currentMessage={message}
                        onCoachingSuggestion={(suggestion) => setMessage(suggestion)}
                        conversationContext={{
                            partnerName,
                            empathyScore,
                            relationshipHealth: communicationHealth,
                            recentMessages: messages.slice(-3)
                        }}
                        visible={showAICoach}
                    />
                )}

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item }) => <MessageBubble item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                />

                {/* Typing indicator */}
                {isTyping && (
                    <Animated.View style={[styles.typingIndicator, { opacity: fadeAnim }]}>
                        <View style={styles.typingBubble}>
                            <Text style={styles.typingText}>{partnerName} is typing</Text>
                            <View style={styles.typingDots}>
                                <View style={[styles.dot, styles.dot1]} />
                                <View style={[styles.dot, styles.dot2]} />
                                <View style={[styles.dot, styles.dot3]} />
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* AI Coach Integration */}
                {showAICoach && (
                    <AICoachIntegration
                        currentMessage={message}
                        onCoachingSuggestion={(suggestion) => setMessage(suggestion)}
                        conversationContext={{
                            partnerName,
                            empathyScore,
                            relationshipHealth: communicationHealth,
                            recentMessages: messages.slice(-5),
                            partnerEmotion: messages.length > 0 ? messages[messages.length - 1].emotion : 'neutral'
                        }}
                        visible={message.length > 10} // Show when user is typing substantial message
                    />
                )}

                {/* Message Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.inputGradient}>
                            
                            {/* Emotion detection indicator */}
                            <View style={styles.emotionDetector}>
                                <Text style={styles.emotionDetectorIcon}>😊</Text>
                            </View>
                            
                            <TextInput
                                style={styles.messageInput}
                                placeholder="Type your message..."
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                maxLength={500}
                            />
                            
                            {/* AI assistance button */}
                            <TouchableOpacity style={styles.aiAssistButton}>
                                <Text style={styles.aiAssistIcon}>✨</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
                                onPress={sendMessage}
                                disabled={!message.trim()}>
                                <LinearGradient
                                    colors={message.trim() ? ['#4ecdc4', '#44a08d'] : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                                    style={styles.sendButtonGradient}>
                                    <Text style={styles.sendIcon}>→</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#667eea',
    },
    gradientBackground: {
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
        marginTop: 10,
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
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    partnerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    aiInsights: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    insightItem: {
        alignItems: 'center',
    },
    insightLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
    },
    insightValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
    },
    insightDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 8,
    },
    coachingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coachingIcon: {
        fontSize: 20,
    },
    coachingPanel: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 20,
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
    },
    coachingTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    suggestionCard: {
        width: 200,
        marginRight: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    suggestionGradient: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    suggestionIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    suggestionContent: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    suggestionText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
    },
    suggestionApply: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    messagesContent: {
        paddingVertical: 10,
    },
    messageContainer: {
        marginVertical: 8,
        maxWidth: '80%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    partnerMessageContainer: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    emotionIndicator: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginBottom: 4,
    },
    emotionText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    messageBubble: {
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    messageGradient: {
        padding: 15,
        paddingRight: 50,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userMessageText: {
        color: '#fff',
    },
    partnerMessageText: {
        color: '#333',
    },
    empathyScoreContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        alignItems: 'center',
    },
    empathyScore: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empathyScoreText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    empathyLabel: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    aiAnalysisContainer: {
        marginTop: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 6,
    },
    aiAnalysisText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    typingIndicator: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    typingText: {
        fontSize: 12,
        color: '#fff',
        marginRight: 8,
    },
    typingDots: {
        flexDirection: 'row',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        marginHorizontal: 1,
    },
    inputContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    inputWrapper: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    inputGradient: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    emotionDetector: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    emotionDetectorIcon: {
        fontSize: 16,
    },
    messageInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        maxHeight: 100,
        marginRight: 10,
    },
    aiAssistButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    aiAssistIcon: {
        fontSize: 16,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    sendButtonGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ChatScreen;
