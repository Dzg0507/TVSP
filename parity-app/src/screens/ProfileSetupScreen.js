import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text, Switch, StyleSheet, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const ProfileSetupScreen = ({ navigation }) => {
  const [isCoupleUse, setIsCoupleUse] = useState(false);
  const [goal, setGoal] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [rotateAnim] = useState(new Animated.Value(0));

  const interests = [
    { id: 1, name: 'Communication', emoji: '💬', color: '#ff6b6b' },
    { id: 2, name: 'Relationships', emoji: '💕', color: '#4ecdc4' },
    { id: 3, name: 'Personal Growth', emoji: '🌱', color: '#45b7d1' },
    { id: 4, name: 'Mindfulness', emoji: '🧘‍♀️', color: '#96ceb4' },
    { id: 5, name: 'Conflict Resolution', emoji: '🤝', color: '#feca57' },
    { id: 6, name: 'Emotional Intelligence', emoji: '🧠', color: '#ff9ff3' },
  ];

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleContinue = () => {
    console.log('Profile Setup Data:', { 
      name, 
      age, 
      useType: isCoupleUse ? 'couple' : 'individual', 
      goal,
      interests: selectedInterests 
    });
    if (isCoupleUse) {
      navigation.navigate('PartnerLinking');
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      const isSelected = prev.find(item => item.id === interest.id);
      if (isSelected) {
        return prev.filter(item => item.id !== interest.id);
      } else {
        return [...prev, interest];
      }
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Gradient Background */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb', '#43e97b']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Elements */}
      <Animated.View style={[styles.floatingElement, styles.element1, { transform: [{ rotate: spin }] }]} />
      <Animated.View style={[styles.floatingElement, styles.element2]} />
      <Animated.View style={[styles.floatingElement, styles.element3]} />
      
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          contentContainerStyle={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <Animated.View style={[styles.header, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.title}>Let's Get to Know You! 🌟</Text>
            <Text style={styles.subtitle}>Help us personalize your amazing journey</Text>
          </Animated.View>

          {/* Main Card */}
          <Animated.View style={[styles.glassCard, { transform: [{ scale: scaleAnim }] }]}>
            
            {/* Personal Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Personal Information</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <View style={styles.modernInput}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Your name"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>
                
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <View style={styles.modernInput}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="25"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Usage Type Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💫 How are you using Parity?</Text>
              
              <View style={styles.toggleContainer}>
                <TouchableOpacity 
                  style={[styles.toggleOption, !isCoupleUse && styles.activeToggle]}
                  onPress={() => setIsCoupleUse(false)}>
                  <LinearGradient
                    colors={!isCoupleUse ? ['#ff6b6b', '#ee5a24'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.toggleGradient}>
                    <Text style={styles.toggleEmoji}>🧘‍♀️</Text>
                    <Text style={[styles.toggleText, !isCoupleUse && styles.activeToggleText]}>
                      Individually
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.toggleOption, isCoupleUse && styles.activeToggle]}
                  onPress={() => setIsCoupleUse(true)}>
                  <LinearGradient
                    colors={isCoupleUse ? ['#4ecdc4', '#44a08d'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.toggleGradient}>
                    <Text style={styles.toggleEmoji}>💕</Text>
                    <Text style={[styles.toggleText, isCoupleUse && styles.activeToggleText]}>
                      With Partner
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Interests Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 What interests you most?</Text>
              <Text style={styles.sectionSubtitle}>Select all that apply</Text>
              
              <View style={styles.interestsGrid}>
                {interests.map((interest) => {
                  const isSelected = selectedInterests.find(item => item.id === interest.id);
                  return (
                    <TouchableOpacity
                      key={interest.id}
                      style={styles.interestChip}
                      onPress={() => toggleInterest(interest)}>
                      <LinearGradient
                        colors={isSelected ? [interest.color, interest.color + '80'] : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                        style={styles.interestGradient}>
                        <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                        <Text style={[styles.interestText, isSelected && styles.selectedInterestText]}>
                          {interest.name}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Goal Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Your Communication Goal</Text>
              <View style={styles.goalInputContainer}>
                <TextInput
                  style={styles.goalInput}
                  placeholder="e.g., 'To listen more actively' or 'To navigate disagreements more constructively'"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={goal}
                  onChangeText={setGoal}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24', '#ff9ff3']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.buttonText}>Continue Your Journey ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.ScrollView>
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
  floatingElement: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  element1: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    top: -30,
    right: -30,
  },
  element2: {
    width: 100,
    height: 100,
    backgroundColor: '#4ecdc4',
    bottom: 150,
    left: -20,
  },
  element3: {
    width: 80,
    height: 80,
    backgroundColor: '#ffe66d',
    top: height * 0.4,
    right: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 25,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    flex: 0.48,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginLeft: 4,
  },
  modernInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textInput: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleOption: {
    flex: 0.48,
    borderRadius: 15,
    overflow: 'hidden',
  },
  toggleGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  toggleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  activeToggleText: {
    color: '#fff',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestChip: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  interestGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  selectedInterestText: {
    color: '#fff',
  },
  goalInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minHeight: 100,
  },
  goalInput: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlignVertical: 'top',
    flex: 1,
  },
  continueButton: {
    marginTop: 10,
    borderRadius: 15,
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(255, 107, 107, 0.3)',
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  },
});

export default ProfileSetupScreen;