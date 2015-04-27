
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332'
});

var count = 1;

Twister.getPromotedPosts().doLatestPostsUntil(function(post){
    console.log(count+": "+post.getTimestamp()+": "+post.getUsername()+": "+post.getContent());
	if(count++==10) { 
      return false; 
    }
});
