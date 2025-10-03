import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../contexts/AuthContext';
import { NetworkService } from '../services/NetworkService';

const { width, height } = Dimensions.get('window');

const JointSessionScreen = ({ navigation }) => {
  const { user, token } = useAuthContext();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const scrollViewRef = useRef(null);

  // Default session data structure
  const defaultSessionData = {
    session_id: 'joint_123',
    real_time_prompts: [
      "Take a moment to check in with your partner - how are they feeling right now?",
      "Share something positive you've noticed about your partner recently",
      "Express one thing you appreciate about your relationship",
      "Ask your partner what they need from you today",
      "Let's work on your goal: Improve active listening",
      "Let's work on your goal: Reduce conflict escalation"
    ],
    active_listening_reminders: [
      "Focus on understanding, not responding",
      "Paraphrase what your partner said to confirm understanding",
      "Ask clarifying questions when you're unsure",
      "Show empathy through your body language"
    ],
    conflict_prevention_tips: [
      "If you feel defensive, take a deep breath and try to understand the concern",
      "Use 'I' statements instead of 'you' statements",
      "Take breaks if emotions escalate",
      "Focus on the issue, not the person"
    ],
    session_structure: {
      "opening": {
        "duration": "5 minutes",
        "activities": ["Check-in", "Set intentions", "Create safe space"]
      },
      "main_discussion": {
        "duration": "20 minutes",
        "activities": ["Address main topics", "Practice active listening", "Share perspectives"]
      },
      "closing": {
        "duration": "10 minutes",
        "activities": ["Summarize key points", "Express appreciation", "Plan next steps"]
      }
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.12.246:8001/coaching/joint-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: 'joint_' + Date.now(),
          participant_ids: ['user1', 'user2'],
          session_goals: ['Improve active listening', 'Reduce conflict escalation'],
          duration_minutes: 30
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSessionData(data);
      setSessionActive(true);
    } catch (error) {
      console.error('Error starting session:', error);
      // Fallback to basic session data
      setSessionData({
        session_id: 'joint_' + Date.now(),
        real_time_prompts: [
          "Take a moment to check in with your partner - how are they feeling right now?",
          "Share something positive you've noticed about your partner recently",
          "Express one thing you appreciate about your relationship",
          "Ask your partner what they need from you today"
        ],
        active_listening_reminders: [
          "Focus on understanding, not responding",
          "Paraphrase what your partner said to confirm understanding",
          "Ask clarifying questions when you're unsure",
          "Show empathy through your body language"
        ],
        conflict_prevention_tips: [
          "If you feel defensive, take a deep breath and try to understand the concern",
          "Use 'I' statements instead of 'you' statements",
          "Take breaks if emotions escalate",
          "Focus on the issue, not the person"
        ],
        session_structure: {
          "opening": {
            "duration": "5 minutes",
            "activities": ["Check-in", "Set intentions", "Create safe space"]
          },
          "main_discussion": {
            "duration": "20 minutes",
            "activities": ["Address main topics", "Practice active listening", "Share perspectives"]
          },
          "closing": {
            "duration": "10 minutes",
            "activities": ["Summarize key points", "Express appreciation", "Plan next steps"]
          }
        }
      });
      setSessionActive(true);
    } finally {
      setLoading(false);
    }
  };

  const nextPrompt = () => {
    if (currentPromptIndex < sessionData.real_time_prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    }
  };

  const previousPrompt = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  const endSession = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: () => {
            setSessionActive(false);
            setSessionData(null);
            setCurrentPromptIndex(0);
            setSessionNotes('');
          }
        }
      ]
    );
  };

  const renderSessionSetup = () => (
    <ScrollView style={styles.scrollView}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Joint Communication Session</Text>
        <Text style={styles.headerSubtitle}>Connect and communicate together</Text>
      </View>

      {/* Session Info */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What is a Joint Session?</Text>
          <Text style={styles.infoText}>
            A guided communication session where both partners can practice 
            active listening, share perspectives, and work on relationship goals together.
          </Text>
        </View>
      </View>

      {/* Session Structure Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Structure</Text>
        <View style={styles.structureCard}>
          <View style={styles.structurePhase}>
            <Text style={styles.phaseTitle}>Opening (5 min)</Text>
            <Text style={styles.phaseDescription}>Check-in, set intentions, create safe space</Text>
          </View>
          <View style={styles.structurePhase}>
            <Text style={styles.phaseTitle}>Main Discussion (20 min)</Text>
            <Text style={styles.phaseDescription}>Address topics, practice active listening</Text>
          </View>
          <View style={styles.structurePhase}>
            <Text style={styles.phaseTitle}>Closing (10 min)</Text>
            <Text style={styles.phaseDescription}>Summarize, express appreciation, plan next steps</Text>
          </View>
        </View>
      </View>

      {/* Start Session Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={startSession}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.startButtonText}>Start Joint Session</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  const renderActiveSession = () => (
    <View style={styles.sessionContainer}>
      {/* Session Header */}
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>Joint Session Active</Text>
          <Text style={styles.sessionTimer}>⏱ 25:30 remaining</Text>
        </View>
        <TouchableOpacity style={styles.endButton} onPress={endSession}>
          <Text style={styles.endButtonText}>End</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.sessionScrollView}>
        {/* Current Phase Indicator */}
        <View style={styles.phaseIndicator}>
          <Text style={styles.phaseIndicatorText}>Main Discussion Phase</Text>
          <Text style={styles.phaseIndicatorSubtext}>20 minutes</Text>
        </View>

        {/* Current Prompt */}
        <View style={styles.promptSection}>
          <Text style={styles.promptSectionTitle}>Current Prompt</Text>
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>
              {sessionData.real_time_prompts[currentPromptIndex]}
            </Text>
            <View style={styles.promptNavigation}>
              <TouchableOpacity
                style={[styles.promptNavButton, currentPromptIndex === 0 && styles.disabledButton]}
                onPress={previousPrompt}
                disabled={currentPromptIndex === 0}
              >
                <Text style={[styles.promptNavButtonText, currentPromptIndex === 0 && styles.disabledButtonText]}>
                  ← Previous
                </Text>
              </TouchableOpacity>

              <Text style={styles.promptCounter}>
                {currentPromptIndex + 1} of {sessionData.real_time_prompts.length}
              </Text>

              <TouchableOpacity
                style={[styles.promptNavButton, currentPromptIndex === sessionData.real_time_prompts.length - 1 && styles.disabledButton]}
                onPress={nextPrompt}
                disabled={currentPromptIndex === sessionData.real_time_prompts.length - 1}
              >
                <Text style={[styles.promptNavButtonText, currentPromptIndex === sessionData.real_time_prompts.length - 1 && styles.disabledButtonText]}>
                  Next →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setShowPromptModal(true)}
          >
            <Text style={styles.quickActionText}>💬 New Prompt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setShowTipsModal(true)}
          >
            <Text style={styles.quickActionText}>💡 Tips</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              Alert.alert('Break Time', 'Taking a break can help when emotions are high. Would you like to pause for 5 minutes?');
            }}
          >
            <Text style={styles.quickActionText}>⏸️ Break</Text>
          </TouchableOpacity>
        </View>

        {/* Session Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Session Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Record key insights, agreements, or action items..."
            value={sessionNotes}
            onChangeText={setSessionNotes}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modals */}
      <Modal
        visible={showPromptModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPromptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Session Prompts</Text>
            <ScrollView style={styles.modalScrollView}>
              {sessionData.real_time_prompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.modalPromptCard, index === currentPromptIndex && styles.selectedModalPrompt]}
                  onPress={() => {
                    setCurrentPromptIndex(index);
                    setShowPromptModal(false);
                  }}
                >
                  <Text style={styles.modalPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPromptModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTipsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTipsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Communication Tips</Text>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Active Listening</Text>
                {sessionData.active_listening_reminders.map((tip, index) => (
                  <View key={index} style={styles.tipCard}>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.tipsSection}>
                <Text style={styles.tipsSectionTitle}>Conflict Prevention</Text>
                {sessionData.conflict_prevention_tips.map((tip, index) => (
                  <View key={index} style={styles.tipCard}>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTipsModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        {!sessionActive ? renderSessionSetup() : renderActiveSession()}
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
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
  },
  structureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  structurePhase: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionContainer: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sessionTimer: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  endButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionScrollView: {
    flex: 1,
  },
  phaseIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 24,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  phaseIndicatorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  phaseIndicatorSubtext: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 4,
  },
  promptSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  promptSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  promptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  promptText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 16,
  },
  promptNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptNavButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  promptNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#B0B0B0',
  },
  promptCounter: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  notesSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: height * 0.5,
  },
  modalPromptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedModalPrompt: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  modalPromptText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default JointSessionScreen;
