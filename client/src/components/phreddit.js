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
    const handlePageChange = (pageName, additionalData = null, communityId = null, commentId = null) => {
        setCurrentPage(pageName);
        
        // Explicitly reset post ID when navigating to pages other than post view
        if (pageName !== 'postPage' && pageName !== 'editPost' && pageName !== 'createComment') {
            setSelectedPostId(null);
        } else if (pageName === 'postPage' || pageName === 'editPost') {
            setSelectedPostId(additionalData);
        }
        
        // Reset community ID when going to home
        if (pageName === 'home') {
            setSelectedCommunityId(null);
        } else if (pageName === 'editCommunity') {
            setSelectedCommunityId(additionalData);
        } else if (pageName === 'community' && communityId) {
            setSelectedCommunityId(communityId);
        }
        
        if (pageName === 'editComment') {
            setParentCommentId(additionalData);
        } else if (commentId !== undefined && commentId !== null) {
            setParentCommentId(commentId);
        } else if (pageName !== 'createComment') {
            setParentCommentId(null);
        }
        
        // If returning to home or community page, force a refresh to show updated content
        if (pageName === 'home' || pageName === 'community' || pageName === 'postPage' || pageName === 'profile') {
            setRefreshKey(prevKey => prevKey + 1);
        }
        
        // Pass the additional data to App.js if needed
        if (additionalData && (pageName === 'editCommunity' || pageName === 'editPost' || pageName === 'editComment' || pageName === 'postPage')) {
            onPageChange(pageName, additionalData);
        } else {
            onPageChange(pageName);
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
                onPageChange={onPageChange}
                handlePageChange={handlePageChange}
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