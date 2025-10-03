import React, { useState, useEffect, useRef } from 'react';
import { 
  ScrollView, StatusBar, View, Text, StyleSheet, TouchableOpacity, 
  Animated, Dimensions, FlatList, Image, Modal, TextInput, 
  KeyboardAvoidingView, Platform, Alert, RefreshControl, ActivityIndicator,
  Share, Clipboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { useAuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const { width, height } = Dimensions.get('window');

const SOCIAL_API_URL = 'http://localhost:4000';
const SOCKET_URL = 'http://localhost:4000';

const EnhancedSocialFeedScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuthContext();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [gesturedPosts, setGesturedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [userProfile, setUserProfile] = useState({
    id: user?.id || 'unknown',
    name: user?.name || user?.email || 'User',
    avatar: '👤',
    bio: 'Supporting healthy relationships',
    joinedDate: new Date().toISOString().split('T')[0],
    postsCount: 0,
    likesCount: 0,
    followingCount: 0,
    followersCount: 0
  });

  // Update user profile when user data changes
  useEffect(() => {
    if (user) {
      setUserProfile(prev => ({
        ...prev,
        id: user.id || 'unknown',
        name: user.name || user.email || 'User',
        joinedDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    }
  }, [user]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('new_post', (post) => {
      console.log('New post received:', post);
      setPosts(prevPosts => [post, ...prevPosts]);
    });

    newSocket.on('update_post_likes', (update) => {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === update.id ? { ...post, likes: update.likes } : post
        )
      );
    });

    newSocket.on('update_post_comments', (update) => {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === update.id ? { ...post, comments_count: update.comments_count } : post
        )
      );
      
      if (selectedPost && selectedPost.id === update.id && update.new_comment) {
        setComments(prevComments => [...prevComments, update.new_comment]);
      }
    });

    newSocket.on('update_post_gestures', (update) => {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === update.id ? { ...post, caring_gestures: update.caring_gestures } : post
        )
      );
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchPosts(),
        fetchGroups(),
        fetchTrending()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('🔵 [SOCIAL FEED] Attempting to fetch posts from social service...');
      const response = await axios.get(`${SOCIAL_API_URL}/posts`);
      console.log('🟢 [SOCIAL FEED] Posts fetched successfully:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.log('🔴 [SOCIAL FEED] Social service not available, using empty feed');
      console.error('Error fetching posts:', error);
      // Set empty posts instead of crashing
      setPosts([]);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://192.168.12.246:4000/groups');
      const groupsData = await response.json();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
      // Fallback to empty array if API fails
      setGroups([]);
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await fetch('http://192.168.12.246:4000/trending');
      const trendingData = await response.json();
      setTrending(trendingData);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      // Fallback to empty array if API fails
      setTrending([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${SOCIAL_API_URL}/posts/${postId}/like`);
      setLikedPosts(prev => new Set([...prev, postId]));
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  const handleGesture = async (postId) => {
    try {
      await axios.post(`${SOCIAL_API_URL}/posts/${postId}/gesture`);
      setGesturedPosts(prev => new Set([...prev, postId]));
    } catch (error) {
      console.error('Error adding gesture:', error);
      Alert.alert('Error', 'Failed to add caring gesture. Please try again.');
    }
  };

  const handleSave = (postId) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        Alert.alert('Saved', 'Post removed from saved items');
      } else {
        newSet.add(postId);
        Alert.alert('Saved', 'Post added to saved items');
      }
      return newSet;
    });
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `Check out this post from Parity: "${post.content.substring(0, 100)}..."`,
        title: 'Parity Social Post'
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleComment = async (postId) => {
    setSelectedPost(posts.find(p => p.id === postId));
    try {
      const response = await axios.get(`${SOCIAL_API_URL}/posts/${postId}/comments`);
      setComments(response.data);
      setShowCommentsModal(true);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setCommenting(true);
    try {
      await axios.post(`${SOCIAL_API_URL}/posts/${selectedPost.id}/comments`, {
        content: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setCommenting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setPosting(true);
    try {
      const response = await axios.post(`${SOCIAL_API_URL}/posts`, {
        content: newPostContent.trim()
      });
      
      if (response.data.moderation?.status === 'rejected') {
        Alert.alert(
          'Post Not Approved', 
          response.data.moderation.reasoning || 'Your post was not approved for publication.',
          [{ text: 'OK' }]
        );
      } else {
        setNewPostContent('');
        setShowPostModal(false);
        Alert.alert('Success', 'Your post has been published!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.data?.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'Failed to create post. Please try again.');
      }
    } finally {
      setPosting(false);
    }
  };

  const handleReport = async (postId) => {
    Alert.alert(
      'Report Content',
      'Why are you reporting this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Toxic/Harmful', 
          onPress: () => reportContent(postId, ['toxicity'], 'Toxic or harmful content')
        },
        { 
          text: 'Spam', 
          onPress: () => reportContent(postId, ['spam'], 'Spam content')
        },
        { 
          text: 'Inappropriate', 
          onPress: () => reportContent(postId, ['inappropriate'], 'Inappropriate content')
        },
        { 
          text: 'Other', 
          onPress: () => reportContent(postId, ['other'], 'Other violation')
        }
      ]
    );
  };

  const reportContent = async (postId, violationTypes, description) => {
    try {
      await axios.post(`${SOCIAL_API_URL}/posts/${postId}/report`, {
        violation_types: violationTypes,
        description: description
      });
      Alert.alert('Reported', 'Content has been reported and will be reviewed.');
    } catch (error) {
      console.error('Error reporting content:', error);
      Alert.alert('Error', 'Failed to report content. Please try again.');
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getModerationStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4ecdc4';
      case 'pending': return '#feca57';
      case 'flagged': return '#ff9ff3';
      case 'rejected': return '#ff6b6b';
      default: return '#4ecdc4';
    }
  };

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
    ]).start();
  }, []);

  const renderPostItem = ({ item }) => (
    <Animated.View style={[styles.postCard, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
        style={styles.postGradient}>
        
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.userAvatar}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.pseudonymized_id}</Text>
              <Text style={styles.postTime}>{formatTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSave(item.id)}>
              <Text style={styles.actionIcon}>
                {savedPosts.has(item.id) ? '🔖' : '📌'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleShare(item)}>
              <Text style={styles.actionIcon}>🔗</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => handleReport(item.id)}>
              <Text style={styles.reportIcon}>⚠️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Moderation Status */}
        {item.moderation_status && item.moderation_status !== 'approved' && (
          <View style={[styles.moderationBadge, { backgroundColor: getModerationStatusColor(item.moderation_status) }]}>
            <Text style={styles.moderationText}>
              {item.moderation_status === 'pending' ? 'Under Review' : 
               item.moderation_status === 'flagged' ? 'Flagged for Review' : 
               'Moderated'}
            </Text>
          </View>
        )}

        {/* Post Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={[styles.actionButton, likedPosts.has(item.id) && styles.actionButtonActive]}
            onPress={() => handleLike(item.id)}>
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(item.id)}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{item.comments_count}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, gesturedPosts.has(item.id) && styles.actionButtonActive]}
            onPress={() => handleGesture(item.id)}>
            <Text style={styles.actionIcon}>🤗</Text>
            <Text style={styles.actionText}>{item.caring_gestures}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity style={styles.groupCard}>
      <LinearGradient
        colors={item.gradient}
        style={styles.groupGradient}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.name}</Text>
          <Text style={styles.groupCategory}>{item.category}</Text>
        </View>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <View style={styles.groupStats}>
          <Text style={styles.groupStat}>{item.members} members</Text>
          <Text style={styles.groupStat}>•</Text>
          <Text style={styles.groupStat}>{item.posts} posts</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTrendingItem = ({ item }) => (
    <TouchableOpacity style={styles.trendingCard}>
      <LinearGradient
        colors={item.gradient}
        style={styles.trendingGradient}>
        <View style={styles.trendingHeader}>
          <Text style={styles.trendingTitle}>{item.title}</Text>
          <Text style={styles.trendingCategory}>{item.category}</Text>
        </View>
        <Text style={styles.trendingPosts}>{item.posts} posts</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.pseudonymized_id}</Text>
        <Text style={styles.commentTime}>{formatTimeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#fff"
                title="Pull to refresh"
                titleColor="#fff"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No posts yet</Text>
                <Text style={styles.emptyStateSubtext}>Be the first to share something!</Text>
              </View>
            }
          />
        );
      case 'discover':
        return (
          <ScrollView style={styles.discoverContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trending Topics</Text>
              <FlatList
                data={trending}
                renderItem={renderTrendingItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingList}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Groups</Text>
              <FlatList
                data={groups}
                renderItem={renderGroupItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.groupsList}
              />
            </View>
          </ScrollView>
        );
      case 'groups':
        return (
          <FlatList
            data={groups}
            renderItem={renderGroupItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.groupsList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No groups available</Text>
                <Text style={styles.emptyStateSubtext}>Check back later for new groups!</Text>
              </View>
            }
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading social feed...</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Social Feed 🌟</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('UserProfile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View style={[styles.tabContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
            onPress={() => setActiveTab('feed')}>
            <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}>
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Discover
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
            onPress={() => setActiveTab('groups')}>
            <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
              Groups
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Content */}
        {renderContent()}

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setShowPostModal(true)}>
          <LinearGradient
            colors={['#ff6b6b', '#ee5a24']}
            style={styles.fabGradient}>
            <Text style={styles.fabIcon}>✏️</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPostModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalGradient}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowPostModal(false)}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.postInput}
                placeholder="What's on your mind? Share your thoughts, experiences, or ask for support..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />

              <View style={styles.characterCount}>
                <Text style={styles.characterCountText}>
                  {newPostContent.length}/500
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.postButton, (!newPostContent.trim() || posting) && styles.postButtonDisabled]}
                onPress={handleCreatePost}
                disabled={!newPostContent.trim() || posting}>
                <Text style={styles.postButtonText}>
                  {posting ? 'Publishing...' : 'Publish Post'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentsModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalGradient}>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Comments</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setShowCommentsModal(false);
                    setSelectedPost(null);
                    setComments([]);
                    setNewComment('');
                  }}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={comments}
                renderItem={renderCommentItem}
                keyExtractor={(item) => item.id}
                style={styles.commentsList}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.commentButton, (!newComment.trim() || commenting) && styles.commentButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim() || commenting}>
                  <Text style={styles.commentButtonText}>
                    {commenting ? '...' : 'Send'}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  profileButton: {
    padding: 5,
  },
  profileIcon: {
    fontSize: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  feedList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  discoverContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  trendingList: {
    paddingRight: 20,
  },
  trendingCard: {
    width: 200,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  trendingGradient: {
    padding: 15,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  trendingCategory: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trendingPosts: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  groupsList: {
    paddingBottom: 100,
  },
  groupCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  groupGradient: {
    padding: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  groupCategory: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  groupDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  groupStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupStat: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  postCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  postGradient: {
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  postActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
  actionIcon: {
    fontSize: 16,
  },
  reportButton: {
    padding: 5,
  },
  reportIcon: {
    fontSize: 16,
  },
  moderationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  moderationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postContent: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  postInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  characterCountText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  postButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    marginBottom: 20,
  },
  commentItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  commentContent: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 5,
  },
  commentButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  commentButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EnhancedSocialFeedScreen;
