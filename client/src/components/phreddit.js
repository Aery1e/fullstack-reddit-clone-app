import React, { useState, useEffect } from 'react';
import Header from './header.js';
import Content from './content.js';
import Sidebar from './sidebar.js';
import SearchPage from './search/search-page.js';

export default function Phreddit({ userData, isLoggedIn, onLogout, onPageChange }) {
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

    // Redirect to welcome page if user logs out
    useEffect(() => {
        if (!isLoggedIn && currentPage === 'createPost') {
            setCurrentPage('home');
        }
    }, [isLoggedIn, currentPage]);

    return (
        <div>
            <Header 
                onPageChange={handlePageChange}
                currentPage={currentPage}
                setSearchResults={setSearchResults}
                userData={userData} 
                isLoggedIn={isLoggedIn}
                onLogout={onLogout}
                onAuthPage={() => onPageChange('welcome')}
            />
            <div id="container" className="container">
                <Sidebar 
                    onPageChange={handlePageChange} 
                    currentPage={currentPage} 
                    selectedCommunityId={selectedCommunityId} 
                    key={`sidebar-${refreshKey}`}
                    isLoggedIn={isLoggedIn}
                    userData={userData}
                />
                {currentPage === 'searchPage' ? (
                    <SearchPage 
                        onPageChange={handlePageChange} 
                        searchResults={searchResults}
                        isLoggedIn={isLoggedIn}
                        userData={userData}
                    />
                ) : (
                    <Content 
                        currentPage={currentPage} 
                        onPageChange={handlePageChange} 
                        selectedPostId={selectedPostId}
                        selectedCommunityId={selectedCommunityId}
                        parentCommentId={parentCommentId}
                        key={`content-${refreshKey}`}
                        isLoggedIn={isLoggedIn}
                        userData={userData}
                    />
                )}
            </div>
        </div>
    );
}