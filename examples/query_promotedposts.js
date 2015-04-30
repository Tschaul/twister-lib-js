
Twister = require("../src/Twister.js");

var count = 1;

Twister.getPromotedPosts().doLatestPostsUntil(function(post){
    console.log(count+": "+post.getTimestamp()+": "+post.getUsername()+": "+post.getContent());
	if(count++==10) { 
      return false; 
    }
});
