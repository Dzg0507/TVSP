import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const RelationshipAnalyticsScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard data will be fetched from API
  const defaultDashboardData = {
    summary_metrics: {
      total_sessions: 12,
      completed_sessions: 10,
      avg_satisfaction: 4.2,
      active_goals: 3,
      completed_goals: 2,
      communication_patterns_detected: 5
    },
    communication_insights: [
      {
        pattern: "active_listening",
        frequency: 8,
        insight: "Detected 8 instances of active listening"
      },
      {
        pattern: "conflict_escalation",
        frequency: 2,
        insight: "Detected 2 instances of conflict escalation"
      },
      {
        pattern: "emotional_expression",
        frequency: 6,
        insight: "Detected 6 instances of emotional expression"
      }
    ],
    progress_overview: {
      sessions_completed: 10,
      total_sessions: 12,
      completion_rate: 83.3,
      avg_satisfaction: 4.2,
      active_goals: 3,
      completed_goals: 2
    },
    goal_status: [
      {
        goal_id: "1",
        title: "Improve Active Listening",
        progress: 75,
        status: "active",
        category: "communication"
      },
      {
        goal_id: "2",
        title: "Reduce Conflict Escalation",
        progress: 60,
        status: "active",
        category: "conflict_resolution"
      },
      {
        goal_id: "3",
        title: "Increase Emotional Expression",
        progress: 90,
        status: "active",
        category: "intimacy"
      }
    ],
    recommendations: [
      "Continue regular communication practice",
      "Focus on active listening techniques",
      "Consider scheduling more frequent sessions"
    ]
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.12.246:8002/analytics/dashboard/user123');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderMetricCard = (title, value, subtitle, color = '#4A90E2') => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderProgressBar = (progress, color = '#4A90E2') => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { backgroundColor: '#E5E5E5' }]}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressText}>{progress}%</Text>
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
            <Text style={styles.loadingText}>Loading your relationship insights...</Text>
          </View>
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
        
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Relationship Insights</Text>
            <Text style={styles.headerSubtitle}>Track your progress and growth</Text>
          </View>

          {/* Summary Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                "Sessions Completed",
                dashboardData.summary_metrics.completed_sessions,
                `of ${dashboardData.summary_metrics.total_sessions} total`,
                '#4CAF50'
              )}
              {renderMetricCard(
                "Avg Satisfaction",
                dashboardData.summary_metrics.avg_satisfaction,
                "out of 5.0",
                '#FF9800'
              )}
              {renderMetricCard(
                "Active Goals",
                dashboardData.summary_metrics.active_goals,
                `${dashboardData.summary_metrics.completed_goals} completed`,
                '#9C27B0'
              )}
              {renderMetricCard(
                "Completion Rate",
                `${dashboardData.progress_overview.completion_rate}%`,
                "session completion",
                '#2196F3'
              )}
            </View>
          </View>

          {/* Communication Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communication Patterns</Text>
            <View style={styles.insightsContainer}>
              {dashboardData.communication_insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightPattern}>
                      {insight.pattern.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.insightFrequency}>{insight.frequency}</Text>
                  </View>
                  <Text style={styles.insightText}>{insight.insight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Goal Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Progress</Text>
            <View style={styles.goalsContainer}>
              {dashboardData.goal_status.map((goal) => (
                <View key={goal.goal_id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalCategory}>{goal.category.replace(/_/g, ' ')}</Text>
                  </View>
                  {renderProgressBar(goal.progress, goal.progress > 75 ? '#4CAF50' : goal.progress > 50 ? '#FF9800' : '#F44336')}
                  <Text style={styles.goalStatus}>{goal.status.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <View style={styles.recommendationsContainer}>
              {dashboardData.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AICoachChatScreen')}
            >
              <Text style={styles.actionButtonText}>Start New Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => {
                // Navigate to goal setting screen
                navigation.navigate('GoalSetting');
                console.log('Navigate to goal setting');
              }}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Set New Goal
              </Text>
            </TouchableOpacity>
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
  scrollView: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightPattern: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightFrequency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  insightText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  goalsContainer: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  goalCategory: {
    fontSize: 12,
    color: '#B0B0B0',
    textTransform: 'uppercase',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    minWidth: 40,
    textAlign: 'right',
  },
  goalStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recommendationsContainer: {
    gap: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
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

export default RelationshipAnalyticsScreen;
