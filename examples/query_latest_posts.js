// For this to work twisterd must be running at localhost

Twister = require("../src/Twister.js")

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332'
});

var count = 1

Twister.getUser("avatarx").doLatestPostsUntil(function(post){
    if (count++==50) {return false;}
	console.log(post.getContent())
});