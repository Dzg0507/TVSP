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
import StyledTextInput from '../components/StyledTextInput';
import PrimaryButton from '../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

const EnhancedOnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Welcome & Account Creation
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 2: Personal Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  
  // Step 3: Goals & Preferences
  const [communicationGoals, setCommunicationGoals] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [timeCommitment, setTimeCommitment] = useState('');
  
  // Step 4: Notification Preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  const totalSteps = 4;

  const relationshipStatusOptions = [
    { key: 'single', label: 'Single', description: 'Not currently in a relationship' },
    { key: 'dating', label: 'Dating', description: 'In a dating relationship' },
    { key: 'committed', label: 'Committed', description: 'In a committed relationship' },
    { key: 'married', label: 'Married', description: 'Married or in a marriage-like partnership' },
    { key: 'other', label: 'Other', description: 'Other relationship status' }
  ];

  const goalOptions = [
    { id: 'improve_communication', label: 'Improve Communication', description: 'Better express needs and listen actively' },
    { id: 'resolve_conflicts', label: 'Resolve Conflicts', description: 'Handle disagreements constructively' },
    { id: 'increase_intimacy', label: 'Increase Intimacy', description: 'Deepen emotional and physical connection' },
    { id: 'build_trust', label: 'Build Trust', description: 'Strengthen trust and security in relationship' },
    { id: 'manage_stress', label: 'Manage Stress', description: 'Handle life stress together effectively' },
    { id: 'personal_growth', label: 'Personal Growth', description: 'Develop as an individual within the relationship' }
  ];

  const experienceLevels = [
    { key: 'beginner', label: 'Beginner', description: 'New to relationship coaching and communication tools' },
    { key: 'intermediate', label: 'Intermediate', description: 'Some experience with relationship improvement' },
    { key: 'advanced', label: 'Advanced', description: 'Experienced with relationship coaching and therapy' }
  ];

  const timeCommitments = [
    { key: 'light', label: 'Light (5-10 min/day)', description: 'Quick daily check-ins and tips' },
    { key: 'moderate', label: 'Moderate (15-30 min/day)', description: 'Regular sessions and practice exercises' },
    { key: 'intensive', label: 'Intensive (30+ min/day)', description: 'Comprehensive daily practice and reflection' }
  ];

  const validateStep1 = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name');
      return false;
    }
    if (!age || isNaN(age) || parseInt(age) < 18 || parseInt(age) > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 18 and 100');
      return false;
    }
    if (!relationshipStatus) {
      Alert.alert('Missing Information', 'Please select your relationship status');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (communicationGoals.length === 0) {
      Alert.alert('Missing Goals', 'Please select at least one communication goal');
      return false;
    }
    if (!experienceLevel) {
      Alert.alert('Missing Information', 'Please select your experience level');
      return false;
    }
    if (!timeCommitment) {
      Alert.alert('Missing Information', 'Please select your time commitment preference');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCompleteOnboarding();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // API calls will be implemented
      const userData = {
        email,
        password,
        firstName,
        lastName,
        age: parseInt(age),
        relationshipStatus,
        communicationGoals,
        experienceLevel,
        timeCommitment,
        notificationPreferences: {
          pushNotifications,
          emailNotifications,
          sessionReminders,
          quietHoursStart,
          quietHoursEnd
        }
      };

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Onboarding completed:', userData);
      
      // Navigate to appropriate screen based on relationship status
      if (relationshipStatus === 'single') {
        navigation.navigate('DashboardScreen');
      } else {
        navigation.navigate('PartnerLinkingScreen');
      }
      
    } catch (error) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = (goalId) => {
    setCommunicationGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 <= currentStep && styles.stepDotActive
          ]}
        />
      ))}
      <Text style={styles.stepText}>{currentStep} of {totalSteps}</Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Your Account</Text>
      <Text style={styles.stepDescription}>
        Let's start by setting up your account with Parity
      </Text>

      <StyledTextInput
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <StyledTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <StyledTextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.termsText}>
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell Us About Yourself</Text>
      <Text style={styles.stepDescription}>
        Help us personalize your experience
      </Text>

      <View style={styles.nameRow}>
        <StyledTextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={[styles.input, styles.halfInput]}
        />
        <StyledTextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={[styles.input, styles.halfInput]}
        />
      </View>

      <StyledTextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Relationship Status</Text>
      {relationshipStatusOptions.map((status) => (
        <TouchableOpacity
          key={status.key}
          style={[
            styles.optionCard,
            relationshipStatus === status.key && styles.selectedOption
          ]}
          onPress={() => setRelationshipStatus(status.key)}
        >
          <Text style={[
            styles.optionTitle,
            relationshipStatus === status.key && styles.selectedOptionText
          ]}>
            {status.label}
          </Text>
          <Text style={[
            styles.optionDescription,
            relationshipStatus === status.key && styles.selectedOptionDescription
          ]}>
            {status.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your Communication Goals</Text>
      <Text style={styles.stepDescription}>
        What would you like to improve in your relationships?
      </Text>

      <Text style={styles.sectionTitle}>Select Your Goals</Text>
      {goalOptions.map((goal) => (
        <TouchableOpacity
          key={goal.id}
          style={[
            styles.optionCard,
            communicationGoals.includes(goal.id) && styles.selectedOption
          ]}
          onPress={() => toggleGoal(goal.id)}
        >
          <Text style={[
            styles.optionTitle,
            communicationGoals.includes(goal.id) && styles.selectedOptionText
          ]}>
            {goal.label}
          </Text>
          <Text style={[
            styles.optionDescription,
            communicationGoals.includes(goal.id) && styles.selectedOptionDescription
          ]}>
            {goal.description}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Experience Level</Text>
      {experienceLevels.map((level) => (
        <TouchableOpacity
          key={level.key}
          style={[
            styles.optionCard,
            experienceLevel === level.key && styles.selectedOption
          ]}
          onPress={() => setExperienceLevel(level.key)}
        >
          <Text style={[
            styles.optionTitle,
            experienceLevel === level.key && styles.selectedOptionText
          ]}>
            {level.label}
          </Text>
          <Text style={[
            styles.optionDescription,
            experienceLevel === level.key && styles.selectedOptionDescription
          ]}>
            {level.description}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Time Commitment</Text>
      {timeCommitments.map((commitment) => (
        <TouchableOpacity
          key={commitment.key}
          style={[
            styles.optionCard,
            timeCommitment === commitment.key && styles.selectedOption
          ]}
          onPress={() => setTimeCommitment(commitment.key)}
        >
          <Text style={[
            styles.optionTitle,
            timeCommitment === commitment.key && styles.selectedOptionText
          ]}>
            {commitment.label}
          </Text>
          <Text style={[
            styles.optionDescription,
            timeCommitment === commitment.key && styles.selectedOptionDescription
          ]}>
            {commitment.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Notification Preferences</Text>
      <Text style={styles.stepDescription}>
        Choose how you'd like to receive updates and reminders
      </Text>

      <View style={styles.notificationOption}>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>Push Notifications</Text>
          <Text style={styles.notificationDescription}>
            Receive real-time updates and reminders
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, pushNotifications && styles.toggleActive]}
          onPress={() => setPushNotifications(!pushNotifications)}
        >
          <View style={[styles.toggleThumb, pushNotifications && styles.toggleThumbActive]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationOption}>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>Email Notifications</Text>
          <Text style={styles.notificationDescription}>
            Receive weekly summaries and important updates
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, emailNotifications && styles.toggleActive]}
          onPress={() => setEmailNotifications(!emailNotifications)}
        >
          <View style={[styles.toggleThumb, emailNotifications && styles.toggleThumbActive]} />
        </TouchableOpacity>
      </View>

      <View style={styles.notificationOption}>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>Session Reminders</Text>
          <Text style={styles.notificationDescription}>
            Get reminded about scheduled communication sessions
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, sessionReminders && styles.toggleActive]}
          onPress={() => setSessionReminders(!sessionReminders)}
        >
          <View style={[styles.toggleThumb, sessionReminders && styles.toggleThumbActive]} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Quiet Hours</Text>
      <Text style={styles.quietHoursDescription}>
        Set times when you don't want to receive notifications
      </Text>

      <View style={styles.quietHoursRow}>
        <View style={styles.quietHoursInput}>
          <Text style={styles.quietHoursLabel}>Start Time</Text>
          <StyledTextInput
            value={quietHoursStart}
            onChangeText={setQuietHoursStart}
            placeholder="22:00"
            style={styles.input}
          />
        </View>
        <View style={styles.quietHoursInput}>
          <Text style={styles.quietHoursLabel}>End Time</Text>
          <StyledTextInput
            value={quietHoursEnd}
            onChangeText={setQuietHoursEnd}
            placeholder="08:00"
            style={styles.input}
          />
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        {renderStepIndicator()}
        
        <ScrollView style={styles.scrollView}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <PrimaryButton
            title={currentStep === totalSteps ? 'Complete Setup' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
            disabled={loading}
          />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: '#FFFFFF',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  input: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  termsText: {
    fontSize: 12,
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedOptionText: {
    color: '#4CAF50',
  },
  optionDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  selectedOptionDescription: {
    color: '#B0E0B0',
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  quietHoursDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 16,
    lineHeight: 20,
  },
  quietHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quietHoursInput: {
    width: '48%',
  },
  quietHoursLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  previousButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
  },
  previousButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default EnhancedOnboardingScreen;
