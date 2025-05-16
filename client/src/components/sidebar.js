import React, { useEffect, useState } from "react";
import modelService from "./pages/model-service";

export default function Sidebar({
  onPageChange,
  currentPage,
  selectedCommunityId,
  isLoggedIn,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Set up a global event listener for community membership changes
  useEffect(() => {
    // Create a custom event handler
    const handleCommunityUpdate = () => {
      setRefreshKey((prevKey) => prevKey + 1);
    };

    // Add the event listener
    window.addEventListener(
      "communityMembershipChanged",
      handleCommunityUpdate
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "communityMembershipChanged",
        handleCommunityUpdate
      );
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        // Always fetch fresh community data from database
        await modelService.fetchCommunities();
        setCommunities(modelService.data.communities);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error loading data. Please refresh the page.");
        setLoading(false);
      }
    }

    loadData();
  }, [refreshKey]);

  if (loading) return <div className="sidebar">Loading communities...</div>;
  if (error) return <div className="sidebar">Error: {error}</div>;

  const renderCommunityList = () => {
    // Get user data to check joined communities
    const userData = JSON.parse(localStorage.getItem("userData"));

    // Sort communities - joined communities first, then alphabetically within each group
    const joinedCommunities = [];
    const otherCommunities = [];

    communities.forEach((community) => {
      if (
        isLoggedIn &&
        userData &&
        community.members &&
        community.members.includes(userData.displayName)
      ) {
        joinedCommunities.push(community);
      } else {
        otherCommunities.push(community);
      }
    });

    // Sort each group alphabetically
    joinedCommunities.sort((a, b) => a.name.localeCompare(b.name));
    otherCommunities.sort((a, b) => a.name.localeCompare(b.name));

    // Render the list with a separator
    return (
      <>
        {joinedCommunities.length > 0 && (
          <>
            <div className="community-separator">Your Communities</div>
            {joinedCommunities.map((community) => (
              <li key={community._id}>
                <button
                  className={`button ${
                    selectedCommunityId === community._id
                      ? "button-active"
                      : "button"
                  }`}
                  onClick={() => {
                    onPageChange("community", null, community._id);
                  }}
                >
                  {community.name}
                </button>
              </li>
            ))}
          </>
        )}

        {otherCommunities.length > 0 && (
          <>
            <div className="community-separator">Other Communities</div>
            {otherCommunities.map((community) => (
              <li key={community._id}>
                <button
                  className={`button ${
                    selectedCommunityId === community._id
                      ? "button-active"
                      : "button"
                  }`}
                  onClick={() => {
                    onPageChange("community", null, community._id);
                  }}
                >
                  {community.name}
                </button>
              </li>
            ))}
          </>
        )}
      </>
    );
  };

  return (
    <div className="sidebar">
      <button
        id="home-button"
        className={`button ${
          currentPage === "home" ? "home-button-active" : "home-button button"
        }`}
        onClick={() => onPageChange("home")}
      >
        Home
      </button>
      <hr />
      <div className="communities">
        <h2>Communities</h2>
        <button
          id="create-community"
          className={`button ${
            currentPage === "createCommunity"
              ? "create-community-button-active"
              : isLoggedIn
              ? "create-community-button"
              : "create-community-button-Guest"
          }`}
          onClick={() => {
            if (isLoggedIn) {
              onPageChange("createCommunity");
            }
          }}
        >
          Create Community
        </button>
        <br />
        <ul id="community-list" className="community-list">
          {renderCommunityList()}
        </ul>
      </div>
    </div>
  );
}
