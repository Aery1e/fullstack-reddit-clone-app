/* server/init.js
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script from PA03 as 
** inspiration, but you cannot just copy and paste it--you script has to do more
** to handle the addition of users to the data model.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('./models/users');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');

let userArgs = process.argv.slice(2);

if (userArgs.length < 3) {
    console.log('ERROR: You need to specify admin email, display name, and password');
    console.log('Example: node init.js mongodb://127.0.0.1:27017/phreddit admin@example.com AdminUser password123');
    return;
}

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let mongoDB = userArgs[0];
const adminEmail = userArgs[1];
const adminDisplayName = userArgs[2];
const adminPassword = userArgs[3];

mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Helper functions for database operations
async function createUser(userObj) {
    let newUserDoc = new UserModel(userObj);
    return newUserDoc.save();
}

async function createLinkFlair(flairObj) {
    let newFlairDoc = new LinkFlairModel(flairObj);
    return newFlairDoc.save();
}

async function createComment(commentObj) {
    let newCommentDoc = new CommentModel(commentObj);
    return newCommentDoc.save();
}

async function createPost(postObj) {
    let newPostDoc = new PostModel(postObj);
    return newPostDoc.save();
}

async function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel(communityObj);
    return newCommunityDoc.save();
}

async function init() {
    // Clear existing data
    await UserModel.deleteMany({});
    await CommunityModel.deleteMany({});
    await PostModel.deleteMany({});
    await CommentModel.deleteMany({});
    await LinkFlairModel.deleteMany({});
    
    console.log("Cleared existing data");

    // Create users with different reputation levels
    const saltRounds = 10;
    
    // Admin user (from command line arguments)
    const adminUser = {
        email: adminEmail,
        displayName: adminDisplayName,
        firstName: "Admin",
        lastName: "User",
        passwordHash: await bcrypt.hash(adminPassword, saltRounds),
        reputation: 1000,
        joinDate: new Date(),
        isAdmin: true
    };
    const adminUserRef = await createUser(adminUser);
    console.log(`Admin user created with email: ${adminEmail}`);
    
    // Regular users
    const users = [
        {
            email: "john@example.com",
            displayName: "JohnDoe",
            firstName: "John",
            lastName: "Doe",
            passwordHash: await bcrypt.hash("password123", saltRounds),
            reputation: 200,
            joinDate: new Date('2024-01-15')
        },
        {
            email: "jane@example.com",
            displayName: "JaneSmith",
            firstName: "Jane",
            lastName: "Smith",
            passwordHash: await bcrypt.hash("password123", saltRounds),
            reputation: 150,
            joinDate: new Date('2024-02-10')
        },
        {
            email: "bob@example.com",
            displayName: "BobBuilder",
            firstName: "Bob",
            lastName: "Builder",
            passwordHash: await bcrypt.hash("password123", saltRounds),
            reputation: 75,
            joinDate: new Date('2024-03-20')
        },
        {
            email: "alice@example.com",
            displayName: "AliceWonder",
            firstName: "Alice",
            lastName: "Wonder",
            passwordHash: await bcrypt.hash("password123", saltRounds),
            reputation: 45, // Below voting threshold
            joinDate: new Date('2024-04-05')
        }
    ];
    
    const userRefs = [];
    for (const user of users) {
        const userRef = await createUser(user);
        userRefs.push(userRef);
        console.log(`Created user: ${user.displayName}`);
    }
    
    // Create link flairs
    const flairs = [
        { content: "Discussion" },
        { content: "Question" },
        { content: "Announcement" },
        { content: "News" },
        { content: "Humor" },
        { content: "Serious" }
    ];
    
    const flairRefs = [];
    for (const flair of flairs) {
        const flairRef = await createLinkFlair(flair);
        flairRefs.push(flairRef);
        console.log(`Created flair: ${flair.content}`);
    }
    
    // Create communities
    const communities = [
        {
            name: "Technology",
            description: "Discuss the latest trends in technology and gadgets.",
            members: [adminUserRef.displayName, userRefs[0].displayName, userRefs[1].displayName],
            startDate: new Date('2024-01-01'),
            postIDs: [],
            createdBy: [adminUserRef.displayName]
        },
        {
            name: "Gaming",
            description: "A community for gamers to discuss their favorite games and share tips.",
            members: [userRefs[0].displayName, userRefs[2].displayName, userRefs[3].displayName],
            startDate: new Date('2024-01-15'),
            postIDs: [],
            createdBy: [userRefs[0].displayName]
        },
        {
            name: "Cooking",
            description: "Share recipes, cooking techniques, and food-related stories.",
            members: [userRefs[1].displayName, userRefs[3].displayName],
            startDate: new Date('2024-02-01'),
            postIDs: [],
            createdBy: [userRefs[1].displayName]
        },
        {
            name: "Fitness",
            description: "Tips, advice, and discussions related to fitness and healthy living.",
            members: [adminUserRef.displayName, userRefs[2].displayName],
            startDate: new Date('2024-02-15'),
            postIDs: [],
            createdBy: [userRefs[2].displayName]
        },
        {
            name: "Books",
            description: "A place to discuss books, authors, and literature.",
            members: [userRefs[0].displayName, userRefs[1].displayName],
            startDate: new Date('2024-03-01'),
            postIDs: [],
            createdBy: [userRefs[0].displayName]
        }
    ];
    
    const communityRefs = [];
    for (const community of communities) {
        const communityRef = await createCommunity(community);
        communityRefs.push(communityRef);
        console.log(`Created community: ${community.name}`);
    }
    
    // Create posts in each community
    const postsData = [
        // Technology community
        {
            title: "The rise of mechanical keyboards",
            content: "I recently switched to a mechanical keyboard and can't believe I waited so long. The typing experience is amazing! What keyboards are you all using?",
            postedBy: userRefs[0].displayName,
            community: communityRefs[0]._id,
            flair: flairRefs[0]._id, // Discussion
            views: 120,
            votes: 15
        },
        {
            title: "Which smartphone has the best camera in 2025?",
            content: "Looking to upgrade my phone and camera quality is my top priority. Any recommendations based on personal experience?",
            postedBy: userRefs[1].displayName,
            community: communityRefs[0]._id,
            flair: flairRefs[1]._id, // Question
            views: 85,
            votes: 8
        },
        
        // Gaming community
        {
            title: "Best open-world games released this year",
            content: "I just finished Elden Ring 2 and I'm looking for another immersive open-world experience. What are your recommendations?",
            postedBy: userRefs[2].displayName,
            community: communityRefs[1]._id,
            flair: flairRefs[1]._id, // Question
            views: 210,
            votes: 25
        },
        {
            title: "Is PC gaming still worth the investment?",
            content: "With consoles becoming more powerful and cloud gaming on the rise, I'm debating whether to build a new gaming PC or just get a PS6. Thoughts?",
            postedBy: userRefs[0].displayName,
            community: communityRefs[1]._id,
            flair: flairRefs[0]._id, // Discussion
            views: 175,
            votes: 12
        },
        
        // Cooking community
        {
            title: "One-pot meals that impress guests",
            content: "I'm looking for simple but impressive recipes that won't have me using every pot and pan in the kitchen. Any favorites to share?",
            postedBy: userRefs[1].displayName,
            community: communityRefs[2]._id,
            flair: flairRefs[1]._id, // Question
            views: 95,
            votes: 18
        },
        
        // Fitness community
        {
            title: "How to stay motivated during winter",
            content: "I always struggle to maintain my workout routine during the colder months. Any tips for staying motivated?",
            postedBy: userRefs[2].displayName,
            community: communityRefs[3]._id,
            flair: flairRefs[1]._id, // Question
            views: 88,
            votes: 14
        },
        
        // Books community
        {
            title: "Book series that are worth finishing",
            content: "I've started so many series but abandoned them after the first book. Which series actually gets better as it goes on?",
            postedBy: userRefs[0].displayName,
            community: communityRefs[4]._id,
            flair: flairRefs[0]._id, // Discussion
            views: 102,
            votes: 20
        }
    ];
    
    const postRefs = [];
    for (const postData of postsData) {
        const post = {
            title: postData.title,
            content: postData.content,
            linkFlairID: postData.flair,
            postedBy: postData.postedBy,
            postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
            commentIDs: [],
            views: postData.views,
            votes: postData.votes
        };
        
        const postRef = await createPost(post);
        postRefs.push(postRef);
        
        // Add post to community
        await CommunityModel.findByIdAndUpdate(
            postData.community,
            { $push: { postIDs: postRef._id } }
        );
        
        console.log(`Created post: ${post.title} in community ${postData.community}`);
    }
    
    // Create comments and replies
    // Create top-level comments first
    const commentsData = [
        {
            content: "I've been using a Keychron Q1 and the typing experience is incredible. The sound is so satisfying!",
            commentedBy: userRefs[1].displayName,
            post: postRefs[0]._id,
            votes: 7
        },
        {
            content: "I prefer membrane keyboards because they're quieter. My coworkers would hate me if I brought in a mechanical one.",
            commentedBy: userRefs[3].displayName,
            post: postRefs[0]._id,
            votes: 4
        },
        {
            content: "The iPhone 16 Pro has been amazing for me. The computational photography makes every shot look professional.",
            commentedBy: userRefs[0].displayName,
            post: postRefs[1]._id,
            votes: 3
        },
        {
            content: "Don't sleep on the Pixel 10. Google's image processing is still ahead of the competition.",
            commentedBy: userRefs[2].displayName,
            post: postRefs[1]._id,
            votes: 5
        },
        {
            content: "Hogwarts Legacy 2 has been my favorite open-world game this year. The magic system is incredibly satisfying.",
            commentedBy: userRefs[0].displayName,
            post: postRefs[2]._id,
            votes: 8
        },
        {
            content: "I still think PC gaming offers the best experience if you care about graphics and frame rates.",
            commentedBy: userRefs[3].displayName,
            post: postRefs[3]._id,
            votes: 6
        },
        {
            content: "My go-to is a butternut squash risotto. One pot, minimal effort, but everyone thinks you've been cooking all day!",
            commentedBy: userRefs[3].displayName,
            post: postRefs[4]._id,
            votes: 12
        }
    ];
    
    const commentRefs = [];
    for (const commentData of commentsData) {
        const comment = {
            content: commentData.content,
            commentedBy: commentData.commentedBy,
            commentedDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // Random date within last 10 days
            commentIDs: [],
            votes: commentData.votes
        };
        
        const commentRef = await createComment(comment);
        commentRefs.push(commentRef);
        
        // Add comment to post
        await PostModel.findByIdAndUpdate(
            commentData.post,
            { $push: { commentIDs: commentRef._id } }
        );
        
        console.log(`Created comment by ${comment.commentedBy} on post ${commentData.post}`);
    }
    
    // Create replies to comments
    const repliesData = [
        {
            content: "Do you have any recommendations for a wireless mechanical keyboard?",
            commentedBy: userRefs[2].displayName,
            parentComment: commentRefs[0]._id,
            votes: 3
        },
        {
            content: "There are actually some pretty quiet mechanical switches these days, like Cherry MX Silent Reds.",
            commentedBy: userRefs[0].displayName,
            parentComment: commentRefs[1]._id,
            votes: 2
        },
        {
            content: "Have you tried the night mode? It's incredible for low-light photography.",
            commentedBy: userRefs[1].displayName,
            parentComment: commentRefs[2]._id,
            votes: 1
        },
        {
            content: "I've been playing it too! The side quests are so well-designed.",
            commentedBy: userRefs[1].displayName,
            parentComment: commentRefs[4]._id,
            votes: 4
        },
        {
            content: "Could you share your recipe? I'd love to try making it!",
            commentedBy: userRefs[0].displayName,
            parentComment: commentRefs[6]._id,
            votes: 5
        }
    ];
    
    for (const replyData of repliesData) {
        const reply = {
            content: replyData.content,
            commentedBy: replyData.commentedBy,
            commentedDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000), // Random date within last 5 days
            commentIDs: [],
            votes: replyData.votes
        };
        
        const replyRef = await createComment(reply);
        
        // Add reply to parent comment
        await CommentModel.findByIdAndUpdate(
            replyData.parentComment,
            { $push: { commentIDs: replyRef._id } }
        );
        
        console.log(`Created reply by ${reply.commentedBy} to comment ${replyData.parentComment}`);
    }
    
    console.log("Database initialized");
    
    if (db) {
        db.close();
    }
}

init()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('Processing database initialization...');