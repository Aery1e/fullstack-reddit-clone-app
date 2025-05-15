import React, { useState, useEffect } from 'react';
import modelService from './model-service';
import axios from 'axios';
function UserProfilePage({ onPageChange }) {
    const [userData, setUserData] = useState(null);
    const [activeTab, setActiveTab] = useState('posts'); // Default to posts tab for regular users, 'users' for admins
    const [userPosts, setUserPosts] = useState([]);
    const [userCommunities, setUserCommunities] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [viewingUserId, setViewingUserId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [viewedUserData, setViewedUserData] = useState(null);

    useEffect(() => {
        // Load user data from localStorage
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (!storedUserData) {
            setError('User data not found. Please log in again.');
            return;
        }

        setUserData(storedUserData);
        setIsAdmin(storedUserData.isAdmin || false);

        // If admin, default to users tab and load all users
        if (storedUserData.isAdmin && !viewingUserId) {
            setActiveTab('users');
            loadAllUsers();
        }

        // Load specific user content if viewing a different user, otherwise load own content
        if (viewingUserId && viewingUserId !== storedUserData._id) {
            loadSpecificUserContent(viewingUserId);
        } else {
            loadUserContent(storedUserData.displayName);
        }
    }, [viewingUserId]);

    const loadUserContent = async (displayName) => {
        try {
            setLoading(true);

            // Refresh all data from server
            await modelService.refreshData();

            // Filter posts created by the user
            const posts = modelService.data.posts.filter(post =>
                post.postedBy === displayName
            );
            setUserPosts(posts);

            // Filter communities created by the user
            const communities = modelService.data.communities.filter(community =>
                community.createdBy && community.createdBy.includes(displayName)
            );
            setUserCommunities(communities);

            // Filter comments created by the user
            const comments = modelService.data.comments.filter(comment =>
                comment.commentedBy === displayName
            );
            setUserComments(comments);

            setLoading(false);
        } catch (err) {
            console.error("Error loading user content:", err);
            setError("Failed to load user content. Please try again later.");
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        try {
            setLoading(true);

            // Fetch all users from server
            const response = await axios.get('http://localhost:8000/api/users');
            setAllUsers(response.data);

            setLoading(false);
        } catch (err) {
            console.error("Error loading users:", err);
            setError("Failed to load users. Please try again later.");
            setLoading(false);
        }
    };

    const loadSpecificUserContent = async (userId) => {
        try {
            setLoading(true);

            // Fetch specific user data
            const userResponse = await axios.get(`http://localhost:8000/api/users/${userId}`);
            const viewedUserData = userResponse.data.user;
            const displayName = viewedUserData.displayName;

            // Store viewed user's profile data separately
            setViewedUserData(viewedUserData);

            // Refresh all data from server
            await modelService.refreshData();

            // Filter posts created by the user
            const posts = modelService.data.posts.filter(post =>
                post.postedBy === displayName
            );
            setUserPosts(posts);

            // Filter communities created by the user
            const communities = modelService.data.communities.filter(community =>
                community.createdBy && community.createdBy.includes(displayName)
            );
            setUserCommunities(communities);

            // Filter comments created by the user
            const comments = modelService.data.comments.filter(comment =>
                comment.commentedBy === displayName
            );
            setUserComments(comments);

            setLoading(false);
        } catch (err) {
            console.error("Error loading user content:", err);
            setError("Failed to load user content. Please try again later.");
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:8000/api/users/${userId}`);

            // Refresh users list
            loadAllUsers();

            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user: " + (err.response?.data?.message || err.message));
        }
    };

    const handleBackToAdminProfile = () => {
        setViewingUserId(null);
        setViewedUserData(null);
        setActiveTab('users');
        loadAllUsers();
    };

    const handleEditCommunity = (communityId) => {
        onPageChange('editCommunity', communityId);
    };

    const handleDeleteCommunity = async (communityId) => {
        if (window.confirm("Are you sure you want to delete this community? All posts and comments will also be deleted.")) {
            try {
                await modelService.deleteCommunity(communityId);
                alert("Community deleted successfully");
                loadUserContent(userData.displayName);
            } catch (err) {
                console.error("Error deleting community:", err);
                setError("Failed to delete community: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleEditPost = (postId) => {
        onPageChange('editPost', postId);
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Are you sure you want to delete this post? All comments will also be deleted.")) {
            try {
                await modelService.deletePost(postId);
                alert("Post deleted successfully");
                loadUserContent(userData.displayName);
            } catch (err) {
                console.error("Error deleting post:", err);
                setError("Failed to delete post: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleEditComment = (commentId) => {
        onPageChange('editComment', commentId);
    };

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment? All replies will also be deleted.")) {
            try {
                await modelService.deleteComment(commentId);
                alert("Comment deleted successfully");
                loadUserContent(userData.displayName);
            } catch (err) {
                console.error("Error deleting comment:", err);
                setError("Failed to delete comment: " + (err.response?.data?.message || err.message));
            }
        }
    };

    const findPostForComment = (commentId) => {
        // Check direct post-comment relationships first
        for (const post of modelService.data.posts) {
            if (post.commentIDs && post.commentIDs.some(id =>
                // Handle different formats of IDs (string or ObjectId)
                id.toString() === commentId.toString()
            )) {
                return post;
            }
        }

        // If not found, it might be a reply to another comment
        // Try to find the parent comment and then trace back to the post
        const findPostRecursively = (parentCommentId) => {
            // Find parent comment
            const parentComment = modelService.data.comments.find(c =>
                c.commentIDs && c.commentIDs.some(id =>
                    id.toString() === commentId.toString()
                )
            );

            if (!parentComment) return null;

            // Check if this parent comment is directly in a post
            for (const post of modelService.data.posts) {
                if (post.commentIDs && post.commentIDs.some(id =>
                    id.toString() === parentComment._id.toString()
                )) {
                    return post;
                }
            }

            // If not, recursively check the parent's parent
            return findPostRecursively(parentComment._id);
        };

        return findPostRecursively();
    };

    if (loading) return <div className="user-profile-page">Loading user profile...</div>;
    if (error) return <div className="user-profile-page">Error: {error}</div>;
    if (!userData) return <div className="user-profile-page">User not found</div>;

    return (
        <div className="user-profile-page">
            <div className="profile-header">
                <h2>User Profile {viewingUserId && viewingUserId !== userData._id ? `- ${viewedUserData?.displayName || ''}` : ''}</h2>
                <button
                    className="button"
                    onClick={() => onPageChange('home')}
                    style={{
                        padding: '5px 10px',
                        width: 'auto'
                    }}
                >
                    Return Home
                </button>
                <div className="profile-details">
                    <p><strong>Display Name:</strong> {viewingUserId && viewedUserData ? viewedUserData.displayName : userData.displayName}</p>
                    <p><strong>Email:</strong> {viewingUserId && viewedUserData ? viewedUserData.email : userData.email}</p>
                    <p><strong>Member since:</strong> {new Date(viewingUserId && viewedUserData ? viewedUserData.joinDate : userData.joinDate).toLocaleDateString()}</p>
                    <p><strong>Reputation:</strong> {viewingUserId && viewedUserData ? viewedUserData.reputation : userData.reputation}</p>
                </div>
            </div>

            <div className="profile-tabs">
                {isAdmin && (
                    <button
                        className={`profile-tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        All Users
                    </button>
                )}
                <button
                    className={`profile-tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    {viewingUserId && viewingUserId !== userData._id ? "User's Posts" : "My Posts"}
                </button>
                <button
                    className={`profile-tab-button ${activeTab === 'communities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('communities')}
                >
                    {viewingUserId && viewingUserId !== userData._id ? "User's Communities" : "My Communities"}
                </button>
                <button
                    className={`profile-tab-button ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    {viewingUserId && viewingUserId !== userData._id ? "User's Comments" : "My Comments"}
                </button>

                {isAdmin && viewingUserId && viewingUserId !== userData._id && (
                    <button
                        className="profile-tab-button back-button"
                        onClick={handleBackToAdminProfile}
                    >
                        Back to Admin Profile
                    </button>
                )}
            </div>

            <div className={`profile-tab-content ${activeTab === 'users' ? 'no-padding' : ''}`}>
                {activeTab === 'communities' && (
                    <div className="profile-communities-list">
                        <h3>Communities I Created</h3>
                        {userCommunities.length === 0 ? (
                            <p>You haven't created any communities yet.</p>
                        ) : (
                            <ul>
                                {userCommunities.map(community => (
                                    <li key={community._id} className="profile-list-item">
                                        <span className="profile-community-name">{community.name}</span>
                                        <div className="profile-item-actions">
                                            <button
                                                className="profile-edit-button button"
                                                onClick={() => handleEditCommunity(community._id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="profile-delete-button button"
                                                onClick={() => handleDeleteCommunity(community._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {activeTab === 'posts' && (
                    <div className="profile-posts-list">
                        <h3>My Posts</h3>
                        {userPosts.length === 0 ? (
                            <p>You haven't created any posts yet.</p>
                        ) : (
                            <ul>
                                {userPosts.map(post => (
                                    <li key={post._id} className="profile-list-item">
                                        <span className="profile-post-title">{post.title}</span>
                                        <div className="profile-item-actions">
                                            <button
                                                className="profile-edit-button button"
                                                onClick={() => handleEditPost(post._id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="profile-delete-button button"
                                                onClick={() => handleDeletePost(post._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="profile-comments-list">
                        <h3>My Comments</h3>
                        {userComments.length === 0 ? (
                            <p>You haven't made any comments yet.</p>
                        ) : (
                            <ul>
                                {userComments.map(comment => {
                                    let post = findPostForComment(comment._id);

                                    return (
                                        <li key={comment._id} className="profile-list-item">
                                            <div>
                                                <span className="profile-post-title">
                                                    {post ? post.title : 'Unknown Post'}:
                                                </span>
                                                <span className="profile-comment-preview">
                                                    {comment.content.substring(0, 20)}
                                                    {comment.content.length > 20 ? '...' : ''}
                                                </span>
                                            </div>
                                            <div className="profile-item-actions">
                                                <button
                                                    className="profile-edit-button button"
                                                    onClick={() => handleEditComment(comment._id)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="profile-delete-button button"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                )}
            </div>
            {activeTab === 'users' && isAdmin && (
                <div className="profile-users-list">
                    <h3>All Users</h3>
                    {allUsers.length === 0 ? (
                        <p>No users found in the system.</p>
                    ) : (
                        <ul>
                            {allUsers.map(user => (
                                <li key={user._id} className="profile-list-item">
                                    <div>
                                        <span className="profile-user-name">{user.displayName}</span>
                                        <span className="profile-user-email"> - {user.email}</span>
                                        <span className="profile-user-reputation"> (Rep: {user.reputation})</span>
                                    </div>
                                    <div className="profile-item-actions">
                                        <button
                                            className="profile-view-button button"
                                            onClick={() => {
                                                setViewingUserId(user._id);
                                                setActiveTab('posts');
                                            }}
                                        >
                                            View Profile
                                        </button>
                                        {user._id !== userData._id && !user.isAdmin && (
                                            <button
                                                className="profile-delete-button button"
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            >
                                                Delete User
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {showDeleteConfirm && userToDelete && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h3>Confirm User Deletion</h3>
                        <p>Are you sure you want to delete user <strong>{userToDelete.displayName}</strong>?</p>
                        <p>This will delete all communities, posts, and comments created by this user.</p>
                        <p>This action cannot be undone.</p>
                        <div className="dialog-buttons">
                            <button
                                className="button"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="button delete-button"
                                onClick={() => handleDeleteUser(userToDelete._id)}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfilePage;