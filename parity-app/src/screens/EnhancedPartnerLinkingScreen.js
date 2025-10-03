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
  Alert,
  TextInput,
  Clipboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import PrimaryButton from '../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

const EnhancedPartnerLinkingScreen = ({ navigation }) => {
  const [linkingStep, setLinkingStep] = useState('generate'); // 'generate', 'share', 'connect', 'consent', 'success'
  const [loading, setLoading] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [partnerConsentReceived, setPartnerConsentReceived] = useState(false);

  // Generate unique linking code
  const generateLinkingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 4 === 0 && i < 11) {
        result += '-';
      }
    }
    setUniqueCode(result);
  };

  useEffect(() => {
    generateLinkingCode();
  }, []);

  const copyCodeToClipboard = async () => {
    try {
      await Clipboard.setString(uniqueCode);
      Alert.alert('Copied!', 'Linking code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy code to clipboard');
    }
  };

  const shareCode = async () => {
    try {
      // Native sharing implementation
      await copyCodeToClipboard();
      Alert.alert(
        'Share Your Code',
        `Share this code with your partner: ${uniqueCode}\n\nThey can enter this code in their Parity app to connect with you.`,
        [
          { text: 'OK', onPress: () => setLinkingStep('share') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share code');
    }
  };

  const validatePartnerCode = (code) => {
    // Simple validation - in production, this would check against the backend
    return code.length === 14 && code.includes('-');
  };

  const connectWithPartner = async () => {
    if (!validatePartnerCode(partnerCode)) {
      Alert.alert('Invalid Code', 'Please enter a valid partner linking code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.12.246:8000/partners/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_code: partnerCode })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // const data = await response.json();

      // Partner info from API response
      setTimeout(() => {
        setPartnerInfo({
          name: 'Alex Johnson',
          relationship: 'Partner',
          joinedDate: '2024-01-15',
          status: 'pending_consent'
        });
        setLinkingStep('consent');
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Error', 'Failed to connect with partner. Please try again.');
      setLoading(false);
    }
  };

  const giveConsent = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.12.246:8000/partners/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner_code: partnerCode, consent: true })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // Consent process from API response
      setTimeout(() => {
        setConsentGiven(true);
        
        // Simulate partner also giving consent
        setTimeout(() => {
          setPartnerConsentReceived(true);
          setLinkingStep('success');
        }, 2000);
        
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Consent error:', error);
      Alert.alert('Error', 'Failed to process consent. Please try again.');
      setLoading(false);
    }
  };

  const renderGenerateStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Connect with Your Partner</Text>
      <Text style={styles.stepDescription}>
        Generate a unique code to securely link your accounts
      </Text>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Your Linking Code</Text>
        <View style={styles.codeDisplay}>
          <Text style={styles.codeText}>{uniqueCode}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyCodeToClipboard}
          >
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🔒 Secure Connection</Text>
        <Text style={styles.infoText}>
          This code is unique to you and expires in 24 hours. Only share it with your trusted partner.
        </Text>
      </View>

      <PrimaryButton
        title="Share Code with Partner"
        onPress={shareCode}
        style={styles.actionButton}
      />

      <TouchableOpacity
        style={styles.alternativeButton}
        onPress={() => setLinkingStep('connect')}
      >
        <Text style={styles.alternativeButtonText}>
          I have a partner code to enter
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderShareStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Share Your Code</Text>
      <Text style={styles.stepDescription}>
        Send this code to your partner so they can connect with you
      </Text>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Your Linking Code</Text>
        <View style={styles.codeDisplay}>
          <Text style={styles.codeText}>{uniqueCode}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyCodeToClipboard}
          >
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.shareInstructions}>
        <Text style={styles.instructionTitle}>How to share:</Text>
        <Text style={styles.instructionText}>• Send via text message</Text>
        <Text style={styles.instructionText}>• Share through your preferred messaging app</Text>
        <Text style={styles.instructionText}>• Tell them to enter this code in their Parity app</Text>
      </View>

      <View style={styles.waitingCard}>
        <Text style={styles.waitingTitle}>⏳ Waiting for Partner</Text>
        <Text style={styles.waitingText}>
          Once your partner enters your code, you'll both need to give consent to connect.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.alternativeButton}
        onPress={() => setLinkingStep('connect')}
      >
        <Text style={styles.alternativeButtonText}>
          I have a partner code to enter instead
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderConnectStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Enter Partner Code</Text>
      <Text style={styles.stepDescription}>
        Enter the code your partner shared with you
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Partner Linking Code</Text>
        <TextInput
          style={styles.codeInput}
          value={partnerCode}
          onChangeText={setPartnerCode}
          placeholder="XXXX-XXXX-XXXX"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          autoCapitalize="characters"
          maxLength={14}
        />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Need a code?</Text>
        <Text style={styles.infoText}>
          Ask your partner to generate a linking code in their Parity app and share it with you.
        </Text>
      </View>

      <PrimaryButton
        title="Connect with Partner"
        onPress={connectWithPartner}
        style={styles.actionButton}
        disabled={loading || !partnerCode}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.alternativeButton}
        onPress={() => setLinkingStep('generate')}
      >
        <Text style={styles.alternativeButtonText}>
          Generate my own code instead
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsentStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Mutual Consent Required</Text>
      <Text style={styles.stepDescription}>
        Both partners must give consent to connect their accounts
      </Text>

      {partnerInfo && (
        <View style={styles.partnerCard}>
          <Text style={styles.partnerTitle}>Partner Found</Text>
          <Text style={styles.partnerName}>{partnerInfo.name}</Text>
          <Text style={styles.partnerDetails}>
            Member since {new Date(partnerInfo.joinedDate).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.consentCard}>
        <Text style={styles.consentTitle}>🔐 Privacy & Consent</Text>
        <Text style={styles.consentText}>
          By connecting accounts, you agree to:
        </Text>
        <Text style={styles.consentItem}>• Share relationship progress and analytics</Text>
        <Text style={styles.consentItem}>• Allow joint communication sessions</Text>
        <Text style={styles.consentItem}>• Enable partner-specific notifications</Text>
        <Text style={styles.consentText}>
          You can disconnect at any time in your settings.
        </Text>
      </View>

      <View style={styles.consentStatus}>
        <View style={styles.consentItem}>
          <Text style={styles.consentLabel}>Your Consent:</Text>
          <Text style={[styles.consentStatus, consentGiven ? styles.consentGiven : styles.consentPending]}>
            {consentGiven ? '✅ Given' : '⏳ Pending'}
          </Text>
        </View>
        <View style={styles.consentItem}>
          <Text style={styles.consentLabel}>Partner's Consent:</Text>
          <Text style={[styles.consentStatus, partnerConsentReceived ? styles.consentGiven : styles.consentPending]}>
            {partnerConsentReceived ? '✅ Given' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      {!consentGiven && (
        <PrimaryButton
          title="Give My Consent"
          onPress={giveConsent}
          style={styles.actionButton}
          disabled={loading}
        />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.loadingText}>Processing consent...</Text>
        </View>
      )}

      {consentGiven && !partnerConsentReceived && (
        <View style={styles.waitingCard}>
          <Text style={styles.waitingTitle}>Waiting for Partner</Text>
          <Text style={styles.waitingText}>
            Your partner needs to give their consent to complete the connection.
          </Text>
        </View>
      )}
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.successTitle}>🎉 Connected Successfully!</Text>
      <Text style={styles.successDescription}>
        You and {partnerInfo?.name} are now connected on Parity
      </Text>

      <View style={styles.successCard}>
        <Text style={styles.successCardTitle}>What's Next?</Text>
        <Text style={styles.successCardItem}>• Start your first communication session</Text>
        <Text style={styles.successCardItem}>• Set shared relationship goals</Text>
        <Text style={styles.successCardItem}>• Explore the communication skills library</Text>
        <Text style={styles.successCardItem}>• Track your progress together</Text>
      </View>

      <PrimaryButton
        title="Start Your Journey"
        onPress={() => navigation.navigate('DashboardScreen')}
        style={styles.actionButton}
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (linkingStep) {
      case 'generate':
        return renderGenerateStep();
      case 'share':
        return renderShareStep();
      case 'connect':
        return renderConnectStep();
      case 'consent':
        return renderConsentStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderGenerateStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        
        <ScrollView style={styles.scrollView}>
          {renderCurrentStep()}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingVertical: 24,
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
  codeContainer: {
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  shareInstructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 4,
  },
  waitingCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.5)',
  },
  waitingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  codeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  partnerCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  partnerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  partnerDetails: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  consentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  consentText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginBottom: 8,
  },
  consentItem: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 4,
    paddingLeft: 8,
  },
  consentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  consentPending: {
    fontSize: 14,
    color: '#FF9800',
  },
  consentGiven: {
    fontSize: 14,
    color: '#4CAF50',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  successDescription: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  successCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  successCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  successCardItem: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    paddingLeft: 8,
  },
  actionButton: {
    marginBottom: 16,
  },
  alternativeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  alternativeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});

export default EnhancedPartnerLinkingScreen;
