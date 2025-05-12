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

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
    });
    return newPostDoc.save();
}

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
    });
    return newCommunityDoc.save();
}

async function createUser(userObj) {
    let newUserDoc = new UserModel({
        email: userObj.email,
        displayName: userObj.displayName,
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        passwordHash: userObj.passwordHash,
        reputation: userObj.reputation,
        joinDate: userObj.joinDate,
        isAdmin: userObj.isAdmin || false
    });
    return newUserDoc.save();
}

async function init() {
    // First create admin user from command line arguments
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    const adminUser = {
        email: adminEmail,
        displayName: adminDisplayName,
        firstName: "Admin",
        lastName: "User",
        passwordHash: adminPasswordHash,
        reputation: 1000,
        joinDate: new Date(),
        isAdmin: true
    };
    
    let officialAdmin = await createUser(adminUser);
    console.log(`Admin user created with email: ${adminEmail}`);
    
    // link flair objects
    const linkFlair1 = { // link flair 1
        linkFlairID: 'lf1',
        content: 'The jerkstore called...', 
    };
    const linkFlair2 = { //link flair 2
        linkFlairID: 'lf2',
        content: 'Literal Saint',
    };
    const linkFlair3 = { //link flair 3
        linkFlairID: 'lf3',
        content: 'They walk among us',
    };
    const linkFlair4 = { //link flair 4
        linkFlairID: 'lf4',
        content: 'Worse than Hitler',
    };
    let linkFlairRef1 = await createLinkFlair(linkFlair1);
    let linkFlairRef2 = await createLinkFlair(linkFlair2);
    let linkFlairRef3 = await createLinkFlair(linkFlair3);
    let linkFlairRef4 = await createLinkFlair(linkFlair4);
    
    const post2 = { // post 2
        postID: 'p2',
        title: "Remember when this was a HISTORY channel?",
        content: 'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
        linkFlairID: linkFlairRef3,
        postedBy: 'MarcoArelius',
        postedDate: new Date('September 9, 2024 14:24:00'),
        commentIDs: [],
        views: 1023,
        votes: 0
    };
    let postRef2 = await createPost(post2);
    
    // community objects
    const community1 = { // community object 1
        communityID: 'community1',
        name: 'The History Channel',
        description: 'A fantastical reimagining of our past and present.',
        postIDs: [postRef2],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: ['MarcoArelius'],
        memberCount: 1,
        createdBy: "MarcoArelius"
    };
    let communityRef1 = await createCommunity(community1);

    // User objects
    const admin = { // admin
        email: "admin@Phreddit.com",
        displayName: "admin",
        firstName: "John",
        lastName: "Doe",
        passwordHash: bcrypt.hashSync("password", 10),
        reputation: 1000,
        joinDate: new Date()
    }
    
    let adminacc = await createUser(admin);

    const marco = { // Marco
        email: "marcoA@gmail.com",
        displayName: "MarcoArelius",
        firstName: "Marco",
        lastName: "Arelius",
        passwordHash: bcrypt.hashSync("password123", 10),
        reputation: 100,
        joinDate: new Date()
    }

    let marc = await createUser(marco);

    const guest = { // Guest
        email: "guest@gmail.com",
        displayName: "Guest",
        firstName: "Guest",
        lastName: "User",
        passwordHash: bcrypt.hashSync("", 10),
        reputation: 0,
        joinDate: new Date()
    }

    let g = await createUser(guest);

    if (db) {
        db.close();
    }
    console.log("done");
}

init()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('processing...');