import React, { useState, useEffect } from "react";
import modelService from "./model-service";
import validateLinks from "../links/validateLinks";

export default function EditCommentPage({ onPageChange, commentId }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postTitle, setPostTitle] = useState("");
  const [postId, setPostId] = useState("");

  // Fetch comment data
  useEffect(() => {
    async function fetchData() {
      try {
        if (!commentId) {
          setError("Comment ID is missing");
          setLoading(false);
          return;
        }

        // Fetch comment
        const comment = await modelService.fetchComment(commentId);
        setContent(comment.content);

        // Find post for this comment
        const post = findPostForComment(commentId);
        if (post) {
          setPostTitle(post.title);
          setPostId(post._id);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching comment data:", err);
        setError("Failed to load comment data. Please try again.");
        setLoading(false);
      }
    }

    fetchData();
  }, [commentId]);

  // Helper function to find post for a comment
  const findPostForComment = (commentId) => {
    // Check direct post-comment relationships first
    for (const post of modelService.data.posts) {
      if (
        post.commentIDs &&
        post.commentIDs.some((id) => id.toString() === commentId.toString())
      ) {
        return post;
      }
    }

    // If not found, it might be a reply to another comment
    // Try to find the parent comment and then trace back to the post
    const findPostRecursively = (currentCommentId) => {
      // Find parent comment
      const parentComment = modelService.data.comments.find(
        (c) =>
          c.commentIDs &&
          c.commentIDs.some(
            (id) => id.toString() === currentCommentId.toString()
          )
      );

      if (!parentComment) return null;

      // Check if this parent comment is directly in a post
      for (const post of modelService.data.posts) {
        if (
          post.commentIDs &&
          post.commentIDs.some(
            (id) => id.toString() === parentComment._id.toString()
          )
        ) {
          return post;
        }
      }

      // If not, recursively check the parent's parent
      return findPostRecursively(parentComment._id);
    };

    return findPostRecursively(commentId);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!content) {
      setError("Please enter comment content.");
      return;
    }

    const linkValidation = validateLinks(content);
    if (!linkValidation.valid) {
      setError(linkValidation.error);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Use a PUT request to update the comment
      await modelService.updateComment(commentId, {
        content,
      });

      // Show success message
      alert("Comment updated successfully!");

      // Navigate back to profile page
      onPageChange("profile");
    } catch (error) {
      console.error("Error updating comment:", error);
      setError(
        "An error occurred while updating the comment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      await modelService.deleteComment(commentId);

      // Show success message
      alert("Comment deleted successfully!");

      // Navigate back to profile page
      onPageChange("profile");
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError(
        "An error occurred while deleting the comment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="edit-page">Loading comment data...</div>;

  return (
    <div id="edit-comment-page" className="edit-page">
      <h2>Edit Comment</h2>

      {error && (
        <div className="error-message" style={{ color: "red" }}>
          {error}
        </div>
      )}

      {postTitle && (
        <div className="post-context">
          <p>
            <strong>Post:</strong> {postTitle}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="edit-comment-content">
          Comment Content: (Required)
        </label>
        <br />
        <textarea
          id="edit-comment-content"
          className="edit-comment-content"
          placeholder="Enter Comment Content (Max 500 characters)"
          maxLength="500"
          rows="4"
          cols="50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        <br />

        <small className="form-hint">
          You can add links using this format: [link
          text](https://www.example.com/)
        </small>

        <div className="edit-actions">
          <button
            id="update-comment-submit"
            className="button"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Comment"}
          </button>

          <button
            id="delete-comment"
            className="button delete-button"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
          >
            Delete Comment
          </button>

          <button
            className="button"
            type="button"
            onClick={() =>
              onPageChange(postId ? "postPage" : "profile", postId)
            }
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="confirmation-dialog">
          <div className="dialog-content">
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete this comment? This will also
              delete all replies to this comment.
            </p>
            <p>This action cannot be undone.</p>
            <div className="dialog-buttons">
              <button
                className="button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="button delete-button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
