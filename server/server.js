// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

// Import models
const User = require("./models/users");
const Community = require("./models/communities");
const Post = require("./models/posts");
const Comment = require("./models/comments");
const LinkFlair = require("./models/linkflairs");

// Create Express app
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoDB = "mongodb://127.0.0.1:27017/phreddit";
mongoose
  .connect(mongoDB)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// API Routes
// User Registration
app.post("/api/users/register", async (req, res) => {
  try {
    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email: req.body.email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUserByName = await User.findOne({
      displayName: req.body.displayName,
    });
    if (existingUserByName) {
      return res.status(400).json({ message: "Display name already in use" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds);

    // Create new user
    const user = new User({
      email: req.body.email,
      displayName: req.body.displayName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      passwordHash: passwordHash,
      reputation: 100,
      joinDate: new Date(),
    });

    const savedUser = await user.save();

    // Return success but don't include password hash
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        displayName: savedUser.displayName,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        reputation: savedUser.reputation,
        joinDate: savedUser.joinDate,
        isAdmin: savedUser.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// User Login
app.post("/api/users/login", async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Return user info
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        reputation: user.reputation,
        joinDate: user.joinDate,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        reputation: user.reputation,
        joinDate: user.joinDate,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Communities
app.get("/api/communities", async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/communities/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Community not found" });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/communities", async (req, res) => {
  try {
    // Check if a community with this name already exists
    const existingCommunity = await Community.findOne({ name: req.body.name });
    if (existingCommunity) {
      return res.status(400).json({ message: "A community with this name already exists" });
    }

    const community = new Community({
      name: req.body.name,
      description: req.body.description,
      postIDs: req.body.postIDs || [],
      members: req.body.members || [],
      createdBy: req.body.createdBy || req.body.members || [],
    });

    const newCommunity = await community.save();
    res.status(201).json(newCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a community and all its content
app.delete("/api/communities/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Delete all posts in this community
    for (const postId of community.postIDs) {
      const post = await Post.findById(postId);
      if (post) {
        // Delete all comments for this post
        for (const commentId of post.commentIDs) {
          await deleteCommentAndReplies(commentId);
        }

        // Delete the post
        await Post.findByIdAndDelete(postId);
      }
    }

    // Delete the community
    await Community.findByIdAndDelete(req.params.id);

    res.json({ message: "Community and all its content deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to recursively delete a comment and all its replies
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

// Delete a post and all its comments
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete all comments for this post
    for (const commentId of post.commentIDs) {
      await deleteCommentAndReplies(commentId);
    }

    // Delete the post
    await Post.findByIdAndDelete(req.params.id);

    // Remove post reference from its community
    const community = await Community.findOne({ postIDs: post._id });
    if (community) {
      community.postIDs = community.postIDs.filter(
        (id) => id.toString() !== post._id.toString()
      );
      await community.save();
    }

    res.json({ message: "Post and all its comments deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a comment and all its replies
app.delete("/api/comments/:id", async (req, res) => {
  try {
    await deleteCommentAndReplies(req.params.id);

    // Remove comment reference from its parent (post or comment)
    const parentPost = await Post.findOne({ commentIDs: req.params.id });
    if (parentPost) {
      parentPost.commentIDs = parentPost.commentIDs.filter(
        (id) => id.toString() !== req.params.id.toString()
      );
      await parentPost.save();
    } else {
      const parentComment = await Comment.findOne({
        commentIDs: req.params.id,
      });
      if (parentComment) {
        parentComment.commentIDs = parentComment.commentIDs.filter(
          (id) => id.toString() !== req.params.id.toString()
        );
        await parentComment.save();
      }
    }

    res.json({ message: "Comment and all its replies deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only increment view count if increment=true (default) in query params
    const shouldIncrement = req.query.increment !== "false";

    if (shouldIncrement) {
      post.views += 1;
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts", async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    linkFlairID: req.body.linkFlairID,
    postedBy: req.body.postedBy,
    views: 0,
    commentIDs: [],
  });

  try {
    const newPost = await post.save();

    // Add post ID to the community
    if (req.body.communityID) {
      await Community.findByIdAndUpdate(req.body.communityID, {
        $push: { postIDs: newPost._id },
      });

      // Add user to community members if not already a member
      await Community.findByIdAndUpdate(req.body.communityID, {
        $addToSet: { members: req.body.postedBy },
      });
    }

    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Vote on a post
app.post("/api/posts/:id/vote", async (req, res) => {
  try {
    const { vote, userId } = req.body;

    if (vote !== "up" && vote !== "down" && vote !== "none") {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    // Get the post
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get the voter and post creator
    const voter = await User.findById(userId);
    const creator = await User.findOne({ displayName: post.postedBy });

    if (!voter || !creator) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if voter has enough reputation
    if (voter.reputation < 50) {
      return res
        .status(403)
        .json({ message: "You need at least 50 reputation to vote" });
    }

    // Check if user has already voted on this post
    const voterIndex = post.voters
      ? post.voters.findIndex((v) => v.userId === userId)
      : -1;
    const previousVote =
      voterIndex !== -1 ? post.voters[voterIndex].vote : "none";

    // Handle vote state transitions
    if (vote === previousVote) {
      return res
        .status(400)
        .json({ message: "You have already voted this way" });
    }

    // Update post vote count and adjust reputation
    if (previousVote === "up") {
      post.votes -= 1;
      creator.reputation -= 5; // Remove previous upvote reputation boost
    } else if (previousVote === "down") {
      post.votes += 1;
      creator.reputation += 10; // Remove previous downvote reputation penalty
    }

    if (vote === "up") {
      post.votes += 1;
      creator.reputation += 5;
    } else if (vote === "down") {
      post.votes -= 1;
      creator.reputation -= 10;
    }

    // Update voter in the list
    if (voterIndex !== -1) {
      if (vote === "none") {
        // Remove vote if setting to neutral
        post.voters.splice(voterIndex, 1);
      } else {
        // Update existing vote
        post.voters[voterIndex].vote = vote;
      }
    } else if (vote !== "none") {
      // Add new vote
      if (!post.voters) post.voters = [];
      post.voters.push({ userId, vote });
    }

    // Save changes
    await post.save();
    await creator.save();

    res.json({
      votes: post.votes,
      posterReputation: creator.reputation,
      voterReputation: voter.reputation,
      userVote: vote,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vote on a comment
app.post("/api/comments/:id/vote", async (req, res) => {
  try {
    const { vote, userId } = req.body;

    if (vote !== "up" && vote !== "down" && vote !== "none") {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    // Get the comment
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get the voter and comment creator
    const voter = await User.findById(userId);
    const creator = await User.findOne({ displayName: comment.commentedBy });

    if (!voter || !creator) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if voter has enough reputation
    if (voter.reputation < 50) {
      return res
        .status(403)
        .json({ message: "You need at least 50 reputation to vote" });
    }

    // Check if user has already voted on this comment
    const voterIndex = comment.voters
      ? comment.voters.findIndex((v) => v.userId === userId)
      : -1;
    const previousVote =
      voterIndex !== -1 ? comment.voters[voterIndex].vote : "none";

    // Handle vote state transitions
    if (vote === previousVote) {
      return res
        .status(400)
        .json({ message: "You have already voted this way" });
    }

    // Update comment vote count and adjust reputation
    if (!comment.votes) comment.votes = 0;

    // First handle previous vote (removing it)
    if (previousVote === "up") {
      comment.votes -= 1;
      creator.reputation -= 5; // Remove previous upvote reputation boost
    } else if (previousVote === "down") {
      comment.votes += 1;
      creator.reputation += 10; // Remove previous downvote reputation penalty
    }

    // Then handle new vote (adding it)
    if (vote === "up") {
      comment.votes += 1;
      creator.reputation += 5;
    } else if (vote === "down") {
      comment.votes -= 1;
      creator.reputation -= 10;
    }

    // Update voter in the list
    if (voterIndex !== -1) {
      if (vote === "none") {
        // Remove vote if setting to neutral
        comment.voters.splice(voterIndex, 1);
      } else {
        // Update existing vote
        comment.voters[voterIndex].vote = vote;
      }
    } else if (vote !== "none") {
      // Add new vote
      if (!comment.voters) comment.voters = [];
      comment.voters.push({ userId, vote });
    }

    // Save changes
    await comment.save();
    await creator.save();

    res.json({
      votes: comment.votes,
      commenterReputation: creator.reputation,
      voterReputation: voter.reputation,
      userVote: vote,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a community
app.put("/api/communities/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // Update fields
    if (req.body.name) community.name = req.body.name;
    if (req.body.description) community.description = req.body.description;

    const updatedCommunity = await community.save();
    res.json(updatedCommunity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a post
app.put("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Update fields
    if (req.body.title) post.title = req.body.title;
    if (req.body.content) post.content = req.body.content;
    if (req.body.linkFlairID) post.linkFlairID = req.body.linkFlairID;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a comment
app.put("/api/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Update fields
    if (req.body.content) comment.content = req.body.content;

    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Join a community
app.post("/api/communities/:id/join", async (req, res) => {
  try {
    const userId = req.body.userId;
    const displayName = req.body.displayName;

    if (!displayName) {
      return res.status(400).json({ message: "Display name is required" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is already a member
    if (community.members.includes(displayName)) {
      return res
        .status(400)
        .json({ message: "Already a member of this community" });
    }

    // Add user to members list
    community.members.push(displayName);
    await community.save();

    res.json({ message: "Successfully joined community", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leave a community
app.post("/api/communities/:id/leave", async (req, res) => {
  try {
    const displayName = req.body.displayName;

    if (!displayName) {
      return res.status(400).json({ message: "Display name is required" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is a member
    if (!community.members.includes(displayName)) {
      return res
        .status(400)
        .json({ message: "Not a member of this community" });
    }

    // Remove user from members list
    community.members = community.members.filter(
      (member) => member !== displayName
    );
    await community.save();

    res.json({ message: "Successfully left community", community });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (admin only)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        _id: 1,
        email: 1,
        displayName: 1,
        firstName: 1,
        lastName: 1,
        reputation: 1,
        joinDate: 1,
        isAdmin: 1,
      }
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user and all their content (admin only)
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all communities created by the user
    const communities = await Community.find({ createdBy: user.displayName });
    for (const community of communities) {
      // Delete all posts in this community
      for (const postId of community.postIDs) {
        const post = await Post.findById(postId);
        if (post) {
          // Delete all comments for this post
          for (const commentId of post.commentIDs) {
            await deleteCommentAndReplies(commentId);
          }

          // Delete the post
          await Post.findByIdAndDelete(postId);
        }
      }

      // Delete the community
      await Community.findByIdAndDelete(community._id);
    }

    // Delete all posts created by the user
    const posts = await Post.find({ postedBy: user.displayName });
    for (const post of posts) {
      // Delete all comments for this post
      for (const commentId of post.commentIDs) {
        await deleteCommentAndReplies(commentId);
      }

      // Delete the post
      await Post.findByIdAndDelete(post._id);
    }

    // Delete all comments created by the user
    const comments = await Comment.find({ commentedBy: user.displayName });
    for (const comment of comments) {
      await deleteCommentAndReplies(comment._id);
    }

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and all their content deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Comments
app.get("/api/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/comments", async (req, res) => {
  const comment = new Comment({
    content: req.body.content,
    commentedBy: req.body.commentedBy,
    commentIDs: [],
  });

  try {
    const newComment = await comment.save();

    // Add comment ID to parent post or comment
    if (req.body.postID) {
      await Post.findByIdAndUpdate(req.body.postID, {
        $push: { commentIDs: newComment._id },
      });
    } else if (req.body.parentCommentID) {
      await Comment.findByIdAndUpdate(req.body.parentCommentID, {
        $push: { commentIDs: newComment._id },
      });
    }

    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Link Flairs
app.get("/api/linkflairs", async (req, res) => {
  try {
    const linkFlairs = await LinkFlair.find();
    res.json(linkFlairs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/linkflairs", async (req, res) => {
  const linkFlair = new LinkFlair({
    content: req.body.content,
  });

  try {
    const newLinkFlair = await linkFlair.save();
    res.status(201).json(newLinkFlair);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Search endpoint
app.get("/api/search", async (req, res) => {
  try {
    const searchTerms = req.query.q.toLowerCase().split(" ");

    // Search posts by title and content
    const postResults = await Post.find({
      $or: [
        { title: { $regex: searchTerms.join("|"), $options: "i" } },
        { content: { $regex: searchTerms.join("|"), $options: "i" } },
      ],
    });

    // Search comments by content
    const commentResults = await Comment.find({
      content: { $regex: searchTerms.join("|"), $options: "i" },
    });

    // Find posts that contain matching comments
    const postIds = new Set(postResults.map((post) => post._id.toString()));

    // For each comment that matched, find the posts
    for (const comment of commentResults) {
      // Find posts containing this comment
      const posts = await Post.find({ commentIDs: comment._id });

      // Add these posts to the results if they're not already included
      posts.forEach((post) => {
        postIds.add(post._id.toString());
      });
    }

    // Get all the posts
    const allMatchingPosts = await Post.find({
      _id: { $in: Array.from(postIds) },
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
process.on("SIGINT", () => {
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log("Server closed. Database instance disconnected.");
      process.exit(0);
    });
  });
});
