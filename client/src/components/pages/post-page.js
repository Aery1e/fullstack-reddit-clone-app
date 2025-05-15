import React, { useEffect, useState } from 'react';
import Timestamp from "../timestamp";
import modelService from './model-service';
import axios from 'axios';
import parseLinks from '../links/parseLinks';

export default function PostPage({ onPageChange, selectedPostId, selectedCommunityId }) {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sortMethod, setSortMethod] = useState('newest');
	// const [comments, setComments] = useState([]);

	// Load posts when component mounts or when selectedPostId/selectedCommunityId changes
	useEffect(() => {
		async function fetchPosts() {
			try {
				setLoading(true);

				// If a specific post ID is selected, fetch that post directly from API
				if (selectedPostId) {
					try {
						// Fetch post directly from API
						const response = await axios.get(`http://localhost:8000/api/posts/${selectedPostId}`);
						setPosts([response.data]);

						// No need to separately fetch comments as they'll be loaded in refreshData
						await modelService.refreshData();
					} catch (err) {
						console.error("Error fetching post:", err);
						setError('Post not found');
					}
				}
				// If a community is selected, fetch posts for that community
				else if (selectedCommunityId) {
					try {
						// Fetch community directly from API
						const communityResponse = await axios.get(`http://localhost:8000/api/communities/${selectedCommunityId}`);
						const community = communityResponse.data;

						if (community && community.postIDs && community.postIDs.length > 0) {
							// Fetch all posts and filter for those in this community
							await modelService.refreshData();
							const communityPosts = modelService.data.posts.filter(post =>
								community.postIDs.includes(post._id)
							);
							setPosts(communityPosts);
						} else {
							setPosts([]);
						}
					} catch (err) {
						console.error("Error fetching community:", err);
						setError('Community not found');
					}
				}
				// Otherwise, show all posts
				else {
					// Fetch all posts directly from API
					const response = await axios.get('http://localhost:8000/api/posts');
					setPosts(response.data);
				}

				setLoading(false);
			} catch (err) {
				console.error('Error fetching posts:', err);
				setError('Failed to load posts. Please try again later.');
				setLoading(false);
			}
		}

		fetchPosts();
	}, [selectedPostId, selectedCommunityId]);

	// Fetch comments for a specific post
	// const fetchCommentsForPost = async (post) => {
	// 	try {
	// 		// Since we've already loaded all comments, we can filter them
	// 		// const postComments = modelService.data.comments.filter(comment =>
	// 		// 	post.commentIDs && post.commentIDs.includes(comment._id)
	// 		// );
	// 		// setComments(postComments);
	// 	} catch (err) {
	// 		console.error('Error fetching comments:', err);
	// 	}
	// };

	// Increment view count when viewing a specific post
	useEffect(() => {
		async function fetchPosts() {
			try {
				setLoading(true);

				// If a specific post ID is selected, fetch that post
				if (selectedPostId) {
					// Only increment view count if we're viewing the post (not creating a comment)
					const post = await modelService.fetchPostWithViewTracking(selectedPostId, true);
					if (post) {
						setPosts([post]);
					} else {
						setError('Post not found');
					}
				}
				// If a community is selected, filter posts for that community
				else if (selectedCommunityId) {
					const community = modelService.data.communities.find(c => c._id === selectedCommunityId);
					if (community) {
						const communityPosts = modelService.data.posts.filter(post =>
							community.postIDs && community.postIDs.includes(post._id)
						);
						setPosts(communityPosts);
					} else {
						setError('Community not found');
					}
				}
				// Otherwise, show all posts
				else {
					setPosts(modelService.data.posts);
				}

				setLoading(false);
			} catch (err) {
				console.error('Error fetching posts:', err);
				setError('Failed to load posts. Please try again later.');
				setLoading(false);
			}
		}

		fetchPosts();
	}, [selectedPostId, selectedCommunityId]);

	// Handle sort method change
	const handleSortChange = (method) => {
		setSortMethod(method);
	};

	// Make sort handler available to parent component (TopBar)
	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.handlePostSort = handleSortChange;
			window.currentSortMethod = sortMethod;
		}
	}, [sortMethod]);

	// Sort posts based on the current sort method
	const getSortedPosts = () => {
		if (!posts || posts.length === 0) return [];

		switch (sortMethod) {
			case 'newest':
				return [...posts].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
			case 'oldest':
				return [...posts].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
			case 'active':
				// Sort by most recent comment
				// Create array with most recent comment for each post
				let sorted_comments = [];
				// Array of recent comments that don't get sorted
				let raw_comments = [];
				// Array of posts whose indexes matches the comments of temp
				let raw_posts = [];
				// Array of sorted posts
				let sorted_posts = [];

				// Filling comment arrays and post arrays
				for (let i = 0; i < posts.length; i++) {
					const recentComment = findMostRecentComment(posts[i]);
					sorted_comments.push(recentComment);
					raw_comments.push(recentComment);
					raw_posts.push(posts[i]);
				}

				// Sort one comment array by date
				sorted_comments.sort((a, b) => {
					if (!a && !b) return 0;
					if (!a) return 1;
					if (!b) return -1;
					return new Date(b.commentedDate) - new Date(a.commentedDate);
				});

				// Match sorted comments with their posts
				for (let i = 0; i < sorted_comments.length; i++) {
					for (let j = 0; j < raw_comments.length; j++) {
						if (sorted_comments[i] === raw_comments[j]) {
							sorted_posts.push(raw_posts[j]);
							break;
						}
					}
				}

				return sorted_posts;
			default:
				return posts;
		}
	};

	// Find most recent comment for a post (recursively check nested comments)
	const findMostRecentComment = (post) => {
		if (!post.commentIDs || post.commentIDs.length === 0) {
			return null;
		}

		// Get all comments for this post
		const postComments = post.commentIDs.map(id =>
			modelService.data.comments.find(c => c._id === id)
		).filter(Boolean);

		if (postComments.length === 0) {
			return null;
		}

		// Start with the first comment as most recent
		let mostRecentComment = postComments[0];

		// Check all comments and their nested comments
		for (const comment of postComments) {
			// Check if this comment is more recent
			if (new Date(comment.commentedDate) > new Date(mostRecentComment.commentedDate)) {
				mostRecentComment = comment;
			}

			// Check nested comments
			if (comment.commentIDs && comment.commentIDs.length > 0) {
				const mostRecentNested = findMostRecentNestedComment(comment);
				if (mostRecentNested && new Date(mostRecentNested.commentedDate) > new Date(mostRecentComment.commentedDate)) {
					mostRecentComment = mostRecentNested;
				}
			}
		}

		return mostRecentComment;
	};

	// Find the most recent nested comment
	const findMostRecentNestedComment = (comment) => {
		if (!comment.commentIDs || comment.commentIDs.length === 0) {
			return null;
		}

		// Get all reply comments
		const replyComments = comment.commentIDs.map(id =>
			modelService.data.comments.find(c => c._id === id)
		).filter(Boolean);

		if (replyComments.length === 0) {
			return null;
		}

		// Start with the first reply as most recent
		let mostRecentReply = replyComments[0];

		// Check all replies and their nested replies
		for (const reply of replyComments) {
			// Check if this reply is more recent
			if (new Date(reply.commentedDate) > new Date(mostRecentReply.commentedDate)) {
				mostRecentReply = reply;
			}

			// Recursively check nested replies
			if (reply.commentIDs && reply.commentIDs.length > 0) {
				const mostRecentNested = findMostRecentNestedComment(reply);
				if (mostRecentNested && new Date(mostRecentNested.commentedDate) > new Date(mostRecentReply.commentedDate)) {
					mostRecentReply = mostRecentNested;
				}
			}
		}

		return mostRecentReply;
	};

	// Truncate post content for list view
	const truncateContent = (content, maxLength = 100) => {
		return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
	};

	// Handle post click
	const handlePostClick = (postId) => {
		onPageChange('postPage', postId);
	};

	// Handle reply click
	const handleReplyClick = (commentId) => {
		onPageChange('createComment', selectedPostId, null, commentId);
	};

	// Render post list
	const renderPostList = () => {
		const sortedPosts = getSortedPosts();

		return sortedPosts.map(post => {
			// Find the community for this post
			const community = modelService.data.communities.find(c =>
				c.postIDs && c.postIDs.includes(post._id)
			);

			// Find the flair for this post
			const flairContent = post.linkFlairID ? modelService.getFlairContent(post.linkFlairID) : 'No Flair';

			// Count total comments (including replies)
			const countComments = (post) => {
				let count = post.commentIDs ? post.commentIDs.length : 0;

				// Add counts of nested comments
				if (post.commentIDs) {
					post.commentIDs.forEach(commentId => {
						const comment = modelService.data.comments.find(c => c._id === commentId);
						if (comment && comment.commentIDs) {
							count += countNestedComments(comment);
						}
					});
				}

				return count;
			};

			// Helper to count nested comments
			const countNestedComments = (comment) => {
				let count = comment.commentIDs ? comment.commentIDs.length : 0;

				if (comment.commentIDs) {
					comment.commentIDs.forEach(replyId => {
						const reply = modelService.data.comments.find(c => c._id === replyId);
						if (reply && reply.commentIDs) {
							count += countNestedComments(reply);
						}
					});
				}

				return count;
			};

			return (
				<div key={post._id} className="post-item cursor-pointer hover:bg-gray-100" onClick={() => handlePostClick(post._id)}>
					<p className="post-header">
						{!selectedCommunityId && community ?
							`${community.name} | ` :
							''
						}Posted by: {post.postedBy} | {Timestamp(new Date(post.postedDate))}
					</p>
					<h2 className="post-name">
						{post.title}
					</h2>

					<h4 className="flair-name">
						{flairContent}
					</h4>

					<p className="post-content" dangerouslySetInnerHTML={{ __html: parseLinks(truncateContent(post.content)) }}></p>

					<p className="post-subheading">
						Views: {post.views} | Comments: {countComments(post)} | Votes: {post.votes || 0}
					</p>
					<hr />
				</div>
			);
		});
	};

	// Sort comments by newest first
	const sortCommentsByDate = (commentIds) => {
		if (!commentIds || commentIds.length === 0) return [];

		return commentIds
			.map(id => modelService.data.comments.find(c => c._id === id))
			.filter(Boolean)
			.sort((a, b) => new Date(b.commentedDate) - new Date(a.commentedDate))
			.map(comment => comment._id);
	};

	// Recursive function to render comments and their replies
	const renderComments = (commentIds, indentLevel = 0) => {
		if (!commentIds || commentIds.length === 0) return null;

		// Sort comments by newest first
		const sortedCommentIds = sortCommentsByDate(commentIds);

		return sortedCommentIds.map(commentId => {
			const comment = modelService.data.comments.find(c => c._id === commentId);
			if (!comment) return null;

			const indentStyle = {
				marginLeft: `${indentLevel * 20}px`,
				borderLeft: indentLevel > 0 ? `2px solid #ccc` : 'none',
				paddingLeft: indentLevel > 0 ? '10px' : '0'
			};

			// Check if user is logged in and has enough reputation
			const userData = JSON.parse(localStorage.getItem('userData'));
			const isLoggedIn = !!userData;
			const userReputation = userData ? userData.reputation : 0;
			const canVote = isLoggedIn && userReputation >= 50;

			
			// Handle vote action for comments
			const handleCommentVote = async (voteType) => {
				if (!isLoggedIn) {
					alert("You must be logged in to vote");
					return;
				}

				if (userReputation < 50) {
					alert("You need at least 50 reputation to vote");
					return;
				}
				
				// Check if user has already voted in the same way
				const currentVote = comment.voters?.find(v => v.userId === userData._id)?.vote || 'none';
				
				// If clicking the same vote button that's already active, remove the vote (transition to neutral)
				if (currentVote === voteType) {
					voteType = 'none';
				} 
				// If trying to switch directly between up/down votes, prevent it
				else if (currentVote !== 'none' && voteType !== 'none') {
					alert("You must remove your current vote before voting differently");
					return;
				}

				try {
					await modelService.voteOnComment(comment._id, voteType);
					
					// Reload post data without incrementing view
					const updatedPost = await axios.get(`http://localhost:8000/api/posts/${selectedPostId}?increment=false`);
					
					// Update the post in local data
					const postIndex = modelService.data.posts.findIndex(p => p._id === selectedPostId);
					if (postIndex !== -1) {
						modelService.data.posts[postIndex] = updatedPost.data;
					}
					
					// Also refresh comments data
					await modelService.refreshData();
					
					// Force a re-render without changing page
					setPosts([updatedPost.data]);
				} catch (error) {
					alert(error.response?.data?.message || "Error voting on comment");
				}
			};

			return (
				<div key={commentId} className="comment" style={indentStyle}>
					<p dangerouslySetInnerHTML={{ __html: parseLinks(comment.content) }}></p>

					<div className="vote-controls">
						{isLoggedIn ? (
							<>
								<button
									onClick={() => handleCommentVote('up')}
									disabled={!canVote}
									className={`vote-button ${comment.voters?.find(v => v.userId === userData._id)?.vote === 'up' ? 'active-vote' : ''}`}
								>
									▲
								</button>
								<span className="vote-count">
									{comment.votes || 0}
								</span>
								<button
									onClick={() => handleCommentVote('down')}
									disabled={!canVote}
									className={`vote-button ${comment.voters?.find(v => v.userId === userData._id)?.vote === 'down' ? 'active-vote' : ''}`}
								>
									▼
								</button>
							</>
						) : (
							<span className="vote-count">
								Votes: {comment.votes || 0}
							</span>
						)}
					</div>

					<div className="comment-footer">
						<small>
							By {comment.commentedBy} | {Timestamp(new Date(comment.commentedDate))}
						</small>
						{isLoggedIn ? (
							<button
								className="reply-button"
								onClick={(e) => {
									e.stopPropagation(); // Prevent post click event
									handleReplyClick(commentId);
								}}
							>
								Reply
							</button>
						) : (
							<button
								className="reply-button"
								style={{ color: 'darkgrey', cursor: 'not-allowed' }}
								disabled
							>
								Reply
							</button>
						)}
					</div>

					{/* Render nested comments with increased indent */}
					{comment.commentIDs && comment.commentIDs.length > 0 && (
						<div className="nested-comments">
							{renderComments(comment.commentIDs, indentLevel + 1)}
						</div>
					)}
				</div>
			);
		});
	};

	// Render single post with comments
	const renderSinglePost = (post) => {
		// Find the community for this post
		const community = modelService.data.communities.find(c =>
			c.postIDs && c.postIDs.includes(post._id)
		);

		// Find the flair for this post
		const flairContent = post.linkFlairID ? modelService.getFlairContent(post.linkFlairID) : 'No Flair';

		// Check if user is logged in and has enough reputation
		const userData = JSON.parse(localStorage.getItem('userData'));
		const isLoggedIn = !!userData;
		const userReputation = userData ? userData.reputation : 0;
		const canVote = isLoggedIn && userReputation >= 50;

		
		// Handle vote action
		const handleVote = async (voteType) => {
			if (!isLoggedIn) {
				alert("You must be logged in to vote");
				return;
			}

			if (userReputation < 50) {
				alert("You need at least 50 reputation to vote");
				return;
			}
			
			// Check if user has already voted in the same way
			const currentVote = post.voters?.find(v => v.userId === userData._id)?.vote || 'none';
			
			// If clicking the same vote button that's already active, remove the vote (transition to neutral)
			if (currentVote === voteType) {
				voteType = 'none';
			} 
			// If trying to switch directly between up/down votes, prevent it
			else if (currentVote !== 'none' && voteType !== 'none') {
				alert("You must remove your current vote before voting differently");
				return;
			}

			try {
				await modelService.voteOnPost(post._id, voteType);
				// Reload post data without incrementing view
				const updatedPost = await axios.get(`http://localhost:8000/api/posts/${post._id}?increment=false`);
				
				// Update the post in local data
				const postIndex = modelService.data.posts.findIndex(p => p._id === post._id);
				if (postIndex !== -1) {
					modelService.data.posts[postIndex] = updatedPost.data;
				}
				
				// Force a re-render
				setPosts([updatedPost.data]);
			} catch (error) {
				alert(error.response?.data?.message || "Error voting on post");
			}
		};

		// Count total comments (including replies)
		const countComments = (post) => {
			let count = post.commentIDs ? post.commentIDs.length : 0;

			// Add counts of nested comments
			if (post.commentIDs) {
				post.commentIDs.forEach(commentId => {
					const comment = modelService.data.comments.find(c => c._id === commentId);
					if (comment && comment.commentIDs) {
						count += countNestedComments(comment);
					}
				});
			}

			return count;
		};

		// Helper to count nested comments
		const countNestedComments = (comment) => {
			let count = comment.commentIDs ? comment.commentIDs.length : 0;

			if (comment.commentIDs) {
				comment.commentIDs.forEach(replyId => {
					const reply = modelService.data.comments.find(c => c._id === replyId);
					if (reply && reply.commentIDs) {
						count += countNestedComments(reply);
					}
				});
			}

			return count;
		};

		return (
			<div className="post-item">
				<p className="post-header">
					{community ? community.name : 'Unknown Community'} | Posted by: {post.postedBy} | {Timestamp(new Date(post.postedDate))}
				</p>
				<h2 className="post-name">{post.title}</h2>

				<h4 className="flair-name">
					{flairContent}
				</h4>

				<p className="post-content" dangerouslySetInnerHTML={{ __html: parseLinks(post.content) }}></p>

				<div className="vote-controls">
					{isLoggedIn ? (
						<>
							<button
								onClick={() => handleVote('up')}
								disabled={!canVote}
								className={`vote-button ${post.voters?.find(v => v.userId === userData._id)?.vote === 'up' ? 'active-vote' : ''}`}
							>
								▲
							</button>
							<span className="vote-count">
								{post.votes || 0}
							</span>
							<button
								onClick={() => handleVote('down')}
								disabled={!canVote}
								className={`vote-button ${post.voters?.find(v => v.userId === userData._id)?.vote === 'down' ? 'active-vote' : ''}`}
							>
								▼
							</button>
						</>
					) : (
						<span className="vote-count">
							Votes: {post.votes || 0}
						</span>
					)}
					<span className="post-stats">
						Views: {post.views} | Comments: {countComments(post)} | Votes: {post.votes}
					</span>
				</div>

				{isLoggedIn ? (
					<button
						className="comment-button button"
						onClick={() => onPageChange('createComment', post._id)}
					>
						Add a comment
					</button>
				) : (
					<button
						className="comment-button button"
						style={{ backgroundColor: 'darkgrey', cursor: 'not-allowed' }}
						disabled
					>
						Add a comment
					</button>
				)}

				<hr />

				<div className="post-comments">
					{renderComments(post.commentIDs)}
				</div>
			</div>
		);
	};

	if (loading) return <div className="post-page">Loading posts...</div>;
	if (error) return <div className="post-page">Error: {error}</div>;
	if (posts.length === 0) return <div className="post-page">No posts found</div>;

	return (
		<div className="post-page">
			{selectedPostId && posts.length > 0 ? renderSinglePost(posts[0]) : renderPostList()}
		</div>
	);
}