import React, { useState, useEffect } from 'react';
import modelService from './pages/model-service';
import parseLinks from './links/parseLinks';
export default function TopBar({currentPage, selectedCommunityId, selectedPostId}) {

    // State to track current sort method
    const [sortMethod, setSortMethod] = useState('newest');
    
    console.log("TopBar render - selected community:", selectedCommunityId);
    
    // Get the selected community
    const selectedCommunity = selectedCommunityId 
    ? modelService.data.communities.find(c => c._id === selectedCommunityId) 
    : null;
    
    // Check if window.handlePostSort is available (set by PostPage component)
    useEffect(() => {
        // If we have a window object with the sort handler, initialize our state
        if (typeof window !== 'undefined' && window.currentSortMethod) {
            setSortMethod(window.currentSortMethod);
        }
    }, []);
    
    // State to track if the data is loaded
    const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
        const checkDataLoaded = async () => {
        if (modelService.data.posts.length === 0) {
            try {
                await modelService.refreshData();
                setDataLoaded(true);
            } catch (err) {
                console.error("Error loading data:", err);
            }
        } else {
            setDataLoaded(true);
        }
        };
        
        checkDataLoaded();
    }, []);

    // Format the community creation date
    const formatCommunityAge = (date) => {
        // Check if date is a valid Date object
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            // Try to parse the date string if it's not a Date object
            try {
                date = new Date(date);
                if (isNaN(date.getTime())) {
                    return "Created some time ago"; // Fallback if parsing fails
                }
            } catch (e) {
                console.error("Error parsing date:", e);
                return "Created some time ago"; // Fallback if an error occurs
            }
        }
        
        const now = new Date();
        const diffYears = now.getFullYear() - date.getFullYear();
        const diffMonths = now.getMonth() - date.getMonth();
        
        if (diffYears > 0) {
            return `Created ${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
        } else if (diffMonths > 0) {
            return `Created ${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
        } else {
            return "Created recently";
        }
    };
    
    // Handle sort button clicks
    const handleSortButtonClick = (method) => {
        setSortMethod(method);
        
        // Call the handler in PostPage if available
        if (typeof window !== 'undefined' && window.handlePostSort) {
            window.handlePostSort(method);
        }
    };

    if (selectedPostId){
        return null; // We don't need a top bar when selecting a singular post
    }

    return(
        <div className="top-bar-container">
            <div id="top-bar" className="top-bar"> 
                {selectedCommunity ? (
                    // Community top bar when a community is selected
                    <div className="community-top-bar">
                        <h2>
                            {selectedCommunity.name}
                        </h2>
                        <p>
                        <p dangerouslySetInnerHTML={{ __html: parseLinks(selectedCommunity.description) }}></p>
                        </p>
                        <div className="community-age">
                            {formatCommunityAge(selectedCommunity.startDate)}
                        </div>
                        <div className="community-members">
                            {(selectedCommunity.memberCount || 
                            (selectedCommunity.members && selectedCommunity.members.length) || 
                            0)} members
                        </div>
                        <div className="community-post-count">
                            {selectedCommunity.postIDs && Array.isArray(selectedCommunity.postIDs) ? 
                            selectedCommunity.postIDs.length : 0} posts
                        </div>
                    </div>
                ) : (
                    // Home page top bar
                    <div id="home-page-top-bar" className="home-page-top-bar">
                        <h2 id="Posts-Header">
                            All Posts
                        </h2>
                        <p id="post-count">
                            {dataLoaded ? 
                                `${modelService.data.posts.length} posts` : 
                                'Loading posts...'}
                        </p>
                        <p id="com-description"></p>
                        <p id="com-creation"></p>
                    </div>
                )}
                <div className="sort-buttons">
                    <button 
                        className={`button ${sortMethod === 'newest' ? 'active-sort' : ''}`}
                        type="button" 
                        id="new"
                        onClick={() => handleSortButtonClick('newest')}
                    >
                        Newest
                    </button>
                    <button 
                        className={`button ${sortMethod === 'oldest' ? 'active-sort' : ''}`} 
                        type="button" 
                        id="old"
                        onClick={() => handleSortButtonClick('oldest')}
                    >
                        Oldest
                    </button>
                    <button 
                        className={`button ${sortMethod === 'active' ? 'active-sort' : ''}`} 
                        type="button" 
                        id="active"
                        onClick={() => handleSortButtonClick('active')}
                    >
                        Active
                    </button>
                </div>
            </div>
        </div>
    );
}