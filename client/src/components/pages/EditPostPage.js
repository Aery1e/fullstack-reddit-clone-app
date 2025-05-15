import React, { useState, useEffect } from "react";
import modelService from "./model-service";
import validateLinks from "../links/validateLinks";

export default function EditPostPage({ onPageChange, postId }) {
  const [title, setTitle] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [flairId, setFlairId] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch post data
  useEffect(() => {
    async function fetchData() {
      try {
        if (!postId) {
          setError("Post ID is missing");
          setLoading(false);
          return;
        }

        // Refresh communities and flairs data
        await modelService.fetchCommunities();
        await modelService.fetchLinkFlairs();

        // Fetch post
        const post = await modelService.fetchPost(postId);

        // Find community for this post
        const community = modelService.getCommunityForPost(postId);

        setTitle(post.title);
        setContent(post.content);
        setFlairId(post.linkFlairID ? post.linkFlairID : "");
        setCommunityId(community ? community._id : "");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post data:", err);
        setError("Failed to load post data. Please try again.");
        setLoading(false);
      }
    }

    fetchData();
  }, [postId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!communityId) {
      setError("Please select a community.");
      return;
    }

    if (!title) {
      setError("Please enter a post title.");
      return;
    }

    if (!content) {
      setError("Please enter post content.");
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

      await modelService.updatePost(postId, {
        title,
        content,
        linkFlairID: flairId,
        communityID: communityId,
      });

      // Show success message
      alert("Post updated successfully!");

      // Navigate back to profile page
      onPageChange("profile");
    } catch (error) {
      console.error("Error updating post:", error);
      setError("An error occurred while updating the post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post deletion
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      await modelService.deletePost(postId);

      // Show success message
      alert("Post deleted successfully!");

      // Navigate back to profile page
      onPageChange("profile");
    } catch (error) {
      console.error("Error deleting post:", error);
      setError("An error occurred while deleting the post. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="edit-page">Loading post data...</div>;

  return (
    <div id="edit-post-page" className="edit-page">
      <h2>Edit Post</h2>

      {error && (
        <div className="error-message" style={{ color: "red" }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="edit-post-community-select">Community:</label>
        <select
          id="edit-post-community-select"
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          disabled={true} // Cannot change community for existing post
        >
          <option value="">-- Select a Community --</option>
          {modelService.data.communities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="edit-post-title">Post Title: (Required)</label>
        <br />
        <input
          id="edit-post-title"
          type="text"
          size="50"
          maxLength="100"
          placeholder="Enter Post Title (Max 100 characters)"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />

        <label htmlFor="edit-post-flair-select">Select Flair:</label>
        <select
          id="edit-post-flair-select"
          value={flairId}
          onChange={(e) => setFlairId(e.target.value)}
        >
          <option value="">-- Select a Flair --</option>
          {modelService.data.linkFlairs.map((flair) => (
            <option key={flair._id} value={flair._id}>
              {flair.content}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="edit-post-content">Content: (Required)</label>
        <br />
        <textarea
          id="edit-post-content"
          className="edit-post-content"
          size="100"
          placeholder="Enter Post Content"
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
            id="update-post-submit"
            className="button"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>

          <button
            id="delete-post"
            className="button delete-button"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
          >
            Delete Post
          </button>

          <button
            className="button"
            type="button"
            onClick={() => onPageChange("profile")}
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
              Are you sure you want to delete this post? This will also delete
              all comments on this post.
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
