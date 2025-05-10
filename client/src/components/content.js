import TopBar from "./top-bar";
import CreateCommunityPage from "./pages/create-community-page";
import CreatePostPage from "./pages/create-post-page";
import CreateCommentPage from "./pages/create-comment-page";
import PostPage from "./pages/post-page";

export default function Content({currentPage, onPageChange, selectedPostId, selectedCommunityId, parentCommentId}) {
    return (
        <div id="content" className="content">
            {(currentPage !== 'createCommunity' && currentPage !== 'createPost' && currentPage !== 'createComment') && 
                <TopBar 
                    currentPage={currentPage} 
                    selectedCommunityId={selectedCommunityId} 
                    selectedPostId={selectedPostId}
                />
            }
            <div className="scrollable-content">
                {currentPage === 'createCommunity' && <CreateCommunityPage onPageChange={onPageChange} />}
                {currentPage === 'createPost' && <CreatePostPage onPageChange={onPageChange} />}
                {currentPage === 'createComment' && 
                    <CreateCommentPage 
                        onPageChange={onPageChange} 
                        selectedPostId={selectedPostId}
                        parentCommentId={parentCommentId}
                    />
                }
                {(currentPage === 'postPage' || currentPage === 'home' || currentPage === 'community') && 
                    <PostPage 
                        onPageChange={onPageChange} 
                        selectedPostId={selectedPostId}
                        selectedCommunityId={selectedCommunityId}
                    />
                }
            </div>
        </div>
    );
}