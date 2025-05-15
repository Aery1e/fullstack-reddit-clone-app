const mongoose = require('mongoose');
const Post = require('./models/posts');
const Comment = require('./models/comments');

// Connect to MongoDB test database
beforeAll(async () => {
  const mongoDBTestURL = 'mongodb://127.0.0.1:27017/phredditTest';
  await mongoose.connect(mongoDBTestURL);
});

// Clean up and close database connection after tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Recursive function to collect all comment IDs (including replies)
async function collectAllCommentIds(commentIds) {
  let allIds = [...commentIds]; // Start with the direct comment IDs
  
  // For each comment, recursively collect its replies
  for (const commentId of commentIds) {
    const comment = await Comment.findById(commentId);
    if (comment && comment.commentIDs && comment.commentIDs.length > 0) {
      const replyIds = await collectAllCommentIds(comment.commentIDs);
      allIds = [...allIds, ...replyIds];
    }
  }
  
  return allIds;
}

describe('Post Deletion', () => {
  let testPost;
  let allCommentIds;
  
  // Create a test post with comments and nested comments
  beforeAll(async () => {
    // Create test comments (bottom-up to establish links)
    const replyToReply = new Comment({
      content: 'Reply to a reply',
      commentedBy: 'testUser',
      commentIDs: []
    });
    await replyToReply.save();
    
    const reply = new Comment({
      content: 'Reply to a comment',
      commentedBy: 'testUser',
      commentIDs: [replyToReply._id]
    });
    await reply.save();
    
    const comment = new Comment({
      content: 'Test comment',
      commentedBy: 'testUser',
      commentIDs: [reply._id]
    });
    await comment.save();
    
    // Create test post
    testPost = new Post({
      title: 'Test Post',
      content: 'Test content',
      postedBy: 'testUser',
      commentIDs: [comment._id]
    });
    await testPost.save();
    
    // Collect all comment IDs
    allCommentIds = await collectAllCommentIds(testPost.commentIDs);
  });
  
  test('Deleting a post should remove it and all its comments from the database', async () => {
    // Define the recursive deleteCommentAndReplies function
    async function deleteCommentAndReplies(commentId) {
      const comment = await Comment.findById(commentId);
      if (!comment) return;
      
      // Recursively delete all replies
      for (const replyId of comment.commentIDs) {
        await deleteCommentAndReplies(replyId);
      }
      
      // Delete the comment itself
      await Comment.findByIdAndDelete(commentId);
    }
    
    // Delete all comments for this post
    for (const commentId of testPost.commentIDs) {
      await deleteCommentAndReplies(commentId);
    }
    
    // Delete the post
    await Post.findByIdAndDelete(testPost._id);
    
    // Check that post is deleted
    const deletedPost = await Post.findById(testPost._id);
    expect(deletedPost).toBeNull();
    
    // Check that all comments are deleted
    for (const commentId of allCommentIds) {
      const deletedComment = await Comment.findById(commentId);
      expect(deletedComment).toBeNull();
    }
  });
});