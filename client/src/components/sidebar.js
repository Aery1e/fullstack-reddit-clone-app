import React, { useEffect, useState } from "react";
import modelService from "./pages/model-service";

export default function Sidebar({ onPageChange,currentPage, selectedCommunityId }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Always fetch fresh community data from database
                await modelService.fetchCommunities();
                setLoading(false);
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Error loading data. Please refresh the page.");
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) return <div className="sidebar">Loading communities...</div>;
    if (error) return <div className="sidebar">Error: {error}</div>;

    console.log(
        "Sidebar render - model communities:",
        modelService.data.communities
    );

    return (
        <div className="sidebar">
            <button
                id="home-button"
                className={`button ${currentPage === 'home' ? 'home-button-active' : 'home-button button'}`}
                onClick={() => onPageChange("home")}
            >
                Home
            </button>
            <hr />
            <div className="communities">
                <h2>Communities</h2>
                <button
                    id="create-community-button"
                    className={`button ${currentPage === 'createCommunity' ? 'create-community-button-active' : 'create-community-button button'}`}
                    onClick={() => onPageChange("createCommunity")}
                >
                    Create Community
                </button>
                <br />
                <ul id="community-list" className="community-list">
                    {modelService.data.communities.map((community) => (
                        <li key={community._id}>
                            <button
                                className={`button ${selectedCommunityId === (community._id) ? 'button-active' : 'button'}`}
                                onClick={() => {
                                    // Pass the community information to the parent component
                                    onPageChange("community", null, community._id);
                                    console.log(`Selected community: ${community.name}`);
                                }}
                            >
                                {community.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
