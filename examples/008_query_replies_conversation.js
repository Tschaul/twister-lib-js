/*
 * The same goes for replies. In the next code section first the "goUpConversation" method
 * recursively goes up the conversation thread to find the top post of a public conversation 
 * an displays the post. After that it calls the "doRepliesRecusrive" method that displays all 
 * its replies and the replies of the replies and so on... so in the end we have the full
 * conversation. The setTimeout function is to seperate the retwists request from the 
 * conversation request so their outputs do not overlapp
 */

Twister = require("../src/Twister.js")

Twister.setup({signatureVerification:"none"}); //,logfunc:function(log){console.log(log)}}

var goUpConversation = function (post) {
        
  if (post.isReply()) {

    post.doPostRepliedTo(goUpConversation);

  } else {

    console.log(post.getUsername()+": "+post.getContent())

    post.doReplies(doRepliesRecursive);

  }
  
}

var doRepliesRecursive = function (replies) {
          
  for (var i in replies) {
    replies[i].doReplies(doRepliesRecursive);
    console.log(replies[i].getUsername()+": "+replies[i].getContent())
  }

};

console.log("full conversation of black_puppydog:post729")

Twister.getUser("ulrichard").doPost(270,goUpConversation);
