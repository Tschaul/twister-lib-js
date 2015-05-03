/*
 * The same can be done with the promoted posts. The equivalent to the user object of the promoted 
 * posts can be accessed from the Twister object through getPromotedPosts().
 */

Twister = require("../src/Twister.js");

var count = 1;

Twister.getPromotedPosts().doLatestPostsUntil(function(post){
    console.log(post.getUsername()+": "+post.getContent());
	if(count++==20) { return false; }
});
