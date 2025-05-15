import React, { useState, useEffect } from 'react';
import modelService from './model-service';
import validateLinks from '../links/validateLinks';
import parseLinks from '../links/parseLinks';
import axios from 'axios';

export default function CreateCommentPage({ onPageChange, selectedPostId, parentCommentId }) {
    // State to track form data
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [post, setPost] = useState(null);
    const [parentComment, setParentComment] = useState(null);
    // Find post and parent comment for context
    // const post = selectedPostId
    //     ? modelService.data.posts.find(p => p._id === selectedPostId)
    //     : null;
    // const parentComment = parentCommentId
    //     ? modelService.data.comments.find(c => c._id === parentCommentId)
    //     : null;

    // For debugging
    useEffect(() => {
        console.log("CreateCommentPage - postId:", selectedPostId, "parentCommentId:", parentCommentId);
        
        async function fetchData() {
            try {
                // if (selectedPostId) {
                //     // Fetch post directly from API
                //     const postResponse = await axios.get(`http://localhost:8000/api/posts/${selectedPostId}`);
                //     const post = postResponse.data;
                //     setPost(post);
                // }
                
                if (parentCommentId) {
                    // Fetch parent comment directly from API
                    const commentResponse = await axios.get(`http://localhost:8000/api/comments/${parentCommentId}`);
                    const comment = commentResponse.data;
                    setParentComment(comment);
                    console.log("Parent comment:", comment.content);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load necessary data. Please try again.");
            }
        }
        
        fetchData();
    }, [selectedPostId, parentCommentId]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            setError("You must be logged in to add a comment.");
            return;
        }

        // Validate required fields
        if (!content) {
            setError("Please enter comment content.");
            return;
        }

        if (!selectedPostId) {
            setError("Error: No post selected for this comment.");
            return;
        }

        const linkValidation = validateLinks(content);
        if (!linkValidation.valid) {
            setError(linkValidation.error);
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError('');

            // Create the new comment
            const newCommentId = await modelService.createComment(
                selectedPostId,
                content,
                userData.displayName,
                parentCommentId
            );

            console.log("Created new comment:", newCommentId);

            // Show success message
            alert("Comment added successfully!");

            // Navigate back to the post page
            onPageChange('postPage', selectedPostId);
        } catch (error) {
            console.error("Error creating comment:", error);
            setError("An error occurred while creating the comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="create-comment-page" className="create-comment-page">
            <h2>{parentComment ? 'Reply to Comment' : 'Add a Comment'}</h2>

            {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

            {parentComment && (
                <div className="parent-comment">
                    <h3>Replying to:</h3>
                    <blockquote>
                        <p dangerouslySetInnerHTML={{ __html: parseLinks(parentComment.content) }}></p>
                        <footer>By {parentComment.commentedBy}</footer>
                    </blockquote>
                </div>
            )}

            {post && (
                <div className="post-context">
                    <p>
                        <strong>Post:</strong> {post.title}
                    </p>
                </div>
            )}

            <div>
                <label htmlFor="create-comment-content">Comment Content: (Required)</label>
                <br />
                <textarea
                    id="create-comment-content"
                    className="create-comment-content"
                    placeholder="Enter Comment Content (Max 500 characters)"
                    maxLength="500"
                    rows="4"
                    cols="50"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <br />

                {/* Username is automatically taken from logged in user */}

                <button
                    id="create-comment-submit"
                    className="button"
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : `Submit ${parentComment ? 'Reply' : 'Comment'}`}
                </button>

                <button
                    className="button"
                    type="button"
                    onClick={() => onPageChange('postPage', selectedPostId)}
                    style={{ marginLeft: '10px' }}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}