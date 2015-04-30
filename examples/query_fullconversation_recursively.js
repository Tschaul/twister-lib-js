
Twister = require("../src/Twister.js");


var goUpConversation = function (post) {
        
    if (post.isReply()) {

        post.doPostRepliedTo(goUpConversation);

    } else {
      
      console.log(post.getContent())

      post.doReplies(doRepliesRecursive);

    }
}

var doRepliesRecursive = function (replies) {
          
  for (var i in replies) {
    replies[i].doReplies(doRepliesRecursive);
    console.log(replies[i].getContent())
  }

};

Twister.getUser("black_puppydog").doPost(729,goUpConversation);