import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import socialPlatformService from '../services/SocialPlatformService';

export const useSocialPlatform = () => {
  // State management
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [trending, setTrending] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(false);
  const [error, setError] = useState(null);
  
  // User interaction state
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [gesturedPosts, setGesturedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [joinedGroups, setJoinedGroups] = useState(new Set());
  
  // Refs for cleanup
  const mountedRef = useRef(true);
  const socketListenersRef = useRef([]);

  // Initialize service and set up event listeners
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Connect to WebSocket
        const socket = socialPlatformService.connect();
        
        // Set up event listeners
        const handleConnection = (data) => {
          if (mountedRef.current) {
            setConnectionStatus(data.connected);
          }
        };

        const handleNewPost = (post) => {
          if (mountedRef.current) {
            setPosts(prevPosts => [post, ...prevPosts]);
          }
        };

        const handlePostLikes = (update) => {
          if (mountedRef.current) {
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === update.id ? { ...post, likes: update.likes } : post
              )
            );
          }
        };

        const handlePostComments = (update) => {
          if (mountedRef.current) {
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === update.id ? { ...post, comments_count: update.comments_count } : post
              )
            );
          }
        };

        const handlePostGestures = (update) => {
          if (mountedRef.current) {
            setPosts(prevPosts => 
              prevPosts.map(post => 
                post.id === update.id ? { ...post, caring_gestures: update.caring_gestures } : post
              )
            );
          }
        };

        const handlePostDeleted = (postId) => {
          if (mountedRef.current) {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
          }
        };

        // Register event listeners
        socialPlatformService.on('connection', handleConnection);
        socialPlatformService.on('new_post', handleNewPost);
        socialPlatformService.on('update_post_likes', handlePostLikes);
        socialPlatformService.on('update_post_comments', handlePostComments);
        socialPlatformService.on('update_post_gestures', handlePostGestures);
        socialPlatformService.on('post_deleted', handlePostDeleted);

        // Store listeners for cleanup
        socketListenersRef.current = [
          { event: 'connection', handler: handleConnection },
          { event: 'new_post', handler: handleNewPost },
          { event: 'update_post_likes', handler: handlePostLikes },
          { event: 'update_post_comments', handler: handlePostComments },
          { event: 'update_post_gestures', handler: handlePostGestures },
          { event: 'post_deleted', handler: handlePostDeleted }
        ];

        // Initial data load
        await loadInitialData();

      } catch (error) {
        console.error('Error initializing social platform service:', error);
        if (mountedRef.current) {
          setError(error.message);
        }
      }
    };

    initializeService();

    // Cleanup function
    return () => {
      mountedRef.current = false;
      
      // Remove event listeners
      socketListenersRef.current.forEach(({ event, handler }) => {
        socialPlatformService.off(event, handler);
      });
      
      // Disconnect socket
      socialPlatformService.disconnect();
    };
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [postsData, groupsData, trendingData, notificationsData] = await Promise.all([
        socialPlatformService.getPosts(),
        socialPlatformService.getGroups(),
        socialPlatformService.getTrendingTopics(),
        socialPlatformService.getNotifications('current_user')
      ]);

      if (mountedRef.current) {
        setPosts(postsData);
        setGroups(groupsData);
        setTrending(trendingData);
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      if (mountedRef.current) {
        setError(error.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      await loadInitialData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      if (mountedRef.current) {
        setError(error.message);
      }
    } finally {
      if (mountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [loadInitialData]);

  // Post actions
  const createPost = useCallback(async (content, metadata = {}) => {
    if (!mountedRef.current) return;
    
    try {
      const newPost = await socialPlatformService.createPost(content, metadata);
      
      if (newPost.moderation?.status === 'rejected') {
        Alert.alert(
          'Post Not Approved', 
          newPost.moderation.reasoning || 'Your post was not approved for publication.',
          [{ text: 'OK' }]
        );
        return { success: false, post: newPost };
      } else {
        Alert.alert('Success', 'Your post has been published!');
        return { success: true, post: newPost };
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
      return { success: false, error };
    }
  }, []);

  const likePost = useCallback(async (postId) => {
    if (!mountedRef.current) return;
    
    try {
      await socialPlatformService.likePost(postId);
      setLikedPosts(prev => new Set([...prev, postId]));
      return { success: true };
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', error.message || 'Failed to like post. Please try again.');
      return { success: false, error };
    }
  }, []);

  const addCaringGesture = useCallback(async (postId) => {
    if (!mountedRef.current) return;
    
    try {
      await socialPlatformService.addCaringGesture(postId);
      setGesturedPosts(prev => new Set([...prev, postId]));
      return { success: true };
    } catch (error) {
      console.error('Error adding caring gesture:', error);
      Alert.alert('Error', error.message || 'Failed to add caring gesture. Please try again.');
      return { success: false, error };
    }
  }, []);

  const savePost = useCallback((postId) => {
    if (!mountedRef.current) return;
    
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
  }, []);

  const reportPost = useCallback(async (postId, violationTypes, description) => {
    if (!mountedRef.current) return;
    
    try {
      await socialPlatformService.reportContent(postId, violationTypes, description);
      Alert.alert('Reported', 'Content has been reported and will be reviewed.');
      return { success: true };
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert('Error', error.message || 'Failed to report content. Please try again.');
      return { success: false, error };
    }
  }, []);

  // Comment actions
  const addComment = useCallback(async (postId, content) => {
    if (!mountedRef.current) return;
    
    try {
      const newComment = await socialPlatformService.addComment(postId, content);
      return { success: true, comment: newComment };
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', error.message || 'Failed to add comment. Please try again.');
      return { success: false, error };
    }
  }, []);

  const getComments = useCallback(async (postId) => {
    if (!mountedRef.current) return;
    
    try {
      const comments = await socialPlatformService.getComments(postId);
      return { success: true, comments };
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', error.message || 'Failed to load comments. Please try again.');
      return { success: false, error };
    }
  }, []);

  // Group actions
  const joinGroup = useCallback(async (groupId) => {
    if (!mountedRef.current) return;
    
    try {
      await socialPlatformService.joinGroup(groupId);
      setJoinedGroups(prev => new Set([...prev, groupId]));
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: true, members: group.members + 1 }
            : group
        )
      );
      Alert.alert('Success', 'You have joined the group!');
      return { success: true };
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', error.message || 'Failed to join group. Please try again.');
      return { success: false, error };
    }
  }, []);

  const leaveGroup = useCallback(async (groupId) => {
    if (!mountedRef.current) return;
    
    try {
      await socialPlatformService.leaveGroup(groupId);
      setJoinedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: false, members: group.members - 1 }
            : group
        )
      );
      Alert.alert('Success', 'You have left the group.');
      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      Alert.alert('Error', error.message || 'Failed to leave group. Please try again.');
      return { success: false, error };
    }
  }, []);

  // Search
  const searchPosts = useCallback(async (query, filters = {}) => {
    if (!mountedRef.current) return;
    
    try {
      const results = await socialPlatformService.searchPosts(query, filters);
      return { success: true, results };
    } catch (error) {
      console.error('Error searching posts:', error);
      return { success: false, error };
    }
  }, []);

  const searchUsers = useCallback(async (query) => {
    if (!mountedRef.current) return;
    
    try {
      const results = await socialPlatformService.searchUsers(query);
      return { success: true, results };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error };
    }
  }, []);

  // Notifications
  const markNotificationAsRead = useCallback(async (notificationId) => {
    if (!mountedRef.current) return;
    
    try {
      await socialPlatformService.markNotificationAsRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  }, []);

  // Utility functions
  const formatTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }, []);

  const getModerationStatusColor = useCallback((status) => {
    switch (status) {
      case 'approved': return '#4ecdc4';
      case 'pending': return '#feca57';
      case 'flagged': return '#ff9ff3';
      case 'rejected': return '#ff6b6b';
      default: return '#4ecdc4';
    }
  }, []);

  // Health check
  const checkHealth = useCallback(async () => {
    try {
      const health = await socialPlatformService.healthCheck();
      return health;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }, []);

  return {
    // State
    posts,
    groups,
    trending,
    notifications,
    loading,
    refreshing,
    connectionStatus,
    error,
    likedPosts,
    gesturedPosts,
    savedPosts,
    joinedGroups,
    
    // Actions
    refreshData,
    createPost,
    likePost,
    addCaringGesture,
    savePost,
    reportPost,
    addComment,
    getComments,
    joinGroup,
    leaveGroup,
    searchPosts,
    searchUsers,
    markNotificationAsRead,
    
    // Utilities
    formatTimeAgo,
    getModerationStatusColor,
    checkHealth,
    
    // Service instance
    socialPlatformService
  };
};

export default useSocialPlatform;
