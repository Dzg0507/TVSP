import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../contexts/AuthContext';
import { NetworkService } from '../services/NetworkService';

const { width, height } = Dimensions.get('window');

const SoloPreparationScreen = ({ navigation }) => {
  const { user, token } = useAuthContext();
  const [sessionType, setSessionType] = useState('solo_preparation');
  const [topic, setTopic] = useState('');
  const [goals, setGoals] = useState('');
  const [preparationData, setPreparationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [promptResponses, setPromptResponses] = useState({});

  const sessionTypes = [
    { key: 'solo_preparation', title: 'Session Preparation', description: 'Prepare for an upcoming conversation' },
    { key: 'reflection', title: 'Reflection', description: 'Reflect on past conversations' },
    { key: 'skill_practice', title: 'Skill Practice', description: 'Practice communication skills' }
  ];

  // Default preparation data structure
  const defaultPreparationData = {
    session_id: 'prep_123',
    preparation_prompts: [
      "What are the main topics you want to discuss with your partner?",
      "How are you feeling about your relationship right now?",
      "What challenges have you been facing recently?",
      "What positive changes would you like to see in your communication?",
      "What are your hopes for this conversation?"
    ],
    focus_areas: [
      "Clarifying your own feelings and needs",
      "Preparing to listen actively to your partner",
      "Setting positive intentions for the conversation",
      "Identifying potential sensitive topics"
    ],
    conversation_starters: [
      "I've been thinking about our relationship and I'd love to share some thoughts with you.",
      "I've been reflecting on our communication and I have some ideas I'd like to discuss.",
      "I feel like we haven't had a deep conversation in a while. Can we talk about how we're both doing?"
    ],
    tips_and_techniques: [
      "Use 'I' statements to express your feelings",
      "Take breaks if emotions get too intense",
      "Focus on understanding, not winning",
      "Acknowledge your partner's perspective even if you disagree"
    ],
    estimated_duration: 20
  };

  const generatePreparation = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.12.246:8001/coaching/solo-preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current_user',
          session_type: sessionType,
          topic: topic || null,
          goals: goals ? goals.split(',').map(g => g.trim()) : []
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPreparationData(data);
    } catch (error) {
      console.error('Error generating preparation:', error);
      // Fallback to basic preparation data
      setPreparationData({
        session_id: 'prep_' + Date.now(),
        preparation_prompts: [
          "What are the main topics you want to discuss with your partner?",
          "How are you feeling about your relationship right now?",
          "What challenges have you been facing recently?",
          "What positive changes would you like to see in your communication?",
          "What are your hopes for this conversation?"
        ],
        focus_areas: [
          "Clarifying your own feelings and needs",
          "Preparing to listen actively to your partner",
          "Setting positive intentions for the conversation",
          "Identifying potential sensitive topics"
        ],
        conversation_starters: [
          "I've been thinking about our relationship and I'd love to share some thoughts with you.",
          "I've been reflecting on our communication and I have some ideas I'd like to discuss.",
          "I feel like we haven't had a deep conversation in a while. Can we talk about how we're both doing?"
        ],
        tips_and_techniques: [
          "Use 'I' statements to express your feelings",
          "Take breaks if emotions get too intense",
          "Focus on understanding, not winning",
          "Acknowledge your partner's perspective even if you disagree"
        ],
        estimated_duration: 20
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromptResponse = (response) => {
    const newResponses = { ...promptResponses };
    newResponses[currentPromptIndex] = response;
    setPromptResponses(newResponses);
  };

  const nextPrompt = () => {
    if (currentPromptIndex < preparationData.preparation_prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };

  const previousPrompt = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  const renderSessionTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>What would you like to work on?</Text>
      {sessionTypes.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.sessionTypeCard,
            sessionType === type.key && styles.selectedSessionType
          ]}
          onPress={() => setSessionType(type.key)}
        >
          <Text style={[
            styles.sessionTypeTitle,
            sessionType === type.key && styles.selectedSessionTypeText
          ]}>
            {type.title}
          </Text>
          <Text style={[
            styles.sessionTypeDescription,
            sessionType === type.key && styles.selectedSessionTypeDescription
          ]}>
            {type.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderInputForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Additional Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Topic (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What specific topic would you like to discuss?"
          value={topic}
          onChangeText={setTopic}
          multiline
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Goals (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="What are your goals for this conversation? (comma-separated)"
          value={goals}
          onChangeText={setGoals}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={generatePreparation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Preparation</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPreparationContent = () => (
    <ScrollView style={styles.preparationContainer}>
      {/* Focus Areas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus Areas</Text>
        {preparationData.focus_areas.map((area, index) => (
          <View key={index} style={styles.focusAreaCard}>
            <Text style={styles.focusAreaText}>{area}</Text>
          </View>
        ))}
      </View>

      {/* Preparation Prompts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflection Prompts</Text>
        <View style={styles.promptContainer}>
          <Text style={styles.promptCounter}>
            {currentPromptIndex + 1} of {preparationData.preparation_prompts.length}
          </Text>
          <Text style={styles.promptText}>
            {preparationData.preparation_prompts[currentPromptIndex]}
          </Text>
          
          <TextInput
            style={styles.promptResponseInput}
            placeholder="Share your thoughts here..."
            value={promptResponses[currentPromptIndex] || ''}
            onChangeText={handlePromptResponse}
            multiline
            numberOfLines={4}
          />

          <View style={styles.promptNavigation}>
            <TouchableOpacity
              style={[styles.navButton, currentPromptIndex === 0 && styles.disabledButton]}
              onPress={previousPrompt}
              disabled={currentPromptIndex === 0}
            >
              <Text style={[styles.navButtonText, currentPromptIndex === 0 && styles.disabledButtonText]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, currentPromptIndex === preparationData.preparation_prompts.length - 1 && styles.disabledButton]}
              onPress={nextPrompt}
              disabled={currentPromptIndex === preparationData.preparation_prompts.length - 1}
            >
              <Text style={[styles.navButtonText, currentPromptIndex === preparationData.preparation_prompts.length - 1 && styles.disabledButtonText]}>
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Conversation Starters */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conversation Starters</Text>
        {preparationData.conversation_starters.map((starter, index) => (
          <View key={index} style={styles.starterCard}>
            <Text style={styles.starterText}>"{starter}"</Text>
          </View>
        ))}
      </View>

      {/* Tips and Techniques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips & Techniques</Text>
        {preparationData.tips_and_techniques.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AICoachChatScreen')}
        >
          <Text style={styles.actionButtonText}>Start Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => setPreparationData(null)}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            New Preparation
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        {!preparationData ? (
          <ScrollView style={styles.scrollView}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Solo Preparation</Text>
              <Text style={styles.headerSubtitle}>Prepare for meaningful conversations</Text>
            </View>

            {renderSessionTypeSelector()}
            {renderInputForm()}
          </ScrollView>
        ) : (
          renderPreparationContent()
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sessionTypeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSessionType: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  sessionTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedSessionTypeText: {
    color: '#4CAF50',
  },
  sessionTypeDescription: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  selectedSessionTypeDescription: {
    color: '#B0E0B0',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  preparationContainer: {
    flex: 1,
    paddingTop: 24,
  },
  focusAreaCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  focusAreaText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  promptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  promptCounter: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 26,
  },
  promptResponseInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  promptNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#B0B0B0',
  },
  starterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  starterText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 18,
    color: '#4CAF50',
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    flex: 1,
  },
  actionButtons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#4CAF50',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default SoloPreparationScreen;
