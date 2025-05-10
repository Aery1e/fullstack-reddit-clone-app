import React, { useState } from 'react';
import Header from './header.js';
import Content from './content.js';
import Sidebar from './sidebar.js';
import SearchPage from './search/search-page.js';

export default function Phreddit() {
    // State for the current page, selected post, and selected community
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [selectedCommunityId, setSelectedCommunityId] = useState(null);
    const [parentCommentId, setParentCommentId] = useState(null);
    // Add new state for search results
    const [searchResults, setSearchResults] = useState([]);
    
    // Key to force re-render when needed
    const [refreshKey, setRefreshKey] = useState(0);

    // Function to handle page changes
    const handlePageChange = (pageName, postId = null, communityId = null, commentId = null) => {
        setCurrentPage(pageName);
        
        if (postId !== undefined) {
            setSelectedPostId(postId);
        }
        
        if (communityId !== undefined) {
            setSelectedCommunityId(communityId);
        }
        
        if (commentId !== undefined) {
            setParentCommentId(commentId);
        }
        
        // If returning to home or community page, force a refresh to show updated content
        if (pageName === 'home' || pageName === 'community' || pageName === 'postPage') {
            setRefreshKey(prevKey => prevKey + 1);
        }
    };

    return (
        <div>
            <Header 
                onPageChange={handlePageChange}
                currentPage={currentPage}
                setSearchResults={setSearchResults} 
            />
            <div id="container" className="container">
                <Sidebar onPageChange={handlePageChange} currentPage={currentPage} selectedCommunityId={selectedCommunityId} key={`sidebar-${refreshKey}`} />
                {currentPage === 'searchPage' ? (
                    <SearchPage 
                        onPageChange={handlePageChange} 
                        searchResults={searchResults}
                    />
                ) : (
                    <Content 
                        currentPage={currentPage} 
                        onPageChange={handlePageChange} 
                        selectedPostId={selectedPostId}
                        selectedCommunityId={selectedCommunityId}
                        parentCommentId={parentCommentId}
                        key={`content-${refreshKey}`}
                    />
                )}
            </div>
        </div>
    );
}