import React, { useState } from "react";
import modelService from "./model-service";
import validateLinks from "../links/validateLinks";
export default function CreateCommunityPage({ onPageChange }) {
  // State to track form data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // For debugging - log on initial render
  console.log(
    "CreateCommunityPage render - communities:",
    modelService.data.communities
  );

  // Add method to create a community to the model if it doesn't exist
  if (!modelService.createCommunity) {
    modelService.createCommunity = function (name, description, creatorName) {
      // Generate a new community ID
      const newCommunityId = `community${this.data.communities.length + 1}`;

      // Create the new community object
      const newCommunity = {
        communityID: newCommunityId,
        name: name,
        description: description,
        postIDs: [],
        startDate: new Date(),
        members: [creatorName],
        memberCount: 1,
      };

      // Add the community to the communities array
      this.data.communities.push(newCommunity);

      return newCommunityId;
    };
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      alert("You must be logged in to create a community.");
      return;
    }

    // Validate required fields
    if (!name || !description) {
      alert("Please fill out all required fields.");
      return;
    }

    const linkValidation = validateLinks(description);
    if (!linkValidation.valid) {
      alert(linkValidation.error);
      return;
    }

    try {
      console.log(
        "Before creating community - communities:",
        modelService.data.communities.length
      );

      // Create the new community with user's display name
      const newCommunityId = modelService.createCommunity(
        name,
        description,
        userData.displayName
      );

      console.log("Created new community:", newCommunityId);
      console.log(
        "After creating community - communities:",
        modelService.data.communities.length
      );

      // Show success message
      alert("Community created successfully!");

      // Navigate back to home page
      onPageChange("home");
    } catch (error) {
      console.error("Error creating community:", error);
      alert(
        "An error occurred while creating the community. Please try again."
      );
    }
  };

  return (
    <div id="create-community-page" className="create-community-page">
      <h2>Create a Community</h2>
      <div>
        <label htmlFor="create-community-name">
          Community Name: (Required)
        </label>
        <br />
        <input
          id="create-community-name"
          type="text"
          size="50"
          maxLength="100"
          placeholder="Enter Community Name (Max 100 characters)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />

        <label htmlFor="create-community-description">
          Community Description: (Required)
        </label>
        <br />
        <textarea
          id="create-community-description"
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

        {/* Username is automatically taken from logged in user */}

        <button
          id="create-community-submit"
          className="button"
          type="button"
          onClick={handleSubmit}
        >
          Engender Community
        </button>
      </div>
    </div>
  );
}
