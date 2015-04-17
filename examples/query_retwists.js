
Twister = require("../src/Twister.js");

Twister.init({
    host: 'http://user:pwd@127.0.0.1:28332',
});

Twister.getUser("hn").doPost(13670,function(post){
    
    post.doRetwistingPosts(function(post){
    
        console.log(post.getTimestamp()+": "+post.getUsername());
    });

});