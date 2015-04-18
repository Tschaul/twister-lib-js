
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

Twister.getPromotedPosts().doLatestPosts(40,function(post){
    console.log(post.getTimestamp()+": "+post.getUsername()+": "+post.getContent());
});
