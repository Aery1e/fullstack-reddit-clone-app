import React, { useState, useEffect } from "react";
import modelService from "./model-service";
import validateLinks from "../links/validateLinks";
export default function CreatePostPage({ onPageChange }) {
  // State to track form data
  const [title, setTitle] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [flairId, setFlairId] = useState("");
  const [newFlair, setNewFlair] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // For debugging
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch fresh community data for the selector
        await modelService.fetchCommunities();

        // Fetch fresh link flair data for the selector
        await modelService.fetchLinkFlairs();

        console.log(
          "CreatePostPage render - model communities:",
          modelService.data.communities
        );
        console.log(
          "CreatePostPage render - model flairs:",
          modelService.data.linkFlairs
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      }
    }

    fetchData();
  }, []);
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the logged in user data
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      setError("You must be logged in to create a post.");
      return;
    }

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

      // Determine which flair to use
      let finalFlairId = flairId;

      // If user entered a new flair, create it
      if (newFlair && !flairId) {
        try {
          finalFlairId = await modelService.createFlair(newFlair);
          console.log("Created new flair:", finalFlairId);
        } catch (flairError) {
          console.error("Error creating flair:", flairError);
          setError("Error creating flair. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Create the new post
      console.log("Creating post with data:", {
        communityId,
        title,
        content,
        flairId: finalFlairId,
        username: userData.displayName,
      });

      const newPostId = await modelService.createPost(
        communityId,
        title,
        content,
        finalFlairId,
        userData.displayName
      );

      console.log("Created new post:", newPostId);

      // Show success message
      alert("Post created successfully!");

      // Navigate back to home page
      onPageChange("home");
    } catch (error) {
      console.error("Error creating post:", error);
      setError(
        "An error occurred while creating the post. Please check all fields and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="create-post-page" className="create-post-page">
      <h2>Create a New Post</h2>

      {error && (
        <div className="error-message" style={{ color: "red" }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="create-post-community-select">
          Select Community: (Required)
        </label>
        <select
          id="create-post-community-select"
          required
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
        >
          <option value="">-- Select a Community --</option>
          {modelService.data.communities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="create-post-title">Post Title: (Required)</label>
        <br />
        <input
          id="create-post-title"
          type="text"
          size="50"
          maxLength="100"
          placeholder="Enter Post Title (Max 100 characters)"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />

        <label htmlFor="create-post-flair-select">Select Existing Flair:</label>
        <select
          id="create-post-flair-select"
          value={flairId}
          onChange={(e) => {
            setFlairId(e.target.value);
            // Clear new flair if an existing one is selected
            if (e.target.value) {
              setNewFlair("");
            }
          }}
        >
          <option value="">-- Select a Flair --</option>
          {modelService.data.linkFlairs.map((flair) => (
            <option key={flair._id} value={flair._id}>
              {flair.content}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="create-post-flair">Or Create a New Flair:</label>
        <br />
        <input
          id="create-post-flair"
          type="text"
          size="50"
          maxLength="30"
          placeholder="Enter Post Flair (Max 30 characters)"
          value={newFlair}
          onChange={(e) => {
            setNewFlair(e.target.value);
            // Clear flair selection if typing a new flair
            if (e.target.value) {
              setFlairId("");
            }
          }}
          disabled={flairId !== ""}
        />
        <br />

        <label htmlFor="create-post-content">Content: (Required)</label>
        <br />
        <textarea
          id="create-post-content"
          className="create-post-description"
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
          text](https://www.google.com/)
        </small>

        {/* Username is automatically taken from logged in user */}

        <button
          id="create-post-submit"
          className="button"
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Submit Post"}
        </button>
      </div>
    </div>
  );
}
