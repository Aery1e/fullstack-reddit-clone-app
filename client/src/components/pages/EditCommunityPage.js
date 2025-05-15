import React, { useState, useEffect } from "react";
import modelService from "./model-service";
import validateLinks from "../links/validateLinks";

export default function EditCommunityPage({ onPageChange, communityId }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch community data
  useEffect(() => {
    async function fetchCommunity() {
      try {
        if (!communityId) {
          setError("Community ID is missing");
          setLoading(false);
          return;
        }

        const community = await modelService.fetchCommunity(communityId);
        setName(community.name);
        setDescription(community.description);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching community:", err);
        setError("Failed to load community. Please try again.");
        setLoading(false);
      }
    }

    fetchCommunity();
  }, [communityId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !description) {
      setError("Please fill out all required fields.");
      return;
    }

    const linkValidation = validateLinks(description);
    if (!linkValidation.valid) {
      setError(linkValidation.error);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Use a PUT request to update the community
      await modelService.updateCommunity(communityId, {
        name,
        description,
      });

      // Show success message
      alert("Community updated successfully!");

      // Navigate back to profile page
      onPageChange("profile");
    } catch (error) {
      console.error("Error updating community:", error);
      setError(
        "An error occurred while updating the community. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle community deletion
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);

      await modelService.deleteCommunity(communityId);

      // Show success message
      alert("Community deleted successfully!");

      // Navigate back to profile page
      onPageChange("profile");
    } catch (error) {
      console.error("Error deleting community:", error);
      setError(
        "An error occurred while deleting the community. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading)
    return <div className="edit-page">Loading community data...</div>;

  return (
    <div id="edit-community-page" className="edit-page">
      <h2>Edit Community</h2>

      {error && (
        <div className="error-message" style={{ color: "red" }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="edit-community-name">Community Name: (Required)</label>
        <br />
        <input
          id="edit-community-name"
          type="text"
          size="50"
          maxLength="100"
          placeholder="Enter Community Name (Max 100 characters)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />

        <label htmlFor="edit-community-description">
          Community Description: (Required)
        </label>
        <br />
        <textarea
          id="edit-community-description"
          className="create-community-description"
          size="100"
          placeholder="Enter Community Description (Max 500 characters)"
          maxLength="500"
          rows="4"
          cols="50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <br />

        <div className="edit-actions">
          <button
            id="update-community-submit"
            className="button"
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Community"}
          </button>

          <button
            id="delete-community"
            className="button delete-button"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isSubmitting}
          >
            Delete Community
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
              Are you sure you want to delete this community? This will also
              delete all posts and comments in this community.
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
