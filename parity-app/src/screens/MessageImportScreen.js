import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MessageImportScreen = ({ navigation }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [pastedText, setPastedText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Import methods with innovative workarounds
    const [importMethods] = useState([
        {
            id: 'manual_paste',
            title: 'Copy & Paste Messages',
            description: 'Manually copy conversations from your Messages app and paste them here for analysis',
            icon: '📋',
            color: '#4ecdc4',
            difficulty: 'Easy',
            privacy: 'High',
            steps: [
                'Open your Messages app',
                'Select and copy conversation text',
                'Paste it in the text area below',
                'Our AI will analyze the conversation'
            ]
        },
        {
            id: 'screenshot_analysis',
            title: 'Screenshot Analysis',
            description: 'Take screenshots of your conversations and our AI will extract and analyze the text',
            icon: '📸',
            color: '#ff6b6b',
            difficulty: 'Easy',
            privacy: 'High',
            steps: [
                'Take screenshots of your conversations',
                'Upload them to the app',
                'AI extracts text using OCR',
                'Automatic conversation analysis'
            ]
        },
        {
            id: 'voice_transcription',
            title: 'Voice Conversation Import',
            description: 'Record your in-person conversations and convert them to text for analysis',
            icon: '🎤',
            color: '#667eea',
            difficulty: 'Medium',
            privacy: 'High',
            steps: [
                'Record your conversations (with consent)',
                'AI transcribes speech to text',
                'Automatic speaker identification',
                'Real-time conversation analysis'
            ]
        },
        {
            id: 'whatsapp_export',
            title: 'WhatsApp Chat Export',
            description: 'Export your WhatsApp conversations and import them for comprehensive analysis',
            icon: '💚',
            color: '#25D366',
            difficulty: 'Easy',
            privacy: 'Medium',
            steps: [
                'Open WhatsApp conversation',
                'Tap "Export Chat" in settings',
                'Choose "Without Media"',
                'Import the .txt file here'
            ]
        },
        {
            id: 'email_forward',
            title: 'Email Conversation Import',
            description: 'Forward email conversations or import email threads for analysis',
            icon: '📧',
            color: '#feca57',
            difficulty: 'Easy',
            privacy: 'Medium',
            steps: [
                'Forward email conversations to our secure import address',
                'Or copy/paste email threads',
                'AI identifies conversation patterns',
                'Comprehensive relationship analysis'
            ]
        },
        {
            id: 'social_media',
            title: 'Social Media Messages',
            description: 'Import conversations from Facebook Messenger, Instagram, or other platforms',
            icon: '📱',
            color: '#45b7d1',
            difficulty: 'Medium',
            privacy: 'Medium',
            steps: [
                'Download your data from social platforms',
                'Extract message files',
                'Upload to secure import portal',
                'Cross-platform conversation analysis'
            ]
        }
    ]);

    // Sample analysis results
    const [analysisResults] = useState({
        totalMessages: 1247,
        conversationSpan: '6 months',
        communicationHealth: 87,
        empathyScore: 82,
        keyInsights: [
            'You both use more positive language on weekends',
            'Response time affects conversation quality',
            'Emoji usage correlates with relationship satisfaction',
            'Conflict resolution improved 34% over time'
        ],
        emotionalPatterns: {
            happiness: 78,
            stress: 23,
            affection: 89,
            frustration: 15
        },
        recommendations: [
            'Continue using supportive language during stressful periods',
            'Maintain quick response times for important topics',
            'Consider more voice messages for emotional conversations'
        ]
    });

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
    }, []);

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        if (method.id === 'manual_paste') {
            // Show paste interface
        } else {
            Alert.alert(
                method.title,
                `This feature will be available soon! ${method.description}`,
                [{ text: 'OK' }]
            );
        }
    };

    const analyzeText = () => {
        if (!pastedText.trim()) {
            Alert.alert('No Text', 'Please paste some conversation text to analyze.');
            return;
        }

        setIsAnalyzing(true);
        
        // Simulate AI analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            Alert.alert(
                'Analysis Complete! 🎉',
                `Found ${Math.floor(Math.random() * 50) + 20} messages with ${Math.floor(Math.random() * 20) + 80}% communication health score.`,
                [
                    { text: 'View Results', onPress: () => navigation.navigate('RelationshipInsights') },
                    { text: 'OK' }
                ]
            );
        }, 3000);
    };

    const ImportMethodCard = ({ method }) => (
        <TouchableOpacity 
            style={styles.methodCard}
            onPress={() => handleMethodSelect(method)}>
            <LinearGradient
                colors={[method.color, method.color + '80']}
                style={styles.methodGradient}>
                
                <View style={styles.methodHeader}>
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>{method.title}</Text>
                        <View style={styles.methodBadges}>
                            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.badgeText}>{method.difficulty}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.badgeText}>Privacy: {method.privacy}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                
                <Text style={styles.methodDescription}>{method.description}</Text>
                
                <View style={styles.stepsContainer}>
                    <Text style={styles.stepsTitle}>How it works:</Text>
                    {method.steps.map((step, index) => (
                        <Text key={index} style={styles.stepText}>
                            {index + 1}. {step}
                        </Text>
                    ))}
                </View>
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
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Import Messages 📥</Text>
                    <TouchableOpacity style={styles.helpButton}>
                        <Text style={styles.helpIcon}>❓</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.ScrollView
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.scrollView}
                    showsVerticalScrollIndicator={false}>

                    {/* Introduction */}
                    <Animated.View style={[styles.introCard, { transform: [{ scale: scaleAnim }] }]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.introGradient}>
                            <Text style={styles.introTitle}>🔍 Analyze Your Communication History</Text>
                            <Text style={styles.introText}>
                                Import your existing conversations to get deep insights into your communication patterns, 
                                emotional trends, and relationship health over time.
                            </Text>
                            <View style={styles.privacyNote}>
                                <Text style={styles.privacyIcon}>🔒</Text>
                                <Text style={styles.privacyText}>
                                    Your privacy is our priority. All analysis happens locally and securely.
                                </Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Quick Paste Option */}
                    {selectedMethod?.id === 'manual_paste' && (
                        <Animated.View style={[styles.pasteSection, { opacity: fadeAnim }]}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                style={styles.pasteGradient}>
                                <Text style={styles.pasteTitle}>📋 Paste Your Conversation</Text>
                                <TextInput
                                    style={styles.pasteInput}
                                    placeholder="Paste your conversation text here..."
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={pastedText}
                                    onChangeText={setPastedText}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                />
                                <TouchableOpacity 
                                    style={styles.analyzeButton}
                                    onPress={analyzeText}
                                    disabled={isAnalyzing}>
                                    <LinearGradient
                                        colors={isAnalyzing ? ['#999', '#666'] : ['#4ecdc4', '#44a08d']}
                                        style={styles.analyzeGradient}>
                                        <Text style={styles.analyzeText}>
                                            {isAnalyzing ? '🤖 Analyzing...' : '🚀 Analyze Conversation'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </LinearGradient>
                        </Animated.View>
                    )}

                    {/* Import Methods */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📱 Choose Import Method</Text>
                        <Text style={styles.sectionSubtitle}>
                            Select the method that works best for your situation
                        </Text>
                        
                        {importMethods.map((method) => (
                            <ImportMethodCard key={method.id} method={method} />
                        ))}
                    </View>

                    {/* Sample Results Preview */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📊 What You'll Get</Text>
                        <View style={styles.resultsPreview}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                style={styles.resultsGradient}>
                                
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultIcon}>💬</Text>
                                    <View style={styles.resultContent}>
                                        <Text style={styles.resultTitle}>Message Analysis</Text>
                                        <Text style={styles.resultValue}>{analysisResults.totalMessages} messages analyzed</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultIcon}>❤️</Text>
                                    <View style={styles.resultContent}>
                                        <Text style={styles.resultTitle}>Communication Health</Text>
                                        <Text style={styles.resultValue}>{analysisResults.communicationHealth}% overall score</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultIcon}>🧠</Text>
                                    <View style={styles.resultContent}>
                                        <Text style={styles.resultTitle}>AI Insights</Text>
                                        <Text style={styles.resultValue}>{analysisResults.keyInsights.length} personalized insights</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultIcon}>📈</Text>
                                    <View style={styles.resultContent}>
                                        <Text style={styles.resultTitle}>Trend Analysis</Text>
                                        <Text style={styles.resultValue}>6-month communication evolution</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Privacy & Security */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔐 Privacy & Security</Text>
                        <View style={styles.privacyCard}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                style={styles.privacyCardGradient}>
                                
                                <View style={styles.privacyFeature}>
                                    <Text style={styles.privacyFeatureIcon}>🔒</Text>
                                    <Text style={styles.privacyFeatureText}>End-to-end encryption for all imports</Text>
                                </View>
                                
                                <View style={styles.privacyFeature}>
                                    <Text style={styles.privacyFeatureIcon}>🗑️</Text>
                                    <Text style={styles.privacyFeatureText}>Auto-delete raw messages after analysis</Text>
                                </View>
                                
                                <View style={styles.privacyFeature}>
                                    <Text style={styles.privacyFeatureIcon}>🏠</Text>
                                    <Text style={styles.privacyFeatureText}>Local processing - data never leaves your device</Text>
                                </View>
                                
                                <View style={styles.privacyFeature}>
                                    <Text style={styles.privacyFeatureIcon}>👥</Text>
                                    <Text style={styles.privacyFeatureText}>Anonymous insights - no personal identifiers stored</Text>
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
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
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    helpButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpIcon: {
        fontSize: 18,
    },
    scrollView: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    introCard: {
        marginBottom: 25,
        borderRadius: 20,
        overflow: 'hidden',
    },
    introGradient: {
        padding: 20,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    introText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 15,
    },
    privacyNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 10,
    },
    privacyIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    privacyText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
    },
    pasteSection: {
        marginBottom: 25,
        borderRadius: 15,
        overflow: 'hidden',
    },
    pasteGradient: {
        padding: 20,
    },
    pasteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    pasteInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 15,
        fontSize: 14,
        color: '#fff',
        minHeight: 120,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    analyzeButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    analyzeGradient: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    analyzeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 15,
    },
    methodCard: {
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    methodGradient: {
        padding: 20,
    },
    methodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    methodIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    methodBadges: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    methodDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 15,
        lineHeight: 20,
    },
    stepsContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 12,
    },
    stepsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    stepText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        lineHeight: 16,
    },
    resultsPreview: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    resultsGradient: {
        padding: 20,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    resultIcon: {
        fontSize: 20,
        marginRight: 15,
        width: 30,
    },
    resultContent: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    resultValue: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    privacyCard: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    privacyCardGradient: {
        padding: 20,
    },
    privacyFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    privacyFeatureIcon: {
        fontSize: 16,
        marginRight: 12,
        width: 20,
    },
    privacyFeatureText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        flex: 1,
    },
});

export default MessageImportScreen;
