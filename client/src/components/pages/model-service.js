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
            // Load communities
            const communitiesRes = await axios.get(`${API_URL}/communities`);
            this.data.communities = communitiesRes.data;
            console.log('Communities loaded from API:', this.data.communities);

            // Load posts
            const postsRes = await axios.get(`${API_URL}/posts`);
            this.data.posts = postsRes.data;
            console.log('Posts loaded from API:', this.data.posts);

            // Load comments
            const commentsRes = await axios.get(`${API_URL}/comments`);
            this.data.comments = commentsRes.data;
            console.log('Comments loaded from API:', this.data.comments);

            // Load link flairs
            const linkFlairsRes = await axios.get(`${API_URL}/linkflairs`);
            this.data.linkFlairs = linkFlairsRes.data;
            console.log('Link flairs loaded from API:', this.data.linkFlairs);

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