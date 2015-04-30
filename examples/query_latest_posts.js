// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")

var count = 1

Twister.getUser("avatarx").doLatestPostsUntil(function(post){
    if (count++==50) {return false;}
	console.log(post.getContent())
});