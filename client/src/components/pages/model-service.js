import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

class ModelService {
    constructor() {
        if (!ModelService.instance) {
            ModelService.instance = this;

            // Initialize data structure
            this.data = {
                communities: [],
                posts: [],
                comments: [],
                linkFlairs: []
            };

            // Load initial data
            this.loadInitialData();
        }

        return ModelService.instance;
    }

    // Method to load all data from API
    async loadInitialData() {
        try {
            // Load link flairs FIRST 
            const linkFlairsRes = await axios.get(`${API_URL}/linkflairs`);
            this.data.linkFlairs = linkFlairsRes.data;
            console.log('Link flairs loaded from API:', this.data.linkFlairs);
            
            // Finally load comments
            const commentsRes = await axios.get(`${API_URL}/comments`);
            this.data.comments = commentsRes.data;
            console.log('Comments loaded from API:', this.data.comments);
            
            // Then load communities
            const communitiesRes = await axios.get(`${API_URL}/communities`);
            this.data.communities = communitiesRes.data;
            console.log('Communities loaded from API:', this.data.communities);

            // Then load posts
            const postsRes = await axios.get(`${API_URL}/posts`);
            this.data.posts = postsRes.data;
            console.log('Posts loaded from API:', this.data.posts);

            

            console.log('All data successfully loaded from API');
        } catch (error) {
            console.error('Error loading initial data from API:', error);
            // No fallback to local data anymore
            this.data = {
                communities: [],
                posts: [],
                comments: [],
                linkFlairs: []
            };
        }
    }
    
    // Method to load community data from API
    async fetchCommunities() {
        try {
            const response = await axios.get(`${API_URL}/communities`);
            this.data.communities = response.data;
            return response.data;
        } catch (error) {
            console.error('Error fetching communities:', error);
            throw error;
        }
    }

    // Method to load link flairs from API
    async fetchLinkFlairs() {
        try {
            const response = await axios.get(`${API_URL}/linkflairs`);
            this.data.linkFlairs = response.data;
            return response.data;
        } catch (error) {
            console.error('Error fetching link flairs:', error);
            throw error;
        }
    }
    // Method to get a post by ID
    async fetchPost(postId) {
        try {
            const response = await axios.get(`${API_URL}/posts/${postId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching post ${postId}:`, error);
            throw error;
        }
    }

    // Method to get a comment by ID
    async fetchComment(commentId) {
        try {
            const response = await axios.get(`${API_URL}/comments/${commentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching comment ${commentId}:`, error);
            throw error;
        }
    }

    // Method to increment post view count
    async incrementPostViews(postId) {
        try {
            // Just GET the post - server increments the view count
            await axios.get(`${API_URL}/posts/${postId}`);
        } catch (error) {
            console.error(`Error incrementing views for post ${postId}:`, error);
            throw error;
        }
    }

    // Method to get posts for a community
    async fetchPostsForCommunity(communityId) {
        try {
            const community = await this.fetchCommunity(communityId);
            if (!community || !community.postIDs || community.postIDs.length === 0) {
                return [];
            }
            
            // Fetch all posts and filter for this community
            const posts = await axios.get(`${API_URL}/posts`);
            return posts.data.filter(post => community.postIDs.includes(post._id));
        } catch (error) {
            console.error(`Error fetching posts for community ${communityId}:`, error);
            throw error;
        }
    }

    // Method to get a community by ID
    async fetchCommunity(communityId) {
        try {
            const response = await axios.get(`${API_URL}/communities/${communityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching community ${communityId}:`, error);
            throw error;
        }
    }

    async fetchPostWithViewTracking(postId) {
        try {
            // Check if we've already viewed this post in this session
            const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');
            const hasViewed = viewedPosts.includes(postId);
            
            // Fetch the post
            const increment = hasViewed ? 'false' : 'true';
            const response = await axios.get(`${API_URL}/posts/${postId}?increment=${increment}`);
            const post = response.data;
            
            // If this is the first view in this session, track it
            if (!hasViewed) {
                viewedPosts.push(postId);
                localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
                
                // Update the local copy of the post with incremented view count
                const postIndex = this.data.posts.findIndex(p => p._id === postId);
                if (postIndex !== -1) {
                    this.data.posts[postIndex] = post;
                }
            }
            
            return post;
        } catch (error) {
            console.error(`Error fetching post ${postId}:`, error);
            throw error;
        }
    }
    // Method to reload data from API
    async refreshData() {
        return this.loadInitialData();
    }

    // Method to get a flair by ID
    getFlairContent(flairId) {
        const flair = this.data.linkFlairs.find(f => f._id === flairId);
        return flair ? flair.content : 'No Flair';
    }

    // Method to get a community by ID
    getCommunityForPost(postId) {
        for (const community of this.data.communities) {
            if (community.postIDs && community.postIDs.includes(postId)) {
                return community;
            }
        }
        return null;
    }

    // Method to create a new community
    async createCommunity(name, description, creatorName) {
        try {
            const response = await axios.post(`${API_URL}/communities`, {
                name,
                description,
                members: [creatorName]
            });

            // Add to local data cache
            this.data.communities.push(response.data);

            return response.data._id;
        } catch (error) {
            console.error('Error creating community:', error);
            throw error;
        }
    }

    // Method to create a new post
    async createPost(communityId, title, content, flairId, username) {
        try {
            console.log('Creating post with data:', {
                title,
                content,
                linkFlairID: flairId,
                postedBy: username,
                communityID: communityId
            });

            const response = await axios.post(`${API_URL}/posts`, {
                title,
                content,
                linkFlairID: flairId,
                postedBy: username,
                communityID: communityId
            });

            console.log('Created post via API response:', response.data);

            // Add to local data cache
            this.data.posts.push(response.data);

            // Refresh all data to ensure relationships are updated
            await this.refreshData();

            return response.data._id;
        } catch (error) {
            console.error('Error creating post via API:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error request data:', error.config?.data);
            throw error;
        }
    }

    // Method to create a new comment
    async createComment(postId, content, commentedBy, parentCommentId = null) {
        try {
            const requestData = {
                content,
                commentedBy
            };

            // Add either postID or parentCommentID based on what's provided
            if (parentCommentId) {
                requestData.parentCommentID = parentCommentId;
            } else {
                requestData.postID = postId;
            }

            const response = await axios.post(`${API_URL}/comments`, requestData);

            // Add to local data cache
            this.data.comments.push(response.data);

            // Refresh data to get updated relationships
            await this.refreshData();

            return response.data._id;
        } catch (error) {
            console.error('Error creating comment:', error);
            throw error;
        }
    }

    // Method to create a new flair
    async createFlair(content) {
        try {
            const response = await axios.post(`${API_URL}/linkflairs`, {
                content
            });

            // Add to local data cache
            this.data.linkFlairs.push(response.data);

            return response.data._id;
        } catch (error) {
            console.error('Error creating flair:', error);
            throw error;
        }
    }

    // Method to create a new registered user
    async createUser(email, displayName, firstName, lastName, password) {
        try {
            const response = await axios.post(`${API_URL}/users`, {
               email, displayName, firstName, lastName, password
            });

            //Add to local data cache
            this.data.users.push(response.data);

            return response.data._id;
        } catch (error) {
            console.error('Error creating flair:', error);
            throw error;
        }
    }

    // Method to search posts
    async searchPosts(query) {
        try {
            const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Error searching posts:', error);
            return [];
        }
    }
}

const modelService = new ModelService();
export default modelService;