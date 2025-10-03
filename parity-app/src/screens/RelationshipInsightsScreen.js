import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const RelationshipInsightsScreen = ({ navigation }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(30));
    const [scaleAnim] = useState(new Animated.Value(0.9));
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [selectedMetric, setSelectedMetric] = useState('overall');

    // Revolutionary relationship analytics data
    const [insights] = useState({
        overall: {
            communicationHealth: 92,
            empathyScore: 88,
            conflictResolution: 85,
            emotionalConnection: 90,
            trend: 'improving'
        },
        weekly: {
            conversationsAnalyzed: 47,
            averageEmpathyScore: 86,
            positiveInteractions: 89,
            conflictsResolved: 3,
            improvementAreas: ['Active Listening', 'Emotional Validation']
        },
        patterns: {
            bestCommunicationTimes: ['Morning (8-10 AM)', 'Evening (7-9 PM)'],
            commonTriggers: ['Work Stress', 'Household Tasks', 'Social Plans'],
            successfulStrategies: ['Taking Breaks', 'Using "I" Statements', 'Active Listening'],
            emotionalTrends: {
                happiness: 78,
                stress: 32,
                connection: 85,
                satisfaction: 91
            }
        },
        predictions: {
            relationshipStrength: 'Strong and Growing',
            riskFactors: ['Communication during stress'],
            opportunities: ['Weekend quality time', 'Shared goal setting'],
            nextMilestone: '95% Communication Health by next month'
        }
    });

    // AI-generated personalized recommendations
    const [recommendations] = useState([
        {
            id: 1,
            type: 'immediate',
            priority: 'high',
            title: 'Schedule Quality Time',
            description: 'Your connection scores are highest during uninterrupted conversations. Plan 30 minutes of device-free time this weekend.',
            impact: 'Could improve connection by 15%',
            action: 'Schedule Now',
            icon: '💕',
            color: '#ff6b6b'
        },
        {
            id: 2,
            type: 'skill_building',
            priority: 'medium',
            title: 'Practice Active Listening',
            description: 'Your partner feels most heard when you ask follow-up questions. Try the "Tell me more" technique.',
            impact: 'Could boost empathy score by 12%',
            action: 'Learn Technique',
            icon: '👂',
            color: '#4ecdc4'
        },
        {
            id: 3,
            type: 'prevention',
            priority: 'medium',
            title: 'Stress Management Strategy',
            description: 'Communication quality drops 23% during high-stress periods. Create a stress signal system.',
            impact: 'Could prevent 80% of stress-related conflicts',
            action: 'Create System',
            icon: '🧘‍♀️',
            color: '#45b7d1'
        }
    ]);

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

    const MetricCard = ({ title, value, trend, color, subtitle }) => (
        <View style={styles.metricCard}>
            <LinearGradient
                colors={[color, color + '80']}
                style={styles.metricGradient}>
                <View style={styles.metricHeader}>
                    <Text style={styles.metricTitle}>{title}</Text>
                    <View style={[styles.trendIndicator, { backgroundColor: trend === 'improving' ? '#4ecdc4' : trend === 'stable' ? '#feca57' : '#ff6b6b' }]}>
                        <Text style={styles.trendIcon}>
                            {trend === 'improving' ? '↗️' : trend === 'stable' ? '→' : '↘️'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.metricValue}>{value}%</Text>
                {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
                
                {/* Progress bar */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${value}%` }]} />
                </View>
            </LinearGradient>
        </View>
    );

    const InsightCard = ({ insight }) => (
        <View style={styles.insightCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.insightGradient}>
                <View style={styles.insightHeader}>
                    <Text style={styles.insightIcon}>{insight.icon}</Text>
                    <View style={styles.insightTitleContainer}>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: insight.priority === 'high' ? '#ff6b6b' : '#feca57' }]}>
                            <Text style={styles.priorityText}>{insight.priority}</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                <Text style={styles.insightImpact}>{insight.impact}</Text>
                <TouchableOpacity style={styles.actionButton}>
                    <LinearGradient
                        colors={[insight.color, insight.color + '80']}
                        style={styles.actionGradient}>
                        <Text style={styles.actionText}>{insight.action}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );

    const PatternItem = ({ icon, title, items, color }) => (
        <View style={styles.patternItem}>
            <View style={styles.patternHeader}>
                <Text style={styles.patternIcon}>{icon}</Text>
                <Text style={styles.patternTitle}>{title}</Text>
            </View>
            <View style={styles.patternList}>
                {items.map((item, index) => (
                    <View key={index} style={[styles.patternTag, { backgroundColor: color + '20', borderColor: color }]}>
                        <Text style={[styles.patternTagText, { color }]}>{item}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const EmotionalTrendBar = ({ emotion, percentage, color }) => (
        <View style={styles.emotionalTrendItem}>
            <View style={styles.emotionHeader}>
                <Text style={styles.emotionLabel}>{emotion}</Text>
                <Text style={styles.emotionPercentage}>{percentage}%</Text>
            </View>
            <View style={styles.emotionBar}>
                <LinearGradient
                    colors={[color, color + '80']}
                    style={[styles.emotionFill, { width: `${percentage}%` }]}
                />
            </View>
        </View>
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
                    <Text style={styles.headerTitle}>Relationship Insights 📊</Text>
                    <TouchableOpacity style={styles.shareButton}>
                        <Text style={styles.shareIcon}>📤</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.ScrollView
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
                    contentContainerStyle={styles.scrollView}
                    showsVerticalScrollIndicator={false}>

                    {/* Overall Health Score */}
                    <Animated.View style={[styles.healthScoreCard, { transform: [{ scale: scaleAnim }] }]}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.healthScoreGradient}>
                            <Text style={styles.healthScoreTitle}>Relationship Health Score</Text>
                            <Text style={styles.healthScoreValue}>{insights.overall.communicationHealth}%</Text>
                            <Text style={styles.healthScoreSubtitle}>Excellent - Keep it up! 🎉</Text>
                            
                            <View style={styles.healthScoreBreakdown}>
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreLabel}>Empathy</Text>
                                    <Text style={styles.scoreValue}>{insights.overall.empathyScore}%</Text>
                                </View>
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreLabel}>Connection</Text>
                                    <Text style={styles.scoreValue}>{insights.overall.emotionalConnection}%</Text>
                                </View>
                                <View style={styles.scoreItem}>
                                    <Text style={styles.scoreLabel}>Resolution</Text>
                                    <Text style={styles.scoreValue}>{insights.overall.conflictResolution}%</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Key Metrics */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📈 Key Metrics</Text>
                        <View style={styles.metricsGrid}>
                            <MetricCard
                                title="Communication Health"
                                value={insights.overall.communicationHealth}
                                trend="improving"
                                color="#4ecdc4"
                                subtitle="Up 5% this week"
                            />
                            <MetricCard
                                title="Empathy Score"
                                value={insights.overall.empathyScore}
                                trend="improving"
                                color="#ff6b6b"
                                subtitle="Consistent growth"
                            />
                        </View>
                    </View>

                    {/* Emotional Trends */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💭 Emotional Trends</Text>
                        <View style={styles.emotionalTrendsCard}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                style={styles.emotionalTrendsGradient}>
                                <EmotionalTrendBar emotion="Happiness" percentage={insights.patterns.emotionalTrends.happiness} color="#feca57" />
                                <EmotionalTrendBar emotion="Connection" percentage={insights.patterns.emotionalTrends.connection} color="#4ecdc4" />
                                <EmotionalTrendBar emotion="Satisfaction" percentage={insights.patterns.emotionalTrends.satisfaction} color="#45b7d1" />
                                <EmotionalTrendBar emotion="Stress" percentage={insights.patterns.emotionalTrends.stress} color="#ff6b6b" />
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Communication Patterns */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔍 Communication Patterns</Text>
                        <View style={styles.patternsCard}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                style={styles.patternsGradient}>
                                <PatternItem
                                    icon="⏰"
                                    title="Best Communication Times"
                                    items={insights.patterns.bestCommunicationTimes}
                                    color="#4ecdc4"
                                />
                                <PatternItem
                                    icon="⚠️"
                                    title="Common Triggers"
                                    items={insights.patterns.commonTriggers}
                                    color="#ff6b6b"
                                />
                                <PatternItem
                                    icon="✅"
                                    title="Successful Strategies"
                                    items={insights.patterns.successfulStrategies}
                                    color="#96ceb4"
                                />
                            </LinearGradient>
                        </View>
                    </View>

                    {/* AI Recommendations */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
                        <Text style={styles.sectionSubtitle}>Personalized suggestions based on your patterns</Text>
                        {recommendations.map((recommendation) => (
                            <InsightCard key={recommendation.id} insight={recommendation} />
                        ))}
                    </View>

                    {/* Future Predictions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔮 Relationship Forecast</Text>
                        <View style={styles.predictionCard}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                style={styles.predictionGradient}>
                                <View style={styles.predictionItem}>
                                    <Text style={styles.predictionIcon}>💪</Text>
                                    <View style={styles.predictionContent}>
                                        <Text style={styles.predictionTitle}>Relationship Strength</Text>
                                        <Text style={styles.predictionValue}>{insights.predictions.relationshipStrength}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.predictionItem}>
                                    <Text style={styles.predictionIcon}>🎯</Text>
                                    <View style={styles.predictionContent}>
                                        <Text style={styles.predictionTitle}>Next Milestone</Text>
                                        <Text style={styles.predictionValue}>{insights.predictions.nextMilestone}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.predictionItem}>
                                    <Text style={styles.predictionIcon}>🌟</Text>
                                    <View style={styles.predictionContent}>
                                        <Text style={styles.predictionTitle}>Growth Opportunities</Text>
                                        <Text style={styles.predictionValue}>{insights.predictions.opportunities.join(', ')}</Text>
                                    </View>
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
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareIcon: {
        fontSize: 18,
    },
    scrollView: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    healthScoreCard: {
        marginBottom: 25,
        borderRadius: 20,
        overflow: 'hidden',
    },
    healthScoreGradient: {
        padding: 25,
        alignItems: 'center',
    },
    healthScoreTitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    healthScoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    healthScoreSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
    },
    healthScoreBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    scoreItem: {
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 18,
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
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricCard: {
        width: '48%',
        borderRadius: 15,
        overflow: 'hidden',
    },
    metricGradient: {
        padding: 15,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    metricTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        flex: 1,
    },
    trendIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendIcon: {
        fontSize: 10,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    metricSubtitle: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 2,
    },
    emotionalTrendsCard: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    emotionalTrendsGradient: {
        padding: 20,
    },
    emotionalTrendItem: {
        marginBottom: 15,
    },
    emotionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    emotionLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    emotionPercentage: {
        fontSize: 14,
        color: '#fff',
        fontWeight: 'bold',
    },
    emotionBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    emotionFill: {
        height: '100%',
        borderRadius: 4,
    },
    patternsCard: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    patternsGradient: {
        padding: 20,
    },
    patternItem: {
        marginBottom: 20,
    },
    patternHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    patternIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    patternTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    patternList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    patternTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    patternTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    insightCard: {
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
    },
    insightGradient: {
        padding: 15,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    insightIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    insightTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    insightDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
        lineHeight: 20,
    },
    insightImpact: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    actionButton: {
        borderRadius: 8,
        overflow: 'hidden',
        alignSelf: 'flex-start',
    },
    actionGradient: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    actionText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    predictionCard: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    predictionGradient: {
        padding: 20,
    },
    predictionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    predictionIcon: {
        fontSize: 20,
        marginRight: 15,
    },
    predictionContent: {
        flex: 1,
    },
    predictionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    predictionValue: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 18,
    },
});

export default RelationshipInsightsScreen;
