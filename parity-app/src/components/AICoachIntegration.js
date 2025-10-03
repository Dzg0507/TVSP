import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import GroqService from '../services/GroqService';

const AICoachIntegration = ({ 
  currentMessage, 
  onCoachingSuggestion, 
  conversationContext,
  visible = true 
}) => {
  const navigation = useNavigation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachingData, setCoachingData] = useState(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation for AI coach indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
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
    }
  }, [visible]);

  // Initialize Mrs. Sebiv Doog character
  useEffect(() => {
    initializeCoach();
  }, []);

  const initializeCoach = async () => {
    try {
      const success = await GroqService.initialize();
      console.log(success ? '✅ Mrs. Sebiv Doog initialized with Groq!' : '⚠️ Using fallback mode');
    } catch (error) {
      console.log('Coach initialization error:', error);
      // Fallback to mock coaching if API fails
    }
  };

  // Analyze message in real-time
  const analyzeCurrentMessage = async () => {
    if (!currentMessage.trim()) return;

    setIsAnalyzing(true);
    try {
      const coaching = await GroqService.getCoachingResponse(
        currentMessage,
        conversationContext
      );
      
      setCoachingData(coaching);
      
      // Show coaching suggestions if needed
      if (!coaching.shouldSend && coaching.suggestions.length > 0) {
        showCoachingSuggestions(coaching);
      }
    } catch (error) {
      console.error('Coaching analysis error:', error);
      // Provide fallback coaching
      provideFallbackCoaching();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showCoachingSuggestions = (coaching) => {
    Alert.alert(
      '💡 Mrs. Sebiv Doog suggests...',
      coaching.coachingTip,
      [
        {
          text: 'Use Suggestion',
          onPress: () => {
            if (coaching.improvedMessage) {
              onCoachingSuggestion(coaching.improvedMessage);
            }
          }
        },
        {
          text: 'Send Anyway',
          style: 'cancel'
        },
        {
          text: 'Get More Help',
          onPress: () => openFullCoaching()
        }
      ]
    );
  };

  const provideFallbackCoaching = () => {
    const empathyAnalysis = ConvaiService.analyzeEmpathy(currentMessage);
    
    if (empathyAnalysis.score < 60) {
      Alert.alert(
        '💝 Empathy Boost Suggestion',
        `Your message has an empathy score of ${empathyAnalysis.score}%. Try adding more understanding language like "I can see that..." or "It sounds like you feel..."`,
        [
          { text: 'Apply Suggestion', onPress: () => applyEmpathyBoost() },
          { text: 'Send As-Is', style: 'cancel' }
        ]
      );
    }
  };

  const applyEmpathyBoost = () => {
    const empathyPhrases = [
      "I can see that ",
      "It sounds like you feel ",
      "I understand that ",
      "I hear that you're ",
      "That must be "
    ];
    
    const randomPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    const improvedMessage = randomPhrase + currentMessage.toLowerCase();
    onCoachingSuggestion(improvedMessage);
  };

  const openFullCoaching = () => {
    // Navigate to dedicated AI Coach Chat screen
    navigation.navigate('AICoachChat', { 
      conversationContext: {
        ...conversationContext,
        currentMessage,
        initialPrompt: `I'm having trouble with this conversation. Can you help me communicate better? The message I want to send is: "${currentMessage}"`
      }
    });
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.coachIndicator}>
        <Animated.View style={[styles.coachAvatar, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.avatarGradient}>
            <Text style={styles.coachEmoji}>🤖</Text>
          </LinearGradient>
        </Animated.View>
        
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>Mrs. Sebiv Doog</Text>
          <Text style={styles.coachStatus}>
            {isAnalyzing ? 'Analyzing...' : 'Ready to help'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={analyzeCurrentMessage}
          disabled={isAnalyzing || !currentMessage.trim()}>
          <LinearGradient
            colors={isAnalyzing ? ['#999', '#666'] : ['#4ecdc4', '#44a08d']}
            style={styles.buttonGradient}>
            <Text style={styles.buttonText}>
              {isAnalyzing ? '🔄' : '💡'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {coachingData && (
        <View style={styles.coachingResults}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.resultsGradient}>
            
            <View style={styles.empathyScore}>
              <Text style={styles.scoreLabel}>Empathy Score:</Text>
              <View style={[
                styles.scoreIndicator,
                { backgroundColor: coachingData.empathyScore > 75 ? '#4ecdc4' : 
                                   coachingData.empathyScore > 50 ? '#feca57' : '#ff6b6b' }
              ]}>
                <Text style={styles.scoreText}>{coachingData.empathyScore}%</Text>
              </View>
            </View>

            {coachingData.suggestions.length > 0 && (
              <View style={styles.suggestions}>
                <Text style={styles.suggestionsTitle}>💡 Quick Tips:</Text>
                {coachingData.suggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionText}>
                    • {suggestion.text}
                  </Text>
                ))}
              </View>
            )}

            <TouchableOpacity 
              style={styles.fullCoachingButton}
              onPress={openFullCoaching}>
              <Text style={styles.fullCoachingText}>
                💬 Talk to Mrs. Sebiv Doog
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  coachIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachEmoji: {
    fontSize: 20,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  coachStatus: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  analyzeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  coachingResults: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultsGradient: {
    padding: 12,
  },
  empathyScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  scoreIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  suggestions: {
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 3,
    lineHeight: 16,
  },
  fullCoachingButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  fullCoachingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});

export default AICoachIntegration;
