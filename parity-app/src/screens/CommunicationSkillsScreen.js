import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../contexts/AuthContext';
import { NetworkService } from '../services/NetworkService';

const { width, height } = Dimensions.get('window');

const CommunicationSkillsScreen = ({ navigation }) => {
  const { user, token } = useAuthContext();
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Default skills data structure
  const defaultSkillsData = {
    available_skills: [
      'active_listening',
      'empathy',
      'conflict_resolution',
      'emotional_expression',
      'assertive_communication',
      'non_verbal_communication'
    ],
    recommended_exercises: [
      {
        exercise_id: 'ex_1',
        skill: 'active_listening',
        title: 'Mirror and Validate',
        description: 'Practice reflecting back what you hear and validating your partner\'s feelings',
        instructions: [
          'Listen to your partner without interrupting',
          'Paraphrase what they said: "So what I hear you saying is..."',
          'Validate their feelings: "That makes sense that you would feel..."',
          'Ask if you understood correctly'
        ],
        difficulty_level: 'beginner',
        estimated_time: 15,
        practice_scenarios: [
          'Partner shares a work frustration',
          'Partner expresses relationship concerns',
          'Partner talks about future plans'
        ]
      },
      {
        exercise_id: 'ex_2',
        skill: 'emotional_expression',
        title: 'Feelings Wheel Practice',
        description: 'Expand your emotional vocabulary and express feelings more precisely',
        instructions: [
          'Identify your current emotion',
          'Use specific feeling words (not just "good" or "bad")',
          'Explain what triggered this emotion',
          'Share what you need from your partner'
        ],
        difficulty_level: 'intermediate',
        estimated_time: 20,
        practice_scenarios: [
          'When you\'re feeling overwhelmed',
          'When you\'re excited about something',
          'When you\'re disappointed'
        ]
      }
    ],
    user_progress: {
      'active_listening': 0.6,
      'empathy': 0.7,
      'conflict_resolution': 0.4,
      'emotional_expression': 0.5,
      'assertive_communication': 0.3,
      'non_verbal_communication': 0.8
    }
  };

  useEffect(() => {
    loadSkillsData();
  }, []);

  const loadSkillsData = async () => {
    try {
      setLoading(true);
      console.log('🔵 [COMMUNICATION SKILLS] Fetching skills data...');
      
      const aiCoachingURL = await NetworkService.getServiceEndpoint('aiCoaching');
      const response = await fetch(`${aiCoachingURL}/coaching/skill-library`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🟢 [COMMUNICATION SKILLS] Skills data fetched successfully');
        setSkillsData(data);
      } else {
        console.log('🔴 [COMMUNICATION SKILLS] API not available, using default data');
        setSkillsData(defaultSkillsData);
      }
    } catch (error) {
      console.log('🔴 [COMMUNICATION SKILLS] Error fetching skills data:', error);
      setSkillsData(defaultSkillsData);
    } finally {
      setLoading(false);
    }
  };

  const getSkillDisplayName = (skill) => {
    return skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 0.7) return '#4CAF50';
    if (progress >= 0.4) return '#FF9800';
    return '#F44336';
  };

  const renderSkillProgress = (skill, progress) => (
    <View key={skill} style={styles.skillProgressCard}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName}>{getSkillDisplayName(skill)}</Text>
        <Text style={[styles.progressPercentage, { color: getProgressColor(progress) }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progress * 100}%`, 
                backgroundColor: getProgressColor(progress) 
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );

  const renderExerciseCard = (exercise) => (
    <TouchableOpacity
      key={exercise.exercise_id}
      style={styles.exerciseCard}
      onPress={() => setSelectedSkill(exercise)}
    >
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{exercise.title}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty_level) }]}>
          <Text style={styles.difficultyText}>
            {exercise.difficulty_level.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.exerciseDescription}>{exercise.description}</Text>
      
      <View style={styles.exerciseMeta}>
        <Text style={styles.exerciseTime}>⏱ {exercise.estimated_time} min</Text>
        <Text style={styles.exerciseSkill}>
          📚 {getSkillDisplayName(exercise.skill)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderExerciseDetail = () => (
    <View style={styles.detailContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSelectedSkill(null)}
      >
        <Text style={styles.backButtonText}>← Back to Skills</Text>
      </TouchableOpacity>

      <ScrollView style={styles.detailScrollView}>
        <View style={styles.exerciseDetailCard}>
          <View style={styles.exerciseDetailHeader}>
            <Text style={styles.exerciseDetailTitle}>{selectedSkill.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(selectedSkill.difficulty_level) }]}>
              <Text style={styles.difficultyText}>
                {selectedSkill.difficulty_level.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.exerciseDetailDescription}>{selectedSkill.description}</Text>

          <View style={styles.exerciseDetailMeta}>
            <Text style={styles.exerciseDetailTime}>⏱ {selectedSkill.estimated_time} minutes</Text>
            <Text style={styles.exerciseDetailSkill}>
              📚 {getSkillDisplayName(selectedSkill.skill)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {selectedSkill.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practice Scenarios</Text>
            {selectedSkill.practice_scenarios.map((scenario, index) => (
              <View key={index} style={styles.scenarioCard}>
                <Text style={styles.scenarioText}>{scenario}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startExerciseButton}
            onPress={() => {
              Alert.alert(
                'Start Exercise',
                'Ready to practice this communication skill?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Start', onPress: () => navigation.navigate('AICoachChatScreen') }
                ]
              );
            }}
          >
            <Text style={styles.startExerciseButtonText}>Start Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading communication skills...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (selectedSkill) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.gradient}
        >
          <StatusBar barStyle="light-content" />
          {renderExerciseDetail()}
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Communication Skills</Text>
            <Text style={styles.headerSubtitle}>Develop your relationship communication</Text>
          </View>

          {/* Progress Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            {Object.entries(skillsData.user_progress).map(([skill, progress]) => 
              renderSkillProgress(skill, progress)
            )}
          </View>

          {/* Recommended Exercises */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            {skillsData.recommended_exercises.map(renderExerciseCard)}
          </View>

          {/* All Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Skills</Text>
            <View style={styles.allSkillsGrid}>
              {skillsData.available_skills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={styles.skillCard}
                  onPress={() => {
                    // Filter exercises for this skill
                    const skillExercises = skillsData.recommended_exercises.filter(
                      ex => ex.skill === skill
                    );
                    if (skillExercises.length > 0) {
                      setSelectedSkill(skillExercises[0]);
                    }
                  }}
                >
                  <Text style={styles.skillCardTitle}>
                    {getSkillDisplayName(skill)}
                  </Text>
                  <Text style={styles.skillCardProgress}>
                    {Math.round(skillsData.user_progress[skill] * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
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
  skillProgressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseTime: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  exerciseSkill: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  allSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skillCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  skillCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  skillCardProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  detailContainer: {
    flex: 1,
    paddingTop: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailScrollView: {
    flex: 1,
  },
  exerciseDetailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
  },
  exerciseDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  exerciseDetailDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24,
    marginBottom: 16,
  },
  exerciseDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  exerciseDetailTime: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  exerciseDetailSkill: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 12,
    minWidth: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    flex: 1,
  },
  scenarioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  scenarioText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  startExerciseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  startExerciseButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default CommunicationSkillsScreen;
