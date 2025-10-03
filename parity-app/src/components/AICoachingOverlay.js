import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AICoachingOverlay = ({ visible, onClose, currentMessage, partnerEmotion, onApplySuggestion }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(height));
    const [pulseAnim] = useState(new Animated.Value(1));

    // Revolutionary AI suggestions based on context
    const [suggestions] = useState([
        {
            id: 1,
            type: 'empathy_boost',
            title: 'Empathy Booster',
            description: 'Add emotional validation to show you understand',
            examples: [
                "That sounds really challenging for you.",
                "I can imagine how frustrating that must be.",
                "Your feelings about this are completely valid."
            ],
            icon: '💝',
            color: '#ff6b6b',
            impact: '+15 Empathy Score'
        },
        {
            id: 2,
            type: 'active_listening',
            title: 'Active Listening',
            description: 'Show engagement with follow-up questions',
            examples: [
                "Can you tell me more about that?",
                "What was the most difficult part?",
                "How did that make you feel?"
            ],
            icon: '👂',
            color: '#4ecdc4',
            impact: '+20 Connection Score'
        },
        {
            id: 3,
            type: 'solution_focus',
            title: 'Solution-Focused',
            description: 'Gently guide toward problem-solving',
            examples: [
                "What do you think might help in this situation?",
                "Have you considered trying...?",
                "What would make you feel better right now?"
            ],
            icon: '🎯',
            color: '#45b7d1',
            impact: '+10 Problem-Solving'
        },
        {
            id: 4,
            type: 'emotional_support',
            title: 'Emotional Support',
            description: 'Provide comfort and reassurance',
            examples: [
                "I'm here for you no matter what.",
                "You're not alone in this.",
                "We'll figure this out together."
            ],
            icon: '🤗',
            color: '#96ceb4',
            impact: '+25 Support Score'
        },
        {
            id: 5,
            type: 'appreciation',
            title: 'Show Appreciation',
            description: 'Acknowledge their openness and trust',
            examples: [
                "Thank you for sharing this with me.",
                "I appreciate you being so open.",
                "It means a lot that you trust me with this."
            ],
            icon: '🙏',
            color: '#feca57',
            impact: '+15 Trust Score'
        }
    ]);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // Pulse animation for attention
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleSuggestionSelect = (suggestion, example) => {
        onApplySuggestion(example);
        onClose();
    };

    const SuggestionCard = ({ suggestion }) => (
        <View style={styles.suggestionCard}>
            <LinearGradient
                colors={[suggestion.color, suggestion.color + '80']}
                style={styles.suggestionGradient}>
                
                <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                    <View style={styles.suggestionTitleContainer}>
                        <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                        <Text style={styles.suggestionImpact}>{suggestion.impact}</Text>
                    </View>
                </View>
                
                <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
                
                <View style={styles.examplesContainer}>
                    <Text style={styles.examplesTitle}>Try saying:</Text>
                    {suggestion.examples.map((example, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.exampleButton}
                            onPress={() => handleSuggestionSelect(suggestion, example)}>
                            <Text style={styles.exampleText}>"{example}"</Text>
                            <Text style={styles.useButton}>Use</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>
        </View>
    );

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.backdrop} onPress={onClose} />
            
            <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }, { scale: pulseAnim }] }]}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
                    style={styles.contentGradient}>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.aiIcon}>🤖</Text>
                            <View>
                                <Text style={styles.title}>AI Communication Coach</Text>
                                <Text style={styles.subtitle}>
                                    Partner seems {partnerEmotion} - here's how to respond better
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeIcon}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Emotional Context */}
                    <View style={styles.contextBar}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.contextGradient}>
                            <Text style={styles.contextText}>
                                🎯 Detected emotion: <Text style={styles.emotionText}>{partnerEmotion}</Text>
                            </Text>
                            <Text style={styles.contextSubtext}>
                                Tailored suggestions for this emotional state
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Suggestions */}
                    <View style={styles.suggestionsContainer}>
                        {suggestions.slice(0, 3).map((suggestion) => (
                            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                        ))}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.quickActionButton}>
                            <LinearGradient
                                colors={['#4ecdc4', '#44a08d']}
                                style={styles.quickActionGradient}>
                                <Text style={styles.quickActionText}>📚 Learn More</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.quickActionButton}>
                            <LinearGradient
                                colors={['#ff6b6b', '#ee5a24']}
                                style={styles.quickActionGradient}>
                                <Text style={styles.quickActionText}>💡 Custom Tip</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    backdrop: {
        flex: 1,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: height * 0.8,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
    },
    contentGradient: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    aiIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 20,
        color: '#666',
        fontWeight: 'bold',
    },
    contextBar: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    contextGradient: {
        padding: 12,
    },
    contextText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
        marginBottom: 2,
    },
    emotionText: {
        textTransform: 'capitalize',
        fontWeight: 'bold',
    },
    contextSubtext: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
    },
    suggestionsContainer: {
        marginBottom: 20,
    },
    suggestionCard: {
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    suggestionGradient: {
        padding: 15,
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    suggestionIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    suggestionTitleContainer: {
        flex: 1,
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    suggestionImpact: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    suggestionDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    examplesContainer: {
        marginTop: 5,
    },
    examplesTitle: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 6,
        fontWeight: '600',
    },
    exampleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 4,
    },
    exampleText: {
        fontSize: 11,
        color: '#fff',
        flex: 1,
        fontStyle: 'italic',
    },
    useButton: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255,255,255,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        flex: 0.48,
        borderRadius: 10,
        overflow: 'hidden',
    },
    quickActionGradient: {
        padding: 12,
        alignItems: 'center',
    },
    quickActionText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
});

export default AICoachingOverlay;
