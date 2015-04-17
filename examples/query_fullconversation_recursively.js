
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

var goUpConversation = function (post) {
        
    if (post.isReply()) {

        post.doPostRepliedTo(goUpConversation);

    } else {

        doRepliesRecursive(post);

    }
}

var doRepliesRecursive = function (post) {
        
    console.log(post.getTimestamp()+": "+post.getContent());  
    post.doReplies(function(replies){
    
        replies.doPosts(doRepliesRecursive);
    
    });

};

Twister.getUser("kseistrup").doPost(3497,goUpConversation);