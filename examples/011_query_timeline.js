/* 
 * To query the timeline (most recent posts) of user, twister-lib-js brings a utility function called
 * doLatestPostsUntil which is called with a callback function. This callback function will be called 
 * first with the latest post (the status) and then with the rest of the post in time reversed order 
 * (from new to old) as long as the callback function does not return false. If the callback function 
 * returns false the doLatestPostUntil function will stop querying. In the following example the 20 
 * most recent posts of a user are queried and printed out.
 */

Twister = require("../src/Twister.js")

var count = 1

Twister.getUser("avatarx").doLatestPostsUntil(function(post){
	console.log(post.getContent())
    if (count++==20) {return false;}
});