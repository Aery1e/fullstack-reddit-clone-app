import { useState } from 'react';
import modelService from '../pages/model-service';
import Timestamp from "../timestamp";
import { useEffect } from 'react';
export default function SearchPage({ onPageChange, searchResults, additionalData }) {
    const [sortMethod, setSortMethod] = useState('newest');
    useEffect(() => {
        async function fetchSearchResults() {
            if (!searchResults || searchResults.length === 0) {
                return;
            }
            
            try {
                // Refresh data
                await modelService.refreshData();
            } catch (error) {
                console.error("Error refreshing data:", error);
            }
        }
        
        fetchSearchResults();
    }, [searchResults]);

    // Helper function to get community name
    const getCommunityName = (post) => {
        const community = modelService.data.communities.find(
            comm => comm.postIDs && (
                comm.postIDs.includes(post._id)
            )
        );
        return community ? community.name : 'Unknown Community';
    };

    // Helper function to safely format post date
    const formatPostDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return Timestamp(date);
            }
            return "";
        } catch (e) {
            console.error("Date parsing error:", e);
            return "";
        }
    };

    // Helper function to get flair content
    const getFlairContent = (flairId) => {
        if (!flairId) return 'No Flair';

        const linkFlair = modelService.data.linkFlairs.find(
            flair => flair._id === flairId
        );
        return linkFlair ? linkFlair.content : 'No Flair';
    };

    // Truncate post content and add the ...
    const truncateContent = (content, maxLength = 100) => {
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    };

    // Handle post click to navigate to full post view
    const handlePostClick = (postID) => {
        console.log("Clicked on post with ID:", postID);

        // Check if the post exists in the model data
        const post = modelService.data.posts.find(p =>
            p._id === postID
        );

        if (post) {
            const idToUse = post._id;
            console.log("Navigating to post with ID:", idToUse);
            onPageChange('postPage', idToUse);
        } else {
            console.error("Post not found:", postID);
            // Fallback to home page
            onPageChange('home');
        }
    };
    const getSortedResults = () => {
        if (!searchResults || searchResults.length === 0) return [];

        switch (sortMethod) {
            case 'newest':
                return [...searchResults].sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
            case 'oldest':
                return [...searchResults].sort((a, b) => new Date(a.postedDate) - new Date(b.postedDate));
            case 'active':
                // Sort by most recent comment
                return [...searchResults].sort((a, b) => {
                    const aRecentComment = findMostRecentComment(a);
                    const bRecentComment = findMostRecentComment(b);

                    if (!aRecentComment && !bRecentComment) return 0;
                    if (!aRecentComment) return 1;
                    if (!bRecentComment) return -1;

                    return new Date(bRecentComment.commentedDate) - new Date(aRecentComment.commentedDate);
                });
            default:
                return searchResults;
        }
    };

    const findMostRecentComment = (post) => {
        if (!post.commentIDs || post.commentIDs.length === 0) {
            return null;
        }

        // Get all comments for this post
        const postComments = post.commentIDs
            .map(id => modelService.data.comments.find(c => c._id === id || c.commentID === id))
            .filter(Boolean);

        if (postComments.length === 0) {
            return null;
        }

        let mostRecentComment = postComments[0];

        // Check all comments
        for (const comment of postComments) {
            if (new Date(comment.commentedDate) > new Date(mostRecentComment.commentedDate)) {
                mostRecentComment = comment;
            }
        }

        return mostRecentComment;
    };
    // Render list of posts with truncated content
    const renderPostList = () => {
        const sortedResults = getSortedResults();
        return sortedResults.map(post => {

            // const community = modelService.data.communities.find(
            //     comm => comm.postIDs.includes(post.postID)
            // );
            // const linkFlair = modelService.data.linkFlairs.find(
            //     flair => flair.linkFlairID === post.linkFlairID
            // );
            const allComments = (post) => {
                if (!post) return 0;

                let total = 0;
                if (!post.commentIDs) {
                    return total;
                }
                total = post.commentIDs.length;

                // Check the replies of comments
                for (let i = 0; i < post.commentIDs.length; i++) {
                    const commentObj = findComment(post.commentIDs[i]);
                    // Add null check before recursion
                    if (commentObj) {
                        total = total + allComments(commentObj);
                    }
                }
                return total;
            }

            function findComment(commentId) {
                if (!commentId) return null;

                for (let i = 0; i < modelService.data["comments"].length; i++) {
                    if (commentId === modelService.data["comments"][i]._id) {
                        return modelService.data["comments"][i];
                    }
                }
                return null; // Return null if comment not found
            }

            return (
                <div key={post._id} className="post-item cursor-pointer hover:bg-gray-100" onClick={() => handlePostClick(post._id)}>
                    <p className="post-header">
                        {getCommunityName(post)} | {formatPostDate(post.postedDate)} | Posted by: {post.postedBy}
                    </p>
                    <h2 className="post-name">{post.title}</h2>
                    <h4 className="flair-name">{getFlairContent(post.linkFlairID)}</h4>
                    <p className="post-content">{truncateContent(post.content)}</p>
                    <p className="post-subheading">
                        Views: {post.views || 0} | Comments: {allComments(post)}
                    </p>
                    <hr />
                </div>
            );
        });
    };

    return (
        <div id="search-page" className="post-page" style={{ overflowY: 'auto', height: '100%' }} >
            <h2>Search Results:</h2>
            <hr />
            {searchResults.length === 0 ? (
                <div className="no-results">
                    <h3>No results found for: "{additionalData}"</h3>
                    <p id="post-count">0 posts</p>
                    <div className="no-results-image">
                        <p>We couldn't find anything matching your search criteria.</p>
                    </div>
                </div>
            ) : (
                <div>
                    <p>Found {searchResults.length} post{searchResults.length !== 1 ? 's' : ''}</p>
                    <div className="sort-buttons">
                        <button
                            className={`button ${sortMethod === 'newest' ? 'active-sort' : ''}`}
                            type="button"
                            onClick={() => setSortMethod('newest')}
                        >
                            Newest
                        </button>
                        <button
                            className={`button ${sortMethod === 'oldest' ? 'active-sort' : ''}`}
                            type="button"
                            onClick={() => setSortMethod('oldest')}
                        >
                            Oldest
                        </button>
                        <button
                            className={`button ${sortMethod === 'active' ? 'active-sort' : ''}`}
                            type="button"
                            onClick={() => setSortMethod('active')}
                        >
                            Active
                        </button>
                    </div>
                    {renderPostList()}
                </div>
            )}
        </div>
    );
}