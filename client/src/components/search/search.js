import modelService from '../pages/model-service';

export default function search(str) {
    if (!str || str.trim() === '') {
        return [];
    }
    let match = [];
    let unmatched = modelService.data["posts"].slice();
    // Search through posts for title with matching word
    let words = str.replace(/[^\w\s]/g, '').split(" ");
    words.forEach(word => {
        //Search through Posts
        for (let i = 0; i < unmatched.length; i++) {
            //Titles
            let list = unmatched[i].title.split(" ");
            // This check is to see if the post has been already added to the matched list in the forEach function
            let check = false;
            list.forEach(group => {
                if (group.toLowerCase() === word.toLowerCase() && check === false) {
                    match.push(unmatched[i]);
                    check = true;
                }
            })
            // Checks if posts has been added in title section, therefore pass content section
            if (!check) {
                //Content
                list = (unmatched[i].content).split(" ");
                list.forEach(group => {
                    if (group.toLowerCase() === word.toLowerCase() && check === false) {
                        match.push(unmatched[i]);
                        check = true;
                    }
                })
            }
        }
        // Removes matched posts already, if not already removed
        for (let i = 0; i < match.length; i++) {
            if (unmatched.indexOf(match[i]) !== -1) {
                unmatched.splice((unmatched.indexOf(match[i])), 1);
            }
        }
        //Iterate all comments
        let comMatch = [];
        for (let i = 0; i < modelService.data["comments"].length; i++) {
            if (modelService.data["comments"][i].content.toLowerCase().replace(/[^\w\s]/g, '').split(" ").includes(word.toLowerCase())) {
                comMatch.push(modelService.data["comments"][i]);
            }
        }
        //Iterate through match comments
        for (let i = 0; i < comMatch.length; i++) {
            //Iterate through unmatched posts
            for (let j = 0; j < unmatched.length; j++) {
                if (findPost(unmatched[j], comMatch[i])) {
                    match.push(unmatched[j])
                }
            }
        }
        // Removes matched posts already, if not already removed
        for (let i = 0; i < match.length; i++) {
            if (unmatched.indexOf(match[i]) !== -1) {
                unmatched.splice((unmatched.indexOf(match[i])), 1);
            }
        }
    });
    return [
        ...new Set(match.map(post => post._id))]
        .map(id =>
            modelService.data.posts.find(post => post._id === id)
        );
}

function findPost(post, comment) {
    // Check if post or comment is undefined
    if (!post || !comment) {
        return false;
    }

    // Check if commentIDs is empty
    if (!post.commentIDs) {
        return false;
    }

    // Check if comment is in commentIDs
    if (post.commentIDs.indexOf(comment._id) !== -1) {
        return true;
    }

    // Check the replies of comments
    for (let i = 0; i < post.commentIDs.length; i++) {
        const commentObj = findComment(post.commentIDs[i]);
        if (commentObj && findPost(commentObj, comment)) {
            return true;
        }
    }

    return false;
}

function findComment(commentId) {
    if (!commentId) return null;

    for (let i = 0; i < modelService.data.comments.length; i++) {
        const comment = modelService.data.comments[i];
        if (commentId === comment._id) {
            return comment;
        }
    }
    return null;
}