// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import models
const Community = require('./models/communities');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const LinkFlair = require('./models/linkflairs');

// Create Express app
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoDB = "mongodb://127.0.0.1:27017/phreddit";
mongoose.connect(mongoDB)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// API Routes

// Communities
app.get('/api/communities', async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/communities/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: 'Community not found' });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/communities', async (req, res) => {
  const community = new Community({
    name: req.body.name,
    description: req.body.description,
    postIDs: req.body.postIDs || [],
    members: req.body.members || []
  });

  try {
    const newCommunity = await community.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    linkFlairID: req.body.linkFlairID,
    postedBy: req.body.postedBy,
    views: 0,
    commentIDs: []
  });

  try {
    const newPost = await post.save();
    
    // Add post ID to the community
    if (req.body.communityID) {
      await Community.findByIdAndUpdate(
        req.body.communityID,
        { $push: { postIDs: newPost._id } }
      );
      
      // Add user to community members if not already a member
      await Community.findByIdAndUpdate(
        req.body.communityID,
        { $addToSet: { members: req.body.postedBy } }
      );
    }
    
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/comments/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  const comment = new Comment({
    content: req.body.content,
    commentedBy: req.body.commentedBy,
    commentIDs: []
  });

  try {
    const newComment = await comment.save();
    
    // Add comment ID to parent post or comment
    if (req.body.postID) {
      await Post.findByIdAndUpdate(
        req.body.postID,
        { $push: { commentIDs: newComment._id } }
      );
    } else if (req.body.parentCommentID) {
      await Comment.findByIdAndUpdate(
        req.body.parentCommentID,
        { $push: { commentIDs: newComment._id } }
      );
    }
    
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Link Flairs
app.get('/api/linkflairs', async (req, res) => {
  try {
    const linkFlairs = await LinkFlair.find();
    res.json(linkFlairs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/linkflairs', async (req, res) => {
  const linkFlair = new LinkFlair({
    content: req.body.content
  });

  try {
    const newLinkFlair = await linkFlair.save();
    res.status(201).json(newLinkFlair);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const searchTerms = req.query.q.toLowerCase().split(' ');
    
    // Search posts by title and content
    const postResults = await Post.find({
      $or: [
        { title: { $regex: searchTerms.join('|'), $options: 'i' } },
        { content: { $regex: searchTerms.join('|'), $options: 'i' } }
      ]
    });
    
    // Search comments by content
    const commentResults = await Comment.find({
      content: { $regex: searchTerms.join('|'), $options: 'i' }
    });
    
    // Find posts that contain matching comments
    const postIds = new Set(postResults.map(post => post._id.toString()));
    
    // For each comment that matched, find the posts
    for (const comment of commentResults) {
      // Find posts containing this comment
      const posts = await Post.find({ commentIDs: comment._id });
      
      // Add these posts to the results if they're not already included
      posts.forEach(post => {
        postIds.add(post._id.toString());
      });
    }
    
    // Get all the posts
    const allMatchingPosts = await Post.find({
      _id: { $in: Array.from(postIds) }
    });
    
    res.json(allMatchingPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Root endpoint
app.get("/", function (req, res) {
  console.log("Get request received at '/'");
  res.send("Welcome to Phreddit API!");
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

// Handle proper server shutdown
process.on('SIGINT', () => {
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log('Server closed. Database instance disconnected.');
      process.exit(0);
    });
  });
});