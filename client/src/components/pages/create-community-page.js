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
  const handleSubmit = async (e) => {
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

    // Check if community name already exists
    const existingCommunity = modelService.data.communities.find(
      (community) => community.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCommunity) {
      alert("A community with this name already exists.");
      return;
    }

    try {
      // Create the new community with user's display name
      await modelService.createCommunity(
        name,
        description,
        userData.displayName
      );

      // Show success message
      alert("Community created successfully!");

      // Navigate back to home page
      onPageChange("home");
    } catch (error) {
      // The server might also return a duplicate name error
      if (
        error.response &&
        error.response.data &&
        error.response.data.message ===
          "A community with this name already exists"
      ) {
        alert("A community with this name already exists.");
      } else {
        console.error("Error creating community:", error);
        alert(
          "An error occurred while creating the community. Please try again."
        );
      }
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
